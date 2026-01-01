# Provider Fallback Plugin v2.3.0

AI provider fallback management for Claude Code/OpenCode with automatic failover, usage analytics, and MCP integration.

## Features

- **116 Models** across 14 families (Claude, GPT, Gemini, Antigravity, GLM, Llama, etc.)
- **25 Providers** with multi-auth support (subscription, OAuth, API key)
- **Automatic Fallback** when rate limits or quota exceeded
- **Usage Analytics** with provider comparison and cost tracking
- **MCP Server** for external integrations
- **Per-Project Settings** via `.opencode/provider-fallback.local.md`

## Quick Start

```bash
# Install plugin
cd ~/plugins/provider-fallback-plugin
node scripts/install.js

# Or use directly with Claude Code
claude --plugin-dir ~/plugins/provider-fallback-plugin
```

## Commands

| Command | Description |
|---------|-------------|
| `/provider-status` | Show current provider status and usage |
| `/provider-switch [provider]` | Switch to a different provider |
| `/provider-auth [provider]` | Configure authentication |
| `/provider-models [family]` | List available models |
| `/provider-priority [providers...]` | Set provider priority order |
| `/provider-limits [provider]` | Configure usage limits |
| `/provider-analytics [period]` | Show usage analytics |

## Provider Families

| Family | Providers | Auth Types |
|--------|-----------|------------|
| Anthropic | anthropic-subscription, anthropic-oauth, anthropic-api | All 3 |
| OpenAI | openai-subscription, openai-oauth, openai-api | All 3 |
| Google | google-subscription, google-oauth, google-api | All 3 |
| OpenCode | opencode-antigravity-auth | Token |
| AWS | bedrock | IAM |
| Azure | azure | API Key |
| GitHub | github-copilot | OAuth |
| Vertex | vertex, vertex-google | Service Account |
| OpenRouter | openrouter | API Key |
| Together | together | API Key |
| Groq | groq | API Key |
| xAI | xai-subscription, xai-api | Both |
| Mistral | mistral-api | API Key |
| DeepSeek | deepseek-api | API Key |
| Cohere | cohere-api | API Key |
| ZAI | zai-coding-plan | Token |
| Antigravity | antigravity | Token |

## Model Families

| Family | Models | Context | Capabilities |
|--------|--------|---------|--------------|
| Claude | 21 | 128K-200K | Text, Vision, Code |
| GPT | 39 | 8K-1M | Text, Vision, Code, Audio |
| Gemini | 26 | 32K-2M | Text, Vision, Code, Audio |
| Antigravity | 10 | 128K-200K | Text, Code, Thinking |
| GLM | 7 | 128K-1M | Text, Code |
| Llama | 3 | 128K | Text, Code |
| Mistral | 3 | 32K-128K | Text, Code |
| Grok | 3 | 128K-1M | Text, Vision |
| DeepSeek | 2 | 128K | Text, Code |
| Cohere | 1 | 128K | Text, RAG |
| Qwen | 1 | 128K | Text, Code |

## Usage Analytics

```bash
# View analytics dashboard
node scripts/show-analytics.js

# View with options
node scripts/show-analytics.js 7d --costs --compare

# Reset analytics
node scripts/reset-analytics.js --force
```

## MCP Server

```bash
# Start MCP server
node mcp/server.js

# Or with custom port
MCP_PORT=3848 node mcp/server.js
```

**Available Tools:**
- `provider.list` / `provider.active` / `provider.switch`
- `model.list` / `model.info`
- `analytics.summary` / `analytics.providers` / `analytics.costs`
- `auth.status` / `auth.check`

## Per-Project Configuration

Create `.opencode/provider-fallback.local.md`:

```yaml
---
default_model: claude-sonnet-4-20250514
auto_switch: true
priority_override:
  - opencode-antigravity-auth
  - anthropic-subscription
  - openai-subscription
daily_limit: 1000
monthly_limit: 25000
---
```

## Environment Variables

```bash
# Anthropic
ANTHROPIC_SUBSCRIPTION_KEY=...
ANTHROPIC_OAUTH_TOKEN=...
ANTHROPIC_API_KEY=...

# OpenAI
OPENAI_SUBSCRIPTION_KEY=...
OPENAI_OAUTH_TOKEN=...
OPENAI_API_KEY=...

# Google
GOOGLE_AI_SUBSCRIPTION=...
GOOGLE_OAUTH_TOKEN=...
GOOGLE_API_KEY=...

# OpenCode Antigravity
OPENCODE_ANTIGRAVITY_TOKEN=...
ANTIGRAVITY_AUTH_TOKEN=...
OC_ANTIGRAVITY_KEY=...

# AWS/Azure
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AZURE_OPENAI_API_KEY=...

# Others
OPENROUTER_API_KEY=...
TOGETHER_API_KEY=...
GROQ_API_KEY=...
XAI_API_KEY=...
MISTRAL_API_KEY=...
DEEPSEEK_API_KEY=...
COHERE_API_KEY=...
```

## File Structure

```
provider-fallback-plugin/
├── .opencode-plugin/
│   └── plugin.json           # Plugin manifest
├── agents/
│   └── provider-advisor.md   # Provider recommendation agent
├── commands/                 # 7 slash commands
├── hooks/
│   ├── hooks.json           # SessionStart + Notification hooks
│   └── scripts/             # Hook handler scripts
├── lib/
│   ├── analytics.js         # Usage tracking (13.3 KB)
│   ├── auth.js              # Authentication (14.1 KB)
│   ├── index.js             # Main export
│   ├── models.js            # 116 models (46.8 KB)
│   └── providers.js         # 25 providers (14.2 KB)
├── mcp/
│   ├── README.md            # MCP documentation
│   └── server.js            # MCP server
├── scripts/
│   ├── install.js           # Installation script
│   ├── show-analytics.js    # Analytics viewer
│   ├── reset-analytics.js   # Reset analytics
│   └── uninstall.js         # Uninstallation
├── skills/
│   └── provider-management/ # Skill documentation
├── templates/
│   └── provider-fallback.local.md
├── tests/
│   └── test.js              # Validation tests
├── package.json
└── README.md
```

## Testing

```bash
cd ~/plugins/provider-fallback-plugin
node tests/test.js
```

## License

MIT
