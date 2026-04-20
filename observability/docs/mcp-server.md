# MCP Server

Theta includes a lightweight stdio MCP server for IDE and agent integrations:

```bash
python mcp/theta_observability_server.py
```

## Environment variables

- `THETA_BASE_URL`
- `THETA_API_KEY`
- `THETA_BEARER_TOKEN`
- `THETA_PROJECT_ID`

Use `THETA_API_KEY` for trace read/search tools. Use `THETA_BEARER_TOKEN` for control-plane tools like OTel export, threads, and monitors.

## Exposed tools

- `theta_list_traces`
- `theta_get_trace`
- `theta_search_traces`
- `theta_export_otel`
- `theta_list_threads`
- `theta_list_monitors`

The server speaks MCP over stdio with JSON-RPC framing and is intended for local IDE/agent workflows.
