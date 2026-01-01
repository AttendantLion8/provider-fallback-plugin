---
name: provider-priority
description: Manage model provider priority order and automatic fallback settings
allowed_args:
  - name: action
    type: string
    description: "Action to perform: show, set, add, remove, move"
  - name: provider
    type: string
    description: "Provider name (anthropic, bedrock, vertex, openrouter)"
  - name: position
    type: number
    description: "Position in priority list (1 = highest priority)"
---

# Provider Priority Management

Manage the priority order for model providers. When usage limits are reached on one provider, automatically switch to the next provider in the priority list.

## Actions

### Show Current Priority (`/provider-priority show` or just `/provider-priority`)

Display the current provider priority order along with usage status.

### Set Priority Order (`/provider-priority set <providers>`)

Set the complete priority order. Providers should be comma-separated.

Example: `/provider-priority set anthropic,bedrock,vertex`

### Add Provider (`/provider-priority add <provider> [position]`)

Add a provider to the priority list at a specific position (default: end).

### Remove Provider (`/provider-priority remove <provider>`)

Remove a provider from the priority list (does not delete configuration).

### Move Provider (`/provider-priority move <provider> <position>`)

Move a provider to a new position in the priority list.

## Available Providers

| Provider | Description | Environment Variable |
|----------|-------------|---------------------|
| `anthropic` | Anthropic Direct API | `ANTHROPIC_API_KEY` |
| `bedrock` | AWS Bedrock | `AWS_ACCESS_KEY_ID` |
| `vertex` | Google Vertex AI | `GOOGLE_APPLICATION_CREDENTIALS` |
| `openrouter` | OpenRouter | `OPENROUTER_API_KEY` |

## Implementation

When this command is invoked:

1. Parse the action and arguments
2. Load current configuration from `~/.opencode/provider-fallback/config.json`
3. Execute the requested action
4. Save updated configuration
5. Display the result with usage statistics

### Show Action Implementation

```javascript
const { getStatus } = require('${CLAUDE_PLUGIN_ROOT}/lib/providers.js');
const status = getStatus();

console.log('\n=== Provider Priority ===\n');
console.log('Order:', status.providerPriority.join(' → '));
console.log('Auto-switch:', status.autoSwitch ? 'Enabled' : 'Disabled');
console.log('\n=== Provider Status ===\n');

for (const [id, provider] of Object.entries(status.providers)) {
  console.log(`${provider.priority}. ${provider.name} (${id})`);
  console.log(`   Configured: ${provider.configured ? '✓' : '✗'}`);
  console.log(`   Daily: ${provider.usage.daily}`);
  console.log(`   Monthly: ${provider.usage.monthly}`);
  console.log(`   Available: ${provider.available ? '✓' : '✗ (limit reached)'}`);
  console.log('');
}
```

### Set Priority Action

```javascript
const { setProviderPriority, getStatus } = require('${CLAUDE_PLUGIN_ROOT}/lib/providers.js');

const providers = args.provider.split(',').map(p => p.trim().toLowerCase());
const validProviders = ['anthropic', 'bedrock', 'vertex', 'openrouter'];
const invalid = providers.filter(p => !validProviders.includes(p));

if (invalid.length > 0) {
  console.error('Invalid providers:', invalid.join(', '));
  process.exit(1);
}

setProviderPriority(providers);
console.log('Priority updated:', providers.join(' → '));
```

## Notes

- Providers without configured API keys will be skipped during fallback
- Usage limits are configurable per-provider with `/provider-limits`
- Use `/provider-status` for detailed usage statistics
