---
name: provider-limits
description: Configure usage limits for each provider to trigger automatic fallback
allowed_args:
  - name: provider
    type: string
    description: "Provider name (anthropic, bedrock, vertex, openrouter)"
  - name: daily
    type: string
    description: "Daily token limit (e.g., 1M, 500K, 1000000)"
  - name: monthly
    type: string
    description: "Monthly token limit (e.g., 10M, 5M, 10000000)"
---

# Provider Usage Limits Configuration

Configure token usage limits for each provider. When a provider reaches its limit, the system automatically switches to the next provider in the priority list.

## Usage

### View All Limits

```
/provider-limits
```

### Set Limits for a Provider

```
/provider-limits <provider> --daily <limit> --monthly <limit>
```

### Examples

```
# Set Anthropic limits to 1M daily, 10M monthly
/provider-limits anthropic --daily 1M --monthly 10M

# Set Bedrock with higher limits
/provider-limits bedrock --daily 5M --monthly 50M

# Set OpenRouter limits
/provider-limits openrouter --daily 500K --monthly 5M
```

## Limit Format

Limits can be specified in multiple formats:

| Format | Example | Value |
|--------|---------|-------|
| Raw number | `1000000` | 1,000,000 tokens |
| K suffix | `500K` | 500,000 tokens |
| M suffix | `1M` | 1,000,000 tokens |
| Unlimited | `0` or `unlimited` | No limit |

## Implementation

When this command is invoked:

1. Parse provider and limit arguments
2. Convert limit strings to numbers
3. Update configuration in `~/.opencode/provider-fallback/config.json`
4. Display updated limits

### Parse Limit Helper

```javascript
function parseLimit(value) {
  if (!value || value === 'unlimited') return 0;
  
  const str = value.toString().toUpperCase();
  
  if (str.endsWith('M')) {
    return parseFloat(str) * 1000000;
  } else if (str.endsWith('K')) {
    return parseFloat(str) * 1000;
  }
  
  return parseInt(str, 10);
}
```

### Display Current Limits

```javascript
const { loadConfig } = require('${CLAUDE_PLUGIN_ROOT}/lib/providers.js');
const config = loadConfig();

console.log('\n=== Provider Usage Limits ===\n');

for (const [provider, limits] of Object.entries(config.usageLimits)) {
  const daily = limits.dailyTokens === 0 ? 'Unlimited' : limits.dailyTokens.toLocaleString();
  const monthly = limits.monthlyTokens === 0 ? 'Unlimited' : limits.monthlyTokens.toLocaleString();
  
  console.log(`${provider}:`);
  console.log(`  Daily:   ${daily} tokens`);
  console.log(`  Monthly: ${monthly} tokens`);
  console.log('');
}
```

## Recommended Limits

Based on typical provider pricing and quotas:

| Provider | Suggested Daily | Suggested Monthly | Notes |
|----------|----------------|-------------------|-------|
| anthropic | 1M | 10M | Direct API, per-token billing |
| bedrock | 5M | 50M | AWS account limits apply |
| vertex | 5M | 50M | GCP project limits apply |
| openrouter | 2M | 20M | Credit-based, varies by model |

## Notes

- Setting a limit to `0` or `unlimited` disables the limit check
- Limits are tracked separately for daily and monthly usage
- Daily counters reset at midnight (local time)
- Monthly counters reset on the 1st of each month
- Use `/provider-status` to see current usage against limits
