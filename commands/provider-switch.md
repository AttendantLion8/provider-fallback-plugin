---
name: provider-switch
description: Manually switch to a specific provider or enable/disable auto-switching
allowed_args:
  - name: provider
    type: string
    description: "Provider to switch to (anthropic, bedrock, vertex, openrouter)"
  - name: auto
    type: string
    description: "Enable or disable auto-switching (on/off)"
---

# Manual Provider Switch

Manually switch to a specific provider or control automatic fallback behavior.

## Usage

### Switch to Specific Provider

```
/provider-switch bedrock
/provider-switch vertex
/provider-switch anthropic
```

### Enable/Disable Auto-Switching

```
/provider-switch --auto on
/provider-switch --auto off
```

## Behavior

### Manual Switch

When manually switching to a provider:
1. Validates provider is configured (API key present)
2. Moves the selected provider to the top of the priority list
3. Updates active provider immediately
4. Logs the switch for auditing

### Auto-Switch Mode

| Mode | Behavior |
|------|----------|
| `on` (default) | Automatically switch to next provider when limits reached |
| `off` | Stay on current provider even if limits exceeded (may cause errors) |

## Implementation

```javascript
const { loadConfig, saveConfig, PROVIDER_MODELS } = require('${CLAUDE_PLUGIN_ROOT}/lib/providers.js');

const config = loadConfig();

// Handle auto-switch toggle
if (args.auto) {
  config.autoSwitch = args.auto.toLowerCase() === 'on';
  saveConfig(config);
  console.log(`Auto-switching ${config.autoSwitch ? 'enabled' : 'disabled'}`);
  return;
}

// Handle manual provider switch
const provider = args.provider?.toLowerCase();
if (!provider) {
  console.log('Current provider:', config.providerPriority[0]);
  console.log('Usage: /provider-switch <provider>');
  return;
}

if (!PROVIDER_MODELS[provider]) {
  console.error(`Unknown provider: ${provider}`);
  console.log('Available:', Object.keys(PROVIDER_MODELS).join(', '));
  return;
}

// Check if API key is configured
const envKey = PROVIDER_MODELS[provider].envKey;
if (!process.env[envKey]) {
  console.error(`Provider ${provider} not configured. Missing ${envKey}`);
  return;
}

// Move provider to top of priority list
const newPriority = [provider, ...config.providerPriority.filter(p => p !== provider)];
config.providerPriority = newPriority;
saveConfig(config);

console.log(`Switched to ${PROVIDER_MODELS[provider].name}`);
console.log(`New priority: ${newPriority.join(' → ')}`);
```

## Use Cases

### Temporary Provider Override

Switch to a specific provider for testing or cost optimization:

```
# Test Bedrock integration
/provider-switch bedrock

# ... do work ...

# Switch back to preferred provider
/provider-switch anthropic
```

### Disable Auto-Switch for Critical Work

Prevent unexpected switches during important operations:

```
/provider-switch --auto off

# ... critical work requiring consistent provider ...

/provider-switch --auto on
```

## Notes

- Manual switches persist across sessions
- Auto-switch respects manual provider selection (uses it as primary)
- Provider must have valid API key to switch to it
- Use `/provider-status` to see current active provider
