---
name: provider-setup
description: Interactive setup wizard for complete provider configuration
allowed_args:
  - name: status
    type: boolean
    description: "Show current setup status only"
  - name: group
    type: string
    description: "Setup specific group (anthropic, openai, google, cloud, xai, aggregators, specialty)"
  - name: priority
    type: boolean
    description: "Configure priority order only"
  - name: reset
    type: boolean
    description: "Reset all provider configurations"
---

# Provider Setup Wizard

Interactive wizard that guides you through complete provider configuration. Auto-detects credentials from environment variables, detects installed addon plugins, and helps configure all providers.

## Usage

### Run Complete Setup Wizard

```
/provider-setup
```

### View Current Setup Status

```
/provider-setup --status
```

### Setup Specific Provider Group

```
/provider-setup --group anthropic
/provider-setup --group cloud
```

### Configure Priority Only

```
/provider-setup --priority
```

## What This Wizard Does

1. **Auto-detects** credentials from environment variables
2. **Detects** installed addon plugins (oh-my-opencode, etc.)
3. **Lists** all available agents including from addons
4. **Guides** through setting up each provider group
5. **Configures** provider priority order
6. **Validates** all credentials

## Provider Groups

| Group | Providers |
|-------|-----------|
| **Anthropic** | anthropic-subscription, anthropic-oauth, anthropic-api |
| **OpenAI** | openai-subscription, openai-oauth, openai-api |
| **Google** | google-subscription, google-oauth, google-api |
| **Cloud** | bedrock, vertex, vertex-google, azure |
| **xAI** | xai-subscription, xai-api |
| **Aggregators** | openrouter, together, groq |
| **Specialty** | github-copilot, mistral-api, deepseek-api, cohere-api, etc. |

## Implementation

When this command is invoked, the assistant should:

### Step 1: Load Setup State

```javascript
import { generateWizardData, getSetupSummary } from '${CLAUDE_PLUGIN_ROOT}/lib/setup-wizard.js';

const data = generateWizardData();
const summary = data.summary;
```

### Step 2: Display Current Status

Display this status overview:

```
╔═══════════════════════════════════════════════════════════════════════╗
║                    PROVIDER FALLBACK SETUP WIZARD                      ║
╠═══════════════════════════════════════════════════════════════════════╣
║ Plugin Version: 2.5.0                                                  ║
╠═══════════════════════════════════════════════════════════════════════╣
║                           CURRENT STATUS                               ║
╠═════════════════════════════╦═════════════════════════════════════════╣
║ Total Providers             ║ ${summary.stats.totalProviders}                                     ║
║ Configured (from config)    ║ ${summary.stats.fromConfig}                                      ║
║ Configured (from env vars)  ║ ${summary.stats.fromEnvironment}                                      ║
║ Unconfigured               ║ ${summary.stats.unconfigured}                                     ║
╠═════════════════════════════╬═════════════════════════════════════════╣
║ Installed Plugins           ║ ${summary.stats.installedPlugins}                                      ║
║ Available Agents            ║ ${summary.stats.availableAgents}                                     ║
╚═════════════════════════════╩═════════════════════════════════════════╝
```

### Step 3: Show Detected Environment Variables

For each provider with env vars detected:

```
✓ Environment Variables Detected:

  Anthropic:
    • ANTHROPIC_API_KEY: sk-a...xyz4 (configured)
  
  OpenAI:
    • OPENAI_API_KEY: sk-o...abc1 (configured)
  
  AWS Bedrock:
    • AWS_ACCESS_KEY_ID: AKIA...WXYZ (configured)
    • AWS_SECRET_ACCESS_KEY: ***...*** (configured)
    • AWS_REGION: us-east-1 (configured)
```

### Step 4: Show Installed Addon Plugins

```
✓ Detected Addon Plugins:

  1. oh-my-opencode (latest)
     └─ Agents: Planner-Sisyphus, oracle, librarian, explore
  
  2. opencode-antigravity-auth (1.2.6)
     └─ Provider: opencode-antigravity-auth
  
  3. opencode-openai-codex-auth (4.2.0)
     └─ Provider: openai-codex
```

### Step 5: Walk Through Provider Groups

For each group, show status and offer to configure:

```
═══════════════════════════════════════════════════════════════════════
                        ANTHROPIC (Claude)
═══════════════════════════════════════════════════════════════════════

Claude AI models from Anthropic

┌─────────────────────────┬────────────┬──────────────────────────────┐
│ Provider                │ Status     │ Configuration                │
├─────────────────────────┼────────────┼──────────────────────────────┤
│ anthropic-subscription  │ ✗ Not Set  │ Requires: Session Token      │
│ anthropic-oauth         │ ✗ Not Set  │ Requires: Client ID/Secret   │
│ anthropic-api           │ ✓ From Env │ ANTHROPIC_API_KEY detected   │
└─────────────────────────┴────────────┴──────────────────────────────┘

Would you like to configure any Anthropic providers? (y/n)
```

### Step 6: Collect Credentials

For each provider the user wants to configure, collect required fields:

```javascript
import { getProviderRequiredFields, saveProviderSetup } from '${CLAUDE_PLUGIN_ROOT}/lib/setup-wizard.js';

const fields = getProviderRequiredFields('anthropic-subscription');
// Returns:
// {
//   providerId: 'anthropic-subscription',
//   providerName: 'Anthropic (Subscription)',
//   type: 'subscription',
//   fields: [
//     { key: 'sessionToken', label: 'Session Token', sensitive: true, envHint: 'ANTHROPIC_SESSION_TOKEN' }
//   ]
// }

// After collecting from user:
saveProviderSetup('anthropic-subscription', { sessionToken: 'user-provided-token' });
```

### Step 7: Configure Priority Order

```
═══════════════════════════════════════════════════════════════════════
                       PROVIDER PRIORITY ORDER
═══════════════════════════════════════════════════════════════════════

Current configured providers (in priority order):
  1. anthropic-api ✓
  2. bedrock ✓
  3. openrouter ✓

Unconfigured providers (will be skipped):
  • anthropic-subscription
  • openai-api
  • vertex
  ... and 15 more

Recommended priority order:
  anthropic-api → bedrock → openrouter

Would you like to customize the priority order? (y/n)
```

If yes, use drag/reorder interface or numbered selection.

```javascript
import { savePriorityOrder } from '${CLAUDE_PLUGIN_ROOT}/lib/setup-wizard.js';

savePriorityOrder(['anthropic-api', 'bedrock', 'openrouter']);
```

### Step 8: Show Completion Summary

```
╔═══════════════════════════════════════════════════════════════════════╗
║                         SETUP COMPLETE                                 ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  ✓ 5 providers configured                                              ║
║  ✓ 3 providers from environment variables                              ║
║  ✓ 2 addon plugins detected                                            ║
║  ✓ 10 agents available                                                 ║
║  ✓ Priority order saved                                                ║
║                                                                        ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  Priority: anthropic-api → bedrock → openrouter                        ║
║                                                                        ║
║  Your provider fallback is now fully configured!                       ║
║                                                                        ║
║  Quick Commands:                                                       ║
║    /provider-status    - View current status and usage                 ║
║    /provider-priority  - Adjust priority order                         ║
║    /provider-switch    - Manually switch providers                     ║
║    /provider-analytics - View usage analytics                          ║
║                                                                        ║
╚═══════════════════════════════════════════════════════════════════════╝
```

## Available Agents (for reference)

The wizard will detect and display all available agents:

### OpenCode Core Agents
- **build** - Build and compile projects
- **plan** - Create implementation plans
- **general** - General-purpose tasks
- **explore** - Codebase exploration
- **oracle** - Technical advisor
- **librarian** - Documentation lookup

### oh-my-opencode Agents (if installed)
- **Planner-Sisyphus** - Enhanced planning agent
- **oracle** - Enhanced oracle (overrides core)
- **librarian** - Enhanced librarian (overrides core)
- **explore** - Enhanced explore (overrides core)

## Notes

- Environment variables take precedence over saved config
- OAuth providers require redirect setup in your OAuth app
- Subscription providers require active paid subscriptions
- Run `/provider-status` after setup to verify everything works
- Run `/provider-setup --reset` to start fresh
