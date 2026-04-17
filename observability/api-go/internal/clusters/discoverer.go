package clusters

import (
	"context"
	"fmt"
	"log/slog"
	"math"
	"time"

	"github.com/theagi/theta-observability/api-go/internal/models"
	"github.com/theagi/theta-observability/api-go/internal/store"
)

// Discoverer runs unsupervised k-means clustering over trace embeddings
// and persists the resulting clusters to Postgres.
type Discoverer struct {
	Store        *store.Store
	AnthropicKey string
	Log          *slog.Logger
}

// DiscoverClusters fetches embeddings for the last 7 days, runs k-means, and
// upserts cluster rows + membership.
func (d *Discoverer) DiscoverClusters(ctx context.Context, projectID string) error {
	since := time.Now().UTC().Add(-7 * 24 * time.Hour)

	embeddings, err := d.Store.GetAllEmbeddings(ctx, projectID, since)
	if err != nil {
		return fmt.Errorf("fetch embeddings: %w", err)
	}
	d.Log.Info("fetched embeddings", "project", projectID, "count", len(embeddings))

	if len(embeddings) < 10 {
		d.Log.Info("too few embeddings, skipping clustering", "count", len(embeddings))
		return nil
	}

	// Build data matrix.
	data := make([][]float32, len(embeddings))
	traceIDs := make([]string, len(embeddings))
	for i, e := range embeddings {
		data[i] = e.Embedding
		traceIDs[i] = e.TraceID
	}

	// Determine k.
	k := len(embeddings) / 10
	if k < 3 {
		k = 3
	}
	if k > 20 {
		k = 20
	}

	assignments, centroids := kMeans(data, k, 50)
	d.Log.Info("k-means complete", "k", k, "n", len(data))

	// Group traces by cluster assignment.
	type clusterGroup struct {
		indices  []int
		centroid []float32
	}
	groups := make(map[int]*clusterGroup)
	for i, c := range assignments {
		g, ok := groups[c]
		if !ok {
			g = &clusterGroup{centroid: centroids[c]}
			groups[c] = g
		}
		g.indices = append(g.indices, i)
	}

	// Delete existing clusters for the project before creating new ones.
	if err := d.Store.DeleteClustersByProject(ctx, projectID); err != nil {
		return fmt.Errorf("delete old clusters: %w", err)
	}

	for clusterIdx, g := range groups {
		if len(g.indices) < 2 {
			continue
		}

		// Find the trace nearest to the centroid.
		bestIdx := g.indices[0]
		bestDist := math.MaxFloat64
		entries := make([]models.ClusterTraceEntry, 0, len(g.indices))
		for _, idx := range g.indices {
			dist := cosineDistance(data[idx], g.centroid)
			entries = append(entries, models.ClusterTraceEntry{
				TraceID:  traceIDs[idx],
				Distance: dist,
			})
			if dist < bestDist {
				bestDist = dist
				bestIdx = idx
			}
		}

		label := fmt.Sprintf("Cluster %d (%d traces)", clusterIdx, len(g.indices))
		category := "unknown"

		cluster, err := d.Store.CreateCluster(ctx, projectID, label, category, traceIDs[bestIdx], g.centroid)
		if err != nil {
			d.Log.Error("create cluster failed", "err", err)
			continue
		}

		if err := d.Store.AddTracesToCluster(ctx, cluster.ID, entries); err != nil {
			d.Log.Error("add traces to cluster failed", "cluster", cluster.ID, "err", err)
			continue
		}

		d.Log.Info("created cluster", "id", cluster.ID, "traces", len(entries))
	}

	return nil
}
