---
name: provider-models
description: List available models and their provider-specific identifiers
allowed_args:
  - name: action
    type: string
    description: "Action: list, info, family, capability, providers"
  - name: model
    type: string
    description: "Canonical model name (e.g., claude-sonnet-4, gpt-4o, gemini-2.5-pro)"
  - name: filter
    type: string
    description: "Filter by family (claude, gpt, gemini) or capability (vision, code, reasoning)"
---

# Model Registry & Provider Mappings

View all supported models and their provider-specific identifiers. Models use a canonical name that maps to provider-specific IDs.

## Usage

### List All Models

```
/provider-models list
/provider-models list --filter claude
/provider-models list --filter gpt
/provider-models list --filter gemini
```

### Get Model Info

```
/provider-models info claude-sonnet-4
/provider-models info gpt-4o
/provider-models info gemini-2.5-pro
```

Shows capabilities, context window, and all provider mappings.

### Filter by Capability

```
/provider-models capability vision
/provider-models capability reasoning
/provider-models capability code
```

### Get Providers for Model

```
/provider-models providers claude-sonnet-4
```

## Model Families

### Claude (Anthropic)
| Canonical Name | Context | Capabilities |
|----------------|---------|--------------|
| `claude-4-opus` | 200K | text, vision, code, reasoning |
| `claude-sonnet-4` | 200K | text, vision, code, reasoning |
| `claude-3.5-sonnet` | 200K | text, vision, code |
| `claude-3.5-haiku` | 200K | text, vision, code |
| `claude-3-opus` | 200K | text, vision, code, reasoning |

### GPT (OpenAI)
| Canonical Name | Context | Capabilities |
|----------------|---------|--------------|
| `gpt-4.1` | 1M | text, vision, code, reasoning |
| `gpt-4.1-mini` | 1M | text, vision, code |
| `gpt-4o` | 128K | text, vision, code, audio |
| `gpt-4o-mini` | 128K | text, vision, code |
| `o1` | 200K | text, reasoning, code |
| `o3-mini` | 200K | text, reasoning, code |

### Gemini (Google)
| Canonical Name | Context | Capabilities |
|----------------|---------|--------------|
| `gemini-2.5-pro` | 1M | text, vision, code, reasoning, audio |
| `gemini-2.5-flash` | 1M | text, vision, code, reasoning |
| `gemini-2.0-flash` | 1M | text, vision, code |
| `gemini-1.5-pro` | 2M | text, vision, code |

### Grok (xAI)
| Canonical Name | Context | Capabilities |
|----------------|---------|--------------|
| `grok-3` | 131K | text, vision, code, reasoning |
| `grok-3-mini` | 131K | text, code, reasoning |

### Llama (Meta)
| Canonical Name | Context | Capabilities |
|----------------|---------|--------------|
| `llama-4-maverick` | 1M | text, vision, code |
| `llama-3.3-70b` | 128K | text, code |

### DeepSeek
| Canonical Name | Context | Capabilities |
|----------------|---------|--------------|
| `deepseek-r1` | 128K | text, code, reasoning |
| `deepseek-v3` | 128K | text, code |

### Mistral
| Canonical Name | Context | Capabilities |
|----------------|---------|--------------|
| `mistral-large` | 128K | text, code |
| `codestral` | 256K | code |

### Other
| Canonical Name | Family | Capabilities |
|----------------|--------|--------------|
| `command-r-plus` | cohere | text, code, rag |
| `qwen-2.5-72b` | qwen | text, code |

## Provider-Specific Model IDs

### Example: claude-sonnet-4

| Provider | Model ID |
|----------|----------|
| anthropic-subscription | `claude-sonnet-4-20250514` |
| anthropic-oauth | `claude-sonnet-4-20250514` |
| anthropic-api | `claude-sonnet-4-20250514` |
| bedrock | `anthropic.claude-sonnet-4-20250514-v1:0` |
| vertex | `claude-sonnet-4@20250514` |
| openrouter | `anthropic/claude-sonnet-4` |

### Example: gpt-4o

| Provider | Model ID |
|----------|----------|
| openai-subscription | `gpt-4o-2024-11-20` |
| openai-oauth | `gpt-4o-2024-11-20` |
| openai-api | `gpt-4o-2024-11-20` |
| azure | `gpt-4o-2024-11-20` |
| openrouter | `openai/gpt-4o` |

### Example: gemini-2.5-pro

| Provider | Model ID |
|----------|----------|
| google-subscription | `gemini-2.5-pro-preview-05-06` |
| google-oauth | `gemini-2.5-pro-preview-05-06` |
| google-api | `gemini-2.5-pro-preview-05-06` |
| vertex-google | `gemini-2.5-pro-preview-05-06` |
| openrouter | `google/gemini-2.5-pro-preview` |

## Implementation

```javascript
const models = require('${CLAUDE_PLUGIN_ROOT}/lib/models.js');

// List all models
const allModels = models.listAllModels();

// Get model info
const info = models.getModelInfo('claude-sonnet-4');
console.log(info.capabilities); // ['text', 'vision', 'code', 'reasoning']
console.log(info.contextWindow); // 200000

// Get provider-specific ID
const bedrockId = models.getProviderModelId('claude-sonnet-4', 'bedrock');
console.log(bedrockId); // 'anthropic.claude-sonnet-4-20250514-v1:0'

// Get all providers for a model
const providers = models.getProvidersForModel('claude-sonnet-4');
console.log(providers); // ['anthropic-subscription', 'anthropic-oauth', ...]

// Filter by family
const claudeModels = models.getModelsByFamily('claude');

// Filter by capability
const reasoningModels = models.getModelsByCapability('reasoning');
```

## Automatic Provider Selection

When you request a model, the system:

1. Looks up configured providers for that model
2. Sorts by auth priority (subscription > oauth > api)
3. Filters by usage capacity
4. Returns the best available provider + model ID

```javascript
const auth = require('${CLAUDE_PLUGIN_ROOT}/lib/auth.js');
const models = require('${CLAUDE_PLUGIN_ROOT}/lib/models.js');

// Get best provider for Anthropic
const bestProvider = auth.getBestProviderForVendor('anthropic');
// { id: 'anthropic-subscription', priority: 100, ... }

// Get the model ID for that provider
const modelId = models.getProviderModelId('claude-sonnet-4', bestProvider.id);
// 'claude-sonnet-4-20250514'
```
