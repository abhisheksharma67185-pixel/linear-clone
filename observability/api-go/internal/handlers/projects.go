package handlers

import (
	"encoding/json"
	"net/http"
	"sort"
	"strconv"
	"strings"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/bq"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
	"github.com/go-chi/chi/v5"
)

type Projects struct {
	Store *store.Store
	BQ    *bq.Writer
}

// POST /v1/projects — create a project in an org the user belongs to.
func (h *Projects) Create(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	var req models.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.OrgID == "" || req.Name == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "org_id and name required")
		return
	}
	if req.Slug == "" {
		req.Slug = slugify(req.Name)
	}
	if !contains(uc.Orgs, req.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}
	p, err := h.Store.CreateProject(r.Context(), req.OrgID, req.Name, req.Slug, req.Description, uc.UserID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, p)
}

// GET /v1/projects?org_id=...
func (h *Projects) List(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	orgID := r.URL.Query().Get("org_id")
	if orgID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "org_id required")
		return
	}
	if !contains(uc.Orgs, orgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}
	ps, err := h.Store.ListProjects(r.Context(), orgID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": ps})
}

// GET /v1/projects/:id
func (h *Projects) Get(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	id := chi.URLParam(r, "id")
	p, err := h.Store.GetProject(r.Context(), id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if p == nil {
		writeErr(w, http.StatusNotFound, "not_found", "project not found")
		return
	}
	if !contains(uc.Orgs, p.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}
	writeJSON(w, http.StatusOK, p)
}

// PATCH /v1/projects/:id
func (h *Projects) Patch(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	id := chi.URLParam(r, "id")
	project, err := h.Store.GetProject(r.Context(), id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if project == nil {
		writeErr(w, http.StatusNotFound, "not_found", "project not found")
		return
	}
	if !contains(uc.Orgs, project.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}

	var req models.UpdateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.Name == nil && req.Slug == nil && req.Description == nil && req.RetentionDays == nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "at least one field must be provided")
		return
	}
	if req.RetentionDays != nil && *req.RetentionDays <= 0 {
		writeErr(w, http.StatusBadRequest, "bad_request", "retention_days must be greater than 0")
		return
	}
	updated, err := h.Store.UpdateProject(
		r.Context(),
		id,
		req.Name,
		req.Slug,
		req.Description,
		req.RetentionDays,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if updated == nil {
		writeErr(w, http.StatusNotFound, "not_found", "project not found")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

// GET /v1/projects/:id/metadata-fields
func (h *Projects) MetadataFields(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	projectID := chi.URLParam(r, "id")
	project, err := h.Store.GetProject(r.Context(), projectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if project == nil {
		writeErr(w, http.StatusNotFound, "not_found", "project not found")
		return
	}
	if !contains(uc.Orgs, project.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}
	if h.BQ == nil {
		writeJSON(w, http.StatusOK, models.MetadataFieldListResponse{
			Items:         []models.MetadataField{},
			SampledTraces: 0,
		})
		return
	}

	sampleLimit := 200
	if raw := strings.TrimSpace(r.URL.Query().Get("sample_limit")); raw != "" {
		n, err := strconv.Atoi(raw)
		if err != nil || n <= 0 {
			writeErr(w, http.StatusBadRequest, "bad_request", "sample_limit must be a positive integer")
			return
		}
		if n > 500 {
			n = 500
		}
		sampleLimit = n
	}

	items, _, err := h.BQ.ListTraces(r.Context(), bq.ListFilters{
		ProjectID: projectID,
		Limit:     sampleLimit,
	})
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "query_failed", err.Error())
		return
	}
	fields := discoverMetadataFields(items)
	writeJSON(w, http.StatusOK, models.MetadataFieldListResponse{
		Items:         fields,
		SampledTraces: len(items),
	})
}

type metadataFieldAccumulator struct {
	valueTypes  map[string]struct{}
	occurrences int
	examples    []string
}

func discoverMetadataFields(items []models.TraceListItem) []models.MetadataField {
	acc := map[string]*metadataFieldAccumulator{}
	for _, item := range items {
		if len(item.Metadata) == 0 {
			continue
		}
		var payload any
		if err := json.Unmarshal(item.Metadata, &payload); err != nil {
			continue
		}
		walkMetadataFields(acc, "", payload)
	}

	fields := make([]models.MetadataField, 0, len(acc))
	for key, entry := range acc {
		valueTypes := make([]string, 0, len(entry.valueTypes))
		for valueType := range entry.valueTypes {
			valueTypes = append(valueTypes, valueType)
		}
		sort.Strings(valueTypes)
		valueType := "mixed"
		if len(valueTypes) == 1 {
			valueType = valueTypes[0]
		}
		examples := append([]string(nil), entry.examples...)
		sort.Strings(examples)
		fields = append(fields, models.MetadataField{
			Key:           key,
			ValueType:     valueType,
			Occurrences:   entry.occurrences,
			ExampleValues: examples,
		})
	}

	sort.Slice(fields, func(i, j int) bool {
		if fields[i].Occurrences == fields[j].Occurrences {
			return fields[i].Key < fields[j].Key
		}
		return fields[i].Occurrences > fields[j].Occurrences
	})
	return fields
}

func walkMetadataFields(
	acc map[string]*metadataFieldAccumulator,
	prefix string,
	value any,
) {
	switch typed := value.(type) {
	case map[string]any:
		for key, inner := range typed {
			path := key
			if prefix != "" {
				path = prefix + "." + key
			}
			walkMetadataFields(acc, path, inner)
		}
	case []any:
		for _, inner := range typed {
			if _, ok := inner.(map[string]any); ok {
				walkMetadataFields(acc, prefix, inner)
				continue
			}
			recordMetadataField(acc, prefix, inner)
		}
	default:
		recordMetadataField(acc, prefix, typed)
	}
}

func recordMetadataField(
	acc map[string]*metadataFieldAccumulator,
	key string,
	value any,
) {
	key = strings.TrimSpace(key)
	if key == "" {
		return
	}
	entry := acc[key]
	if entry == nil {
		entry = &metadataFieldAccumulator{valueTypes: map[string]struct{}{}}
		acc[key] = entry
	}
	entry.occurrences++
	entry.valueTypes[metadataValueType(value)] = struct{}{}
	if example, ok := metadataExampleValue(value); ok {
		for _, existing := range entry.examples {
			if existing == example {
				return
			}
		}
		if len(entry.examples) < 6 {
			entry.examples = append(entry.examples, example)
		}
	}
}

func metadataValueType(value any) string {
	switch value.(type) {
	case bool:
		return "boolean"
	case float64, float32, int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
		return "number"
	case nil:
		return "null"
	default:
		return "string"
	}
}

func metadataExampleValue(value any) (string, bool) {
	switch typed := value.(type) {
	case nil:
		return "", false
	case string:
		trimmed := strings.TrimSpace(typed)
		if trimmed == "" {
			return "", false
		}
		return trimmed, true
	case bool:
		if typed {
			return "true", true
		}
		return "false", true
	case float64:
		return strconv.FormatFloat(typed, 'f', -1, 64), true
	case float32:
		return strconv.FormatFloat(float64(typed), 'f', -1, 32), true
	case int:
		return strconv.Itoa(typed), true
	case int8:
		return strconv.FormatInt(int64(typed), 10), true
	case int16:
		return strconv.FormatInt(int64(typed), 10), true
	case int32:
		return strconv.FormatInt(int64(typed), 10), true
	case int64:
		return strconv.FormatInt(typed, 10), true
	case uint:
		return strconv.FormatUint(uint64(typed), 10), true
	case uint8:
		return strconv.FormatUint(uint64(typed), 10), true
	case uint16:
		return strconv.FormatUint(uint64(typed), 10), true
	case uint32:
		return strconv.FormatUint(uint64(typed), 10), true
	case uint64:
		return strconv.FormatUint(typed, 10), true
	default:
		return "", false
	}
}

func contains(xs []string, v string) bool {
	for _, x := range xs {
		if x == v {
			return true
		}
	}
	return false
}
