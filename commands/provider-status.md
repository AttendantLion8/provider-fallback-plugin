---
name: provider-status
description: Show current provider usage statistics and availability
allowed_args:
  - name: provider
    type: string
    description: "Optional: Show detailed status for specific provider"
  - name: reset
    type: boolean
    description: "Reset usage counters (use with caution)"
---

# Provider Status Dashboard

Display comprehensive status of all configured providers including usage statistics, availability, and configuration.

## Usage

### Show All Providers

```
/provider-status
```

### Show Specific Provider

```
/provider-status anthropic
```

### Reset Usage Counters

```
/provider-status --reset
/provider-status anthropic --reset
```

## Output Format

```
╔══════════════════════════════════════════════════════════════╗
║                   PROVIDER STATUS DASHBOARD                   ║
╠══════════════════════════════════════════════════════════════╣
║ Active Provider: anthropic (Anthropic Direct)                ║
║ Default Model:   claude-sonnet-4-20250514                    ║
║ Auto-Switch:     Enabled                                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║ PRIORITY ORDER: anthropic → bedrock → vertex → openrouter   ║
║                                                              ║
╠════════════════╦═══════════╦═════════════════════════════════╣
║ Provider       ║ Status    ║ Usage                           ║
╠════════════════╬═══════════╬═════════════════════════════════╣
║ 1. anthropic   ║ ✓ Active  ║ Daily:   250K / 1M    (25%)    ║
║                ║           ║ Monthly: 2.5M / 10M   (25%)    ║
╠════════════════╬═══════════╬═════════════════════════════════╣
║ 2. bedrock     ║ ✓ Ready   ║ Daily:   0 / 5M       (0%)     ║
║                ║           ║ Monthly: 0 / 50M      (0%)     ║
╠════════════════╬═══════════╬═════════════════════════════════╣
║ 3. vertex      ║ ✗ No Key  ║ Not configured                  ║
╠════════════════╬═══════════╬═════════════════════════════════╣
║ 4. openrouter  ║ ⚠ Limited ║ Daily:   1.8M / 2M    (90%)    ║
║                ║           ║ Monthly: 18M / 20M    (90%)    ║
╚════════════════╩═══════════╩═════════════════════════════════╝
```

## Status Indicators

| Indicator | Meaning |
|-----------|---------|
| ✓ Active | Currently selected provider |
| ✓ Ready | Configured and has capacity |
| ⚠ Limited | Near usage limit (>80%) |
| ✗ Exhausted | Limit reached, will fallback |
| ✗ No Key | API key not configured |

## Implementation

```javascript
const { getStatus, loadUsage, loadConfig, PROVIDER_MODELS } = require('${CLAUDE_PLUGIN_ROOT}/lib/providers.js');

const status = getStatus();
const config = loadConfig();
const usage = loadUsage();

function formatTokens(count) {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 1000) return (count / 1000).toFixed(0) + 'K';
  return count.toString();
}

function getProgressBar(used, limit, width = 20) {
  if (limit === 0) return '█'.repeat(width) + ' (unlimited)';
  const percent = Math.min(100, (used / limit) * 100);
  const filled = Math.round((percent / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled) + ` ${percent.toFixed(0)}%`;
}

console.log('\n=== Provider Status ===\n');
console.log(`Priority: ${status.providerPriority.join(' → ')}`);
console.log(`Auto-switch: ${status.autoSwitch ? 'Enabled' : 'Disabled'}\n`);

for (const provider of status.providerPriority) {
  const info = status.providers[provider];
  const usageData = usage.providers[provider] || { dailyTokens: 0, monthlyTokens: 0 };
  const limits = config.usageLimits[provider] || { dailyTokens: 0, monthlyTokens: 0 };
  
  let statusIcon = info.available ? (info.configured ? '✓' : '✗') : '⚠';
  
  console.log(`${info.priority}. ${info.name} [${statusIcon}]`);
  console.log(`   Daily:   ${getProgressBar(usageData.dailyTokens, limits.dailyTokens)}`);
  console.log(`   Monthly: ${getProgressBar(usageData.monthlyTokens, limits.monthlyTokens)}`);
  console.log('');
}
```

## Notes

- Status updates in real-time as usage is tracked
- Reset clears usage counters but preserves configuration
- Use caution with reset - this action cannot be undone
