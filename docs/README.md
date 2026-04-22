# ThetaBench Documentation

Welcome to the ThetaBench documentation. ThetaBench is a scalable platform for training and evaluating autonomous web agents on deterministic website simulations.

## Documentation Index

| Document | Description | Audience |
|----------|-------------|----------|
| [Getting Started](getting-started.md) | Installation, first run, and quick examples | Everyone |
| [Architecture](architecture.md) | System design, monorepo structure, data flow | Contributors, maintainers |
| [Core Engine Reference](core-engine.md) | TypeScript engine: episodes, snapshots, evaluation, curriculum | Contributors |
| [Python SDK Reference](sdk-reference.md) | `ThetaBenchEnv`, `ThetaBenchClient`, `BatchRunner`, `CurriculumRunner`, CLI | Agent developers |
| [REST API Reference](api-reference.md) | Every HTTP endpoint with request/response schemas | Agent developers |
| [Evaluation & Scoring](evaluation.md) | Check types, LLM judge, reward shaping, scoring formula | Researchers |
| [Task Authoring Guide](task-authoring.md) | How to write task definitions with eval checks | Task authors |
| [Site Plugin Guide](site-plugin-guide.md) | How to add a new simulated website to ThetaBench | Site contributors |
| [Deployment Guide](deployment.md) | Docker, Vercel, local dev, environment config | DevOps, self-hosters |

## Quick Links

- **15-minute integration guide**: [FOR-AI-LABS.md](../FOR-AI-LABS.md)
- **How it works (overview)**: [HOW-IT-WORKS.md](../HOW-IT-WORKS.md)
- **Product specification**: [PRODUCT-SPEC.md](../PRODUCT-SPEC.md)
- **Research paper**: [paper/thetabench-paper.md](../paper/thetabench-paper.md)

## Current Stats

| Metric | Value |
|--------|-------|
| Sites | 3 complete (Shopify Admin, Linear, Jira) + 1 in development (Slack) |
| Total tasks | 264 |
| Curriculum stages | 10 |
| Task types | 4 (action, retrieval, action_retrieval, no_action) |
| Interaction modes | 2 (REST at 1-5ms/step, Browser via Playwright) |
| Python SDK | Gymnasium-compatible |
| License | MIT |
