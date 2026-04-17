# Theta Observability — developer Makefile.
#
# Run from the repo root:   make -C observability obs-dev
# Or from this directory:   make obs-dev

COMPOSE      ?= docker compose
COMPOSE_FILE ?= docker-compose.dev.yml
API_URL      ?= http://localhost:8080
PG_DSN       ?= postgres://theta:theta@localhost:5432/theta_obs?sslmode=disable

.PHONY: obs-dev obs-down obs-migrate obs-seed obs-logs obs-ps obs-restart

## obs-dev: Bring up the full local stack (postgres, gcs, bq, api, dashboard).
obs-dev:
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --build
	@echo ""
	@echo "Theta Observability dev stack is up:"
	@echo "  Dashboard : http://localhost:3100"
	@echo "  API       : $(API_URL)"
	@echo "  Postgres  : postgres://theta:theta@localhost:5432/theta_obs"
	@echo "  fake-gcs  : http://localhost:4443  (bucket: theta-obs-dev)"
	@echo "  BigQuery  : http://localhost:9050  (project: theta-obs-dev, dataset: theta_observability)"
	@echo ""
	@echo "Next: make obs-seed"

## obs-down: Stop and remove all stack containers. Volumes are preserved.
obs-down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

## obs-migrate: Re-run goose up against the local postgres.
obs-migrate:
	$(COMPOSE) -f $(COMPOSE_FILE) run --rm migrate up

## obs-seed: Create a seed org + project + API key by calling the API.
##           Override defaults: make obs-seed SEED_EMAIL=admin@example.com SEED_ORG=my-org SEED_PROJECT=my-project
SEED_EMAIL   ?= admin@localhost
SEED_PASSWORD ?= changeme-$(shell date +%s)
SEED_NAME    ?= Admin
SEED_ORG     ?= my-org
SEED_PROJECT ?= default
obs-seed:
	@echo "Seeding Theta Observability..."
	@curl -fsS -X POST $(API_URL)/v1/signup \
		-H 'content-type: application/json' \
		-d '{"email":"$(SEED_EMAIL)","password":"$(SEED_PASSWORD)","name":"$(SEED_NAME)"}' \
		> /tmp/theta-obs-signup.json || (echo "signup failed"; exit 1)
	@TOKEN=$$(jq -r .token /tmp/theta-obs-signup.json) ; \
		curl -fsS -X POST $(API_URL)/v1/orgs \
			-H "authorization: Bearer $$TOKEN" \
			-H 'content-type: application/json' \
			-d '{"name":"$(SEED_ORG)","slug":"$(SEED_ORG)"}' > /tmp/theta-obs-org.json ; \
		ORG_ID=$$(jq -r .id /tmp/theta-obs-org.json) ; \
		curl -fsS -X POST $(API_URL)/v1/projects \
			-H "authorization: Bearer $$TOKEN" \
			-H 'content-type: application/json' \
			-d "{\"org_id\":\"$$ORG_ID\",\"name\":\"$(SEED_PROJECT)\",\"slug\":\"$(SEED_PROJECT)\"}" > /tmp/theta-obs-project.json ; \
		PROJECT_ID=$$(jq -r .id /tmp/theta-obs-project.json) ; \
		curl -fsS -X POST $(API_URL)/v1/projects/$$PROJECT_ID/keys \
			-H "authorization: Bearer $$TOKEN" \
			-H 'content-type: application/json' \
			-d '{"name":"local-dev"}' > /tmp/theta-obs-key.json ; \
		echo "" ; \
		echo "Seeded:" ; \
		echo "  Org        : $$ORG_ID (slug: $(SEED_ORG))" ; \
		echo "  Project    : $$PROJECT_ID (slug: $(SEED_PROJECT))" ; \
		echo "  API Key    : $$(jq -r .key /tmp/theta-obs-key.json)" ; \
		echo "" ; \
		echo "Try it: export THETA_API_KEY=\$$(jq -r .key /tmp/theta-obs-key.json)"

## obs-logs: Tail logs from all stack services (Ctrl-C to exit).
obs-logs:
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f --tail=200

## obs-ps: Show status of stack services.
obs-ps:
	$(COMPOSE) -f $(COMPOSE_FILE) ps

## obs-restart: Restart the api + dashboard services.
obs-restart:
	$(COMPOSE) -f $(COMPOSE_FILE) restart api dashboard
