---
name: provider-auth
description: Configure authentication for providers (OAuth, subscription, API keys)
allowed_args:
  - name: action
    type: string
    description: "Action: status, setup, oauth, remove, refresh"
  - name: provider
    type: string
    description: "Provider ID (e.g., anthropic-api, google-oauth, openai-subscription)"
  - name: key
    type: string
    description: "API key or token to set"
---

# Provider Authentication Configuration

Configure authentication methods for all supported providers. Supports three auth types with automatic priority:

| Priority | Type | Description |
|----------|------|-------------|
| 100 | **Subscription** | Pro/Plus/Max subscriptions (highest priority) |
| 50 | **OAuth** | OAuth 2.0 tokens (Antigravity-style) |
| 10 | **API** | Direct API keys (lowest priority) |

## Usage

### View Auth Status

```
/provider-auth status
/provider-auth status anthropic
```

Shows all configured providers grouped by vendor with auth type and status.

### Set API Key

```
/provider-auth setup anthropic-api --key sk-ant-...
/provider-auth setup openai-api --key sk-...
/provider-auth setup google-api --key AIza...
```

### Configure OAuth (Antigravity-style)

```
/provider-auth oauth google-oauth
/provider-auth oauth anthropic-oauth
/provider-auth oauth openai-oauth
```

This will:
1. Prompt for OAuth client ID and secret
2. Start local callback server on port 19284
3. Open browser for authorization
4. Exchange code for tokens
5. Store tokens securely

### Set Subscription Token

```
/provider-auth setup anthropic-subscription --key <session-token>
/provider-auth setup openai-subscription --key <session-token>
/provider-auth setup google-subscription --key <session-token>
```

### Refresh OAuth Tokens

```
/provider-auth refresh google-oauth
/provider-auth refresh anthropic-oauth
```

### Remove Credentials

```
/provider-auth remove anthropic-api
/provider-auth remove google-oauth
```

## Provider IDs

### Anthropic
| ID | Type | Auth Method |
|----|------|-------------|
| `anthropic-subscription` | Subscription | Claude Pro/Max session token |
| `anthropic-oauth` | OAuth | OAuth 2.0 flow |
| `anthropic-api` | API | API key from console.anthropic.com |

### OpenAI
| ID | Type | Auth Method |
|----|------|-------------|
| `openai-subscription` | Subscription | ChatGPT Plus/Pro session |
| `openai-oauth` | OAuth | OAuth 2.0 flow |
| `openai-api` | API | API key from platform.openai.com |

### Google
| ID | Type | Auth Method |
|----|------|-------------|
| `google-subscription` | Subscription | Google One AI Premium |
| `google-oauth` | OAuth | GCP OAuth (Antigravity-style) |
| `google-api` | API | API key from aistudio.google.com |

### Cloud Providers
| ID | Type | Auth Method |
|----|------|-------------|
| `bedrock` | API | AWS credentials |
| `vertex` | API | GCP service account |
| `vertex-google` | API | GCP for Gemini |
| `azure` | API | Azure OpenAI endpoint + key |

### Other
| ID | Type | Auth Method |
|----|------|-------------|
| `openrouter` | API | OpenRouter API key |
| `xai-subscription` | Subscription | X Premium+ |
| `xai-api` | API | xAI API key |
| `together` | API | Together AI key |
| `groq` | API | Groq API key |
| `mistral-api` | API | Mistral AI key |
| `deepseek-api` | API | DeepSeek key |
| `cohere-api` | API | Cohere key |

## Environment Variables

You can also configure providers via environment variables:

```bash
# Anthropic
export ANTHROPIC_API_KEY=sk-ant-...
export ANTHROPIC_SESSION_TOKEN=...

# OpenAI
export OPENAI_API_KEY=sk-...
export OPENAI_SESSION_TOKEN=...

# Google
export GOOGLE_API_KEY=AIza...
export GEMINI_API_KEY=AIza...
export GOOGLE_AI_SESSION=...

# AWS Bedrock
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1

# Google Cloud
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
export GOOGLE_CLOUD_PROJECT=my-project

# Others
export OPENROUTER_API_KEY=...
export XAI_API_KEY=...
export TOGETHER_API_KEY=...
export GROQ_API_KEY=...
export MISTRAL_API_KEY=...
export DEEPSEEK_API_KEY=...
export COHERE_API_KEY=...
```

## Implementation

```javascript
const auth = require('${CLAUDE_PLUGIN_ROOT}/lib/auth.js');

// Show status
const status = auth.getAuthStatus();
const byVendor = auth.getProvidersByVendor();

// Set API key
auth.setProviderCredentials('anthropic-api', { apiKey: 'sk-ant-...' });

// Start OAuth flow
const { authUrl, state } = auth.startOAuthFlow('google-oauth', clientId, clientSecret);
console.log('Open in browser:', authUrl);
const tokens = await auth.startCallbackServer('google-oauth');

// Get best provider for a vendor (subscription > oauth > api)
const best = auth.getBestProviderForVendor('anthropic');
console.log('Best Anthropic provider:', best.id, best.type);
```

## Security Notes

- Credentials stored in `~/.claude/provider-fallback/auth.json` with 0600 permissions
- OAuth tokens in `~/.claude/provider-fallback/tokens.json`
- Environment variables take precedence over stored credentials
- OAuth tokens auto-refresh when within 60 seconds of expiry
