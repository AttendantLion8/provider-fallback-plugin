---
name: provider-analytics
description: Show provider usage analytics and performance metrics
arguments:
  - name: period
    description: Time period for analytics (1h, 24h, 7d, 30d, all)
    required: false
    default: "24h"
  - name: view
    description: View type (summary, providers, models, costs, errors)
    required: false
    default: "summary"
---

# Provider Analytics Command

Display comprehensive usage analytics for AI providers.

## Usage

```
/provider-analytics [period] [--view=<type>]
```

## Arguments

- `period`: Time period (1h, 24h, 7d, 30d, all)
- `--view`: View type (summary, providers, models, costs, errors)

## Instructions

When this command is invoked:

1. **Load Analytics Module**
   - Import from `{{PLUGIN_ROOT}}/lib/analytics.js`
   - Call `getSummary(period)` for the requested period

2. **Format Output Based on View**

   **summary** (default):
   ```
   📊 Provider Analytics - {period}
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   Total Requests: {count}
   Success Rate:   {rate}%
   Avg Latency:    {ms}ms
   Tokens Used:    {tokens}
   Est. Cost:      ${cost}
   Fallbacks:      {count}
   
   🏆 Top Providers:
   1. {provider} - {requests} req ({successRate}%)
   2. ...
   
   🤖 Top Models:
   1. {model} - {requests} requests
   2. ...
   ```

   **providers**:
   - Show `getProviderComparison()` results
   - Include success rate, latency, cost per provider

   **models**:
   - Show model-level statistics
   - Group by family

   **costs**:
   - Show `getCostAnalysis('provider')` results
   - Include cost per request breakdown

   **errors**:
   - Show recent errors from analytics
   - Include timestamps and error messages

3. **Handle No Data**
   - If no analytics data exists, show friendly message
   - Suggest running some requests first

## Examples

```
/provider-analytics          # Last 24h summary
/provider-analytics 7d       # Last 7 days
/provider-analytics --view=costs    # Cost breakdown
/provider-analytics 30d --view=providers  # Provider comparison
```

## Implementation Notes

Use the analytics module functions:
- `getSummary(period)` - Overview stats
- `getProviderComparison()` - Provider performance
- `getCostAnalysis(groupBy)` - Cost breakdown

Data is stored in `.data/analytics.json` within the plugin directory.
