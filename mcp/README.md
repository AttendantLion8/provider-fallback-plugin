# Provider Fallback MCP Configuration
# Add this to your .mcp.json or mcp settings

This plugin provides an MCP server for external integrations.

## Quick Start

```bash
# Start the MCP server
cd ~/plugins/provider-fallback-plugin
node mcp/server.js

# Or with custom port
MCP_PORT=3848 node mcp/server.js
```

## Configuration

Add to your `.mcp.json`:

```json
{
  "servers": {
    "provider-fallback": {
      "type": "http",
      "url": "http://localhost:3847",
      "description": "Provider Fallback Plugin - AI provider management"
    }
  }
}
```

## Available Tools

### Provider Management

| Tool | Description |
|------|-------------|
| `provider.list` | List all providers with status |
| `provider.active` | Get currently active provider |
| `provider.switch` | Switch to a different provider |

### Model Information

| Tool | Description |
|------|-------------|
| `model.list` | List available models |
| `model.info` | Get model details |

### Analytics

| Tool | Description |
|------|-------------|
| `analytics.summary` | Usage summary |
| `analytics.providers` | Provider comparison |
| `analytics.costs` | Cost analysis |

### Authentication

| Tool | Description |
|------|-------------|
| `auth.status` | Auth status for all providers |
| `auth.check` | Check specific provider auth |

## API Endpoints

```
GET  /health     - Health check
GET  /tools      - List all tools
POST /execute    - Execute a tool
GET  /tool/:name - Execute via GET
```

## Example Usage

```bash
# Health check
curl http://localhost:3847/health

# List tools
curl http://localhost:3847/tools

# Execute tool
curl -X POST http://localhost:3847/execute \
  -H "Content-Type: application/json" \
  -d '{"tool": "provider.list", "params": {}}'

# Get via URL
curl "http://localhost:3847/tool/provider/list?family=anthropic"
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_PORT` | 3847 | Server port |
| `MCP_HOST` | localhost | Server host |
