/**
 * Complete Model Registry
 * Maps canonical model names to provider-specific identifiers.
 * @version 2.3.0
 */

export const MODEL_REGISTRY = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ANTHROPIC CLAUDE - HAIKU (Fast, efficient)
  // ═══════════════════════════════════════════════════════════════════════════
  'claude-3-haiku': {
    family: 'claude', capabilities: ['text', 'vision', 'code'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-3-haiku-20240307',
      'anthropic-oauth': 'claude-3-haiku-20240307',
      'anthropic-api': 'claude-3-haiku-20240307',
      'bedrock': 'anthropic.claude-3-haiku-20240307-v1:0',
      'vertex': 'claude-3-haiku@20240307',
      'openrouter': 'anthropic/claude-3-haiku'
    }
  },
  'claude-3.5-haiku': {
    family: 'claude', capabilities: ['text', 'vision', 'code'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-3-5-haiku-20241022',
      'anthropic-oauth': 'claude-3-5-haiku-20241022',
      'anthropic-api': 'claude-3-5-haiku-20241022',
      'bedrock': 'anthropic.claude-3-5-haiku-20241022-v1:0',
      'vertex': 'claude-3-5-haiku@20241022',
      'openrouter': 'anthropic/claude-3.5-haiku'
    }
  },
  'claude-3.5-haiku-latest': {
    family: 'claude', capabilities: ['text', 'vision', 'code'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-3-5-haiku-latest',
      'anthropic-oauth': 'claude-3-5-haiku-latest',
      'anthropic-api': 'claude-3-5-haiku-latest',
      'openrouter': 'anthropic/claude-3.5-haiku'
    }
  },
  'claude-4.5-haiku': {
    family: 'claude', capabilities: ['text', 'vision', 'code'], contextWindow: 128000,
    providers: {
      'anthropic-subscription': 'claude-haiku-4-5-20251001',
      'anthropic-oauth': 'claude-haiku-4-5-20251001',
      'anthropic-api': 'claude-haiku-4-5-20251001',
      'bedrock': 'anthropic.claude-haiku-4-5-20251001-v1:0',
      'vertex': 'claude-haiku-4-5@20251001',
      'github-copilot': 'claude-haiku-4.5',
      'openrouter': 'anthropic/claude-4.5-haiku'
    }
  },
  'claude-4.5-haiku-latest': {
    family: 'claude', capabilities: ['text', 'vision', 'code'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-haiku-4-5',
      'anthropic-oauth': 'claude-haiku-4-5',
      'anthropic-api': 'claude-haiku-4-5',
      'openrouter': 'anthropic/claude-4.5-haiku'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANTHROPIC CLAUDE - SONNET (Balanced performance)
  // ═══════════════════════════════════════════════════════════════════════════
  'claude-3-sonnet': {
    family: 'claude', capabilities: ['text', 'vision', 'code'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-3-sonnet-20240229',
      'anthropic-oauth': 'claude-3-sonnet-20240229',
      'anthropic-api': 'claude-3-sonnet-20240229',
      'bedrock': 'anthropic.claude-3-sonnet-20240229-v1:0',
      'vertex': 'claude-3-sonnet@20240229',
      'openrouter': 'anthropic/claude-3-sonnet'
    }
  },
  'claude-3.5-sonnet': {
    family: 'claude', capabilities: ['text', 'vision', 'code'], contextWindow: 90000,
    providers: {
      'anthropic-subscription': 'claude-3-5-sonnet-20240620',
      'anthropic-oauth': 'claude-3-5-sonnet-20240620',
      'anthropic-api': 'claude-3-5-sonnet-20240620',
      'bedrock': 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      'vertex': 'claude-3-5-sonnet@20240620',
      'github-copilot': 'claude-3.5-sonnet',
      'openrouter': 'anthropic/claude-3.5-sonnet'
    }
  },
  'claude-3.5-sonnet-v2': {
    family: 'claude', capabilities: ['text', 'vision', 'code'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-3-5-sonnet-20241022',
      'anthropic-oauth': 'claude-3-5-sonnet-20241022',
      'anthropic-api': 'claude-3-5-sonnet-20241022',
      'bedrock': 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      'vertex': 'claude-3-5-sonnet-v2@20241022',
      'openrouter': 'anthropic/claude-3.5-sonnet-v2'
    }
  },
  'claude-3.7-sonnet': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-3-7-sonnet-20250219',
      'anthropic-oauth': 'claude-3-7-sonnet-20250219',
      'anthropic-api': 'claude-3-7-sonnet-20250219',
      'bedrock': 'anthropic.claude-3-7-sonnet-20250219-v1:0',
      'vertex': 'claude-3-7-sonnet@20250219',
      'github-copilot': 'claude-3.7-sonnet',
      'openrouter': 'anthropic/claude-3.7-sonnet'
    }
  },
  'claude-3.7-sonnet-thinking': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    thinkingMode: 'extended',
    providers: {
      'github-copilot': 'claude-3.7-sonnet-thought'
    }
  },
  'claude-3.7-sonnet-latest': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-3-7-sonnet-latest',
      'anthropic-oauth': 'claude-3-7-sonnet-latest',
      'anthropic-api': 'claude-3-7-sonnet-latest',
      'openrouter': 'anthropic/claude-3.7-sonnet'
    }
  },
  'claude-4-sonnet': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 128000,
    providers: {
      'anthropic-subscription': 'claude-sonnet-4-20250514',
      'anthropic-oauth': 'claude-sonnet-4-20250514',
      'anthropic-api': 'claude-sonnet-4-20250514',
      'bedrock': 'anthropic.claude-sonnet-4-20250514-v1:0',
      'vertex': 'claude-sonnet-4@20250514',
      'github-copilot': 'claude-sonnet-4',
      'openrouter': 'anthropic/claude-sonnet-4'
    }
  },
  'claude-4-sonnet-latest': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-sonnet-4-0',
      'anthropic-oauth': 'claude-sonnet-4-0',
      'anthropic-api': 'claude-sonnet-4-0',
      'openrouter': 'anthropic/claude-sonnet-4'
    }
  },
  'claude-4.5-sonnet': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 128000,
    providers: {
      'anthropic-subscription': 'claude-sonnet-4-5-20250929',
      'anthropic-oauth': 'claude-sonnet-4-5-20250929',
      'anthropic-api': 'claude-sonnet-4-5-20250929',
      'bedrock': 'anthropic.claude-sonnet-4-5-20250929-v1:0',
      'vertex': 'claude-sonnet-4-5@20250929',
      'github-copilot': 'claude-sonnet-4.5',
      'openrouter': 'anthropic/claude-sonnet-4.5'
    }
  },
  'claude-4.5-sonnet-latest': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-sonnet-4-5',
      'anthropic-oauth': 'claude-sonnet-4-5',
      'anthropic-api': 'claude-sonnet-4-5',
      'openrouter': 'anthropic/claude-sonnet-4.5'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANTHROPIC CLAUDE - OPUS (Most capable)
  // ═══════════════════════════════════════════════════════════════════════════
  'claude-3-opus': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-3-opus-20240229',
      'anthropic-oauth': 'claude-3-opus-20240229',
      'anthropic-api': 'claude-3-opus-20240229',
      'bedrock': 'anthropic.claude-3-opus-20240229-v1:0',
      'vertex': 'claude-3-opus@20240229',
      'openrouter': 'anthropic/claude-3-opus'
    }
  },
  'claude-4-opus': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 80000,
    providers: {
      'anthropic-subscription': 'claude-opus-4-20250514',
      'anthropic-oauth': 'claude-opus-4-20250514',
      'anthropic-api': 'claude-opus-4-20250514',
      'bedrock': 'anthropic.claude-opus-4-20250514-v1:0',
      'vertex': 'claude-opus-4@20250514',
      'github-copilot': 'claude-opus-4',
      'openrouter': 'anthropic/claude-opus-4'
    }
  },
  'claude-4-opus-latest': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-opus-4-0',
      'anthropic-oauth': 'claude-opus-4-0',
      'anthropic-api': 'claude-opus-4-0',
      'openrouter': 'anthropic/claude-opus-4'
    }
  },
  'claude-4.1-opus': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 80000,
    providers: {
      'anthropic-subscription': 'claude-opus-4-1-20250805',
      'anthropic-oauth': 'claude-opus-4-1-20250805',
      'anthropic-api': 'claude-opus-4-1-20250805',
      'bedrock': 'anthropic.claude-opus-4-1-20250805-v1:0',
      'vertex': 'claude-opus-4-1@20250805',
      'github-copilot': 'claude-opus-41',
      'openrouter': 'anthropic/claude-opus-4.1'
    }
  },
  'claude-4.1-opus-latest': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-opus-4-1',
      'anthropic-oauth': 'claude-opus-4-1',
      'anthropic-api': 'claude-opus-4-1',
      'openrouter': 'anthropic/claude-opus-4.1'
    }
  },
  'claude-4.5-opus': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 128000,
    providers: {
      'anthropic-subscription': 'claude-opus-4-5-20251101',
      'anthropic-oauth': 'claude-opus-4-5-20251101',
      'anthropic-api': 'claude-opus-4-5-20251101',
      'bedrock': 'anthropic.claude-opus-4-5-20251101-v1:0',
      'vertex': 'claude-opus-4-5@20251101',
      'github-copilot': 'claude-opus-4.5',
      'openrouter': 'anthropic/claude-opus-4.5'
    }
  },
  'claude-4.5-opus-latest': {
    family: 'claude', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    providers: {
      'anthropic-subscription': 'claude-opus-4-5',
      'anthropic-oauth': 'claude-opus-4-5',
      'anthropic-api': 'claude-opus-4-5',
      'openrouter': 'anthropic/claude-opus-4.5'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPENAI GPT LEGACY & CURRENT
  // ═══════════════════════════════════════════════════════════════════════════
  'gpt-3.5-turbo': {
    family: 'gpt', capabilities: ['text', 'code'], contextWindow: 16385,
    providers: {
      'openai-subscription': 'gpt-3.5-turbo',
      'openai-oauth': 'gpt-3.5-turbo',
      'openai-api': 'gpt-3.5-turbo',
      'azure': 'gpt-3.5-turbo',
      'openrouter': 'openai/gpt-3.5-turbo'
    }
  },
  'gpt-4': {
    family: 'gpt', capabilities: ['text', 'code', 'reasoning'], contextWindow: 8192,
    providers: {
      'openai-subscription': 'gpt-4',
      'openai-oauth': 'gpt-4',
      'openai-api': 'gpt-4',
      'azure': 'gpt-4',
      'openrouter': 'openai/gpt-4'
    }
  },
  'gpt-4-turbo': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 128000,
    providers: {
      'openai-subscription': 'gpt-4-turbo',
      'openai-oauth': 'gpt-4-turbo',
      'openai-api': 'gpt-4-turbo',
      'azure': 'gpt-4-turbo',
      'openrouter': 'openai/gpt-4-turbo'
    }
  },
  'gpt-4.1': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 1047576,
    providers: {
      'openai-subscription': 'gpt-4.1',
      'openai-oauth': 'gpt-4.1',
      'openai-api': 'gpt-4.1',
      'azure': 'gpt-4.1',
      'github-copilot': 'gpt-4.1',
      'openrouter': 'openai/gpt-4.1'
    }
  },
  'gpt-4.1-mini': {
    family: 'gpt', capabilities: ['text', 'vision', 'code'], contextWindow: 1047576,
    providers: {
      'openai-subscription': 'gpt-4.1-mini',
      'openai-oauth': 'gpt-4.1-mini',
      'openai-api': 'gpt-4.1-mini',
      'azure': 'gpt-4.1-mini',
      'openrouter': 'openai/gpt-4.1-mini'
    }
  },
  'gpt-4.1-nano': {
    family: 'gpt', capabilities: ['text', 'code'], contextWindow: 1047576,
    providers: {
      'openai-subscription': 'gpt-4.1-nano',
      'openai-oauth': 'gpt-4.1-nano',
      'openai-api': 'gpt-4.1-nano',
      'azure': 'gpt-4.1-nano',
      'openrouter': 'openai/gpt-4.1-nano'
    }
  },
  'gpt-4o': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'audio'], contextWindow: 128000,
    providers: {
      'openai-subscription': 'gpt-4o',
      'openai-oauth': 'gpt-4o',
      'openai-api': 'gpt-4o',
      'azure': 'gpt-4o',
      'github-copilot': 'gpt-4o',
      'openrouter': 'openai/gpt-4o'
    }
  },
  'gpt-4o-2024-05-13': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'audio'], contextWindow: 128000,
    providers: {
      'openai-subscription': 'gpt-4o-2024-05-13',
      'openai-oauth': 'gpt-4o-2024-05-13',
      'openai-api': 'gpt-4o-2024-05-13',
      'azure': 'gpt-4o-2024-05-13',
      'openrouter': 'openai/gpt-4o-2024-05-13'
    }
  },
  'gpt-4o-2024-08-06': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'audio'], contextWindow: 128000,
    providers: {
      'openai-subscription': 'gpt-4o-2024-08-06',
      'openai-oauth': 'gpt-4o-2024-08-06',
      'openai-api': 'gpt-4o-2024-08-06',
      'azure': 'gpt-4o-2024-08-06',
      'openrouter': 'openai/gpt-4o-2024-08-06'
    }
  },
  'gpt-4o-2024-11-20': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'audio'], contextWindow: 128000,
    providers: {
      'openai-subscription': 'gpt-4o-2024-11-20',
      'openai-oauth': 'gpt-4o-2024-11-20',
      'openai-api': 'gpt-4o-2024-11-20',
      'azure': 'gpt-4o-2024-11-20',
      'openrouter': 'openai/gpt-4o-2024-11-20'
    }
  },
  'gpt-4o-mini': {
    family: 'gpt', capabilities: ['text', 'vision', 'code'], contextWindow: 128000,
    providers: {
      'openai-subscription': 'gpt-4o-mini',
      'openai-oauth': 'gpt-4o-mini',
      'openai-api': 'gpt-4o-mini',
      'azure': 'gpt-4o-mini',
      'openrouter': 'openai/gpt-4o-mini'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPENAI GPT-5 SERIES
  // ═══════════════════════════════════════════════════════════════════════════
  'gpt-5': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5',
      'openai-oauth': 'gpt-5',
      'openai-api': 'gpt-5',
      'github-copilot': 'gpt-5',
      'openrouter': 'openai/gpt-5'
    }
  },
  'gpt-5-chat-latest': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5-chat-latest',
      'openai-oauth': 'gpt-5-chat-latest',
      'openai-api': 'gpt-5-chat-latest',
      'openrouter': 'openai/gpt-5-chat-latest'
    }
  },
  'gpt-5-mini': {
    family: 'gpt', capabilities: ['text', 'vision', 'code'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5-mini',
      'openai-oauth': 'gpt-5-mini',
      'openai-api': 'gpt-5-mini',
      'github-copilot': 'gpt-5-mini',
      'openrouter': 'openai/gpt-5-mini'
    }
  },
  'gpt-5-nano': {
    family: 'gpt', capabilities: ['text', 'code'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5-nano',
      'openai-oauth': 'gpt-5-nano',
      'openai-api': 'gpt-5-nano',
      'openrouter': 'openai/gpt-5-nano'
    }
  },
  'gpt-5-pro': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5-pro',
      'openai-oauth': 'gpt-5-pro',
      'openai-api': 'gpt-5-pro',
      'openrouter': 'openai/gpt-5-pro'
    }
  },
  'gpt-5-codex': {
    family: 'gpt', capabilities: ['code', 'reasoning'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5-codex',
      'openai-oauth': 'gpt-5-codex',
      'openai-api': 'gpt-5-codex',
      'github-copilot': 'gpt-5-codex',
      'openrouter': 'openai/gpt-5-codex'
    }
  },
  'gpt-5.1': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5.1',
      'openai-oauth': 'gpt-5.1',
      'openai-api': 'gpt-5.1',
      'github-copilot': 'gpt-5.1',
      'openrouter': 'openai/gpt-5.1'
    }
  },
  'gpt-5.1-chat-latest': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 128000,
    providers: {
      'openai-subscription': 'gpt-5.1-chat-latest',
      'openai-oauth': 'gpt-5.1-chat-latest',
      'openai-api': 'gpt-5.1-chat-latest',
      'openrouter': 'openai/gpt-5.1-chat-latest'
    }
  },
  'gpt-5.1-codex': {
    family: 'gpt', capabilities: ['code', 'reasoning'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5.1-codex',
      'openai-oauth': 'gpt-5.1-codex',
      'openai-api': 'gpt-5.1-codex',
      'github-copilot': 'gpt-5.1-codex',
      'openrouter': 'openai/gpt-5.1-codex'
    }
  },
  'gpt-5.1-codex-max': {
    family: 'gpt', capabilities: ['code', 'reasoning'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5.1-codex-max',
      'openai-oauth': 'gpt-5.1-codex-max',
      'openai-api': 'gpt-5.1-codex-max',
      'github-copilot': 'gpt-5.1-codex-max',
      'openrouter': 'openai/gpt-5.1-codex-max'
    }
  },
  'gpt-5.1-codex-mini': {
    family: 'gpt', capabilities: ['code'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5.1-codex-mini',
      'openai-oauth': 'gpt-5.1-codex-mini',
      'openai-api': 'gpt-5.1-codex-mini',
      'github-copilot': 'gpt-5.1-codex-mini',
      'openrouter': 'openai/gpt-5.1-codex-mini'
    }
  },
  'gpt-5.2': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5.2',
      'openai-oauth': 'gpt-5.2',
      'openai-api': 'gpt-5.2',
      'github-copilot': 'gpt-5.2',
      'openrouter': 'openai/gpt-5.2'
    }
  },
  'gpt-5.2-chat-latest': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 128000,
    providers: {
      'openai-subscription': 'gpt-5.2-chat-latest',
      'openai-oauth': 'gpt-5.2-chat-latest',
      'openai-api': 'gpt-5.2-chat-latest',
      'openrouter': 'openai/gpt-5.2-chat-latest'
    }
  },
  'gpt-5.2-pro': {
    family: 'gpt', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 400000,
    providers: {
      'openai-subscription': 'gpt-5.2-pro',
      'openai-oauth': 'gpt-5.2-pro',
      'openai-api': 'gpt-5.2-pro',
      'openrouter': 'openai/gpt-5.2-pro'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPENAI O-SERIES (Reasoning Models)
  // ═══════════════════════════════════════════════════════════════════════════
  'o1': {
    family: 'gpt', capabilities: ['text', 'reasoning', 'code'], contextWindow: 200000,
    providers: {
      'openai-subscription': 'o1',
      'openai-oauth': 'o1',
      'openai-api': 'o1',
      'openrouter': 'openai/o1'
    }
  },
  'o1-mini': {
    family: 'gpt', capabilities: ['text', 'reasoning', 'code'], contextWindow: 128000,
    providers: {
      'openai-subscription': 'o1-mini',
      'openai-oauth': 'o1-mini',
      'openai-api': 'o1-mini',
      'openrouter': 'openai/o1-mini'
    }
  },
  'o1-preview': {
    family: 'gpt', capabilities: ['text', 'reasoning', 'code'], contextWindow: 128000,
    providers: {
      'openai-subscription': 'o1-preview',
      'openai-oauth': 'o1-preview',
      'openai-api': 'o1-preview',
      'openrouter': 'openai/o1-preview'
    }
  },
  'o1-pro': {
    family: 'gpt', capabilities: ['text', 'reasoning', 'code'], contextWindow: 200000,
    providers: {
      'openai-subscription': 'o1-pro',
      'openai-oauth': 'o1-pro',
      'openai-api': 'o1-pro',
      'openrouter': 'openai/o1-pro'
    }
  },
  'o3': {
    family: 'gpt', capabilities: ['text', 'reasoning', 'code'], contextWindow: 200000,
    providers: {
      'openai-subscription': 'o3',
      'openai-oauth': 'o3',
      'openai-api': 'o3',
      'github-copilot': 'o3',
      'openrouter': 'openai/o3'
    }
  },
  'o3-deep-research': {
    family: 'gpt', capabilities: ['text', 'reasoning', 'code', 'research'], contextWindow: 200000,
    providers: {
      'openai-subscription': 'o3-deep-research',
      'openai-oauth': 'o3-deep-research',
      'openai-api': 'o3-deep-research',
      'openrouter': 'openai/o3-deep-research'
    }
  },
  'o3-mini': {
    family: 'gpt', capabilities: ['text', 'reasoning', 'code'], contextWindow: 200000,
    providers: {
      'openai-subscription': 'o3-mini',
      'openai-oauth': 'o3-mini',
      'openai-api': 'o3-mini',
      'github-copilot': 'o3-mini',
      'openrouter': 'openai/o3-mini'
    }
  },
  'o3-pro': {
    family: 'gpt', capabilities: ['text', 'reasoning', 'code'], contextWindow: 200000,
    providers: {
      'openai-subscription': 'o3-pro',
      'openai-oauth': 'o3-pro',
      'openai-api': 'o3-pro',
      'openrouter': 'openai/o3-pro'
    }
  },
  'o4-mini': {
    family: 'gpt', capabilities: ['text', 'reasoning', 'code'], contextWindow: 200000,
    providers: {
      'openai-subscription': 'o4-mini',
      'openai-oauth': 'o4-mini',
      'openai-api': 'o4-mini',
      'github-copilot': 'o4-mini',
      'openrouter': 'openai/o4-mini'
    }
  },
  'o4-mini-deep-research': {
    family: 'gpt', capabilities: ['text', 'reasoning', 'code', 'research'], contextWindow: 200000,
    providers: {
      'openai-subscription': 'o4-mini-deep-research',
      'openai-oauth': 'o4-mini-deep-research',
      'openai-api': 'o4-mini-deep-research',
      'openrouter': 'openai/o4-mini-deep-research'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPENAI CODEX & EMBEDDINGS
  // ═══════════════════════════════════════════════════════════════════════════
  'codex-mini-latest': {
    family: 'codex', capabilities: ['code'], contextWindow: 200000,
    providers: {
      'openai-subscription': 'codex-mini-latest',
      'openai-oauth': 'codex-mini-latest',
      'openai-api': 'codex-mini-latest',
      'openrouter': 'openai/codex-mini-latest'
    }
  },
  'text-embedding-3-large': {
    family: 'embedding', capabilities: ['embedding'], contextWindow: 8191,
    providers: {
      'openai-subscription': 'text-embedding-3-large',
      'openai-oauth': 'text-embedding-3-large',
      'openai-api': 'text-embedding-3-large',
      'azure': 'text-embedding-3-large'
    }
  },
  'text-embedding-3-small': {
    family: 'embedding', capabilities: ['embedding'], contextWindow: 8191,
    providers: {
      'openai-subscription': 'text-embedding-3-small',
      'openai-oauth': 'text-embedding-3-small',
      'openai-api': 'text-embedding-3-small',
      'azure': 'text-embedding-3-small'
    }
  },
  'text-embedding-ada-002': {
    family: 'embedding', capabilities: ['embedding'], contextWindow: 8192,
    providers: {
      'openai-subscription': 'text-embedding-ada-002',
      'openai-oauth': 'text-embedding-ada-002',
      'openai-api': 'text-embedding-ada-002',
      'azure': 'text-embedding-ada-002'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOOGLE GEMINI
  // ═══════════════════════════════════════════════════════════════════════════
  
  // GEMINI 1.5 SERIES
  'gemini-1.5-flash': {
    family: 'gemini', capabilities: ['text', 'vision', 'code'], contextWindow: 1000000,
    providers: {
      'google-subscription': 'gemini-1.5-flash',
      'google-oauth': 'gemini-1.5-flash',
      'google-api': 'gemini-1.5-flash',
      'vertex-google': 'gemini-1.5-flash',
      'openrouter': 'google/gemini-1.5-flash'
    }
  },
  'gemini-1.5-flash-8b': {
    family: 'gemini', capabilities: ['text', 'vision', 'code'], contextWindow: 1000000,
    providers: {
      'google-subscription': 'gemini-1.5-flash-8b',
      'google-oauth': 'gemini-1.5-flash-8b',
      'google-api': 'gemini-1.5-flash-8b',
      'vertex-google': 'gemini-1.5-flash-8b',
      'openrouter': 'google/gemini-1.5-flash-8b'
    }
  },
  'gemini-1.5-pro': {
    family: 'gemini', capabilities: ['text', 'vision', 'code'], contextWindow: 1000000,
    providers: {
      'google-subscription': 'gemini-1.5-pro',
      'google-oauth': 'gemini-1.5-pro',
      'google-api': 'gemini-1.5-pro',
      'vertex-google': 'gemini-1.5-pro',
      'openrouter': 'google/gemini-1.5-pro'
    }
  },

  // GEMINI 2.0 SERIES
  'gemini-2.0-flash': {
    family: 'gemini', capabilities: ['text', 'vision', 'code'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.0-flash',
      'google-oauth': 'gemini-2.0-flash',
      'google-api': 'gemini-2.0-flash',
      'vertex-google': 'gemini-2.0-flash',
      'github-copilot': 'gemini-2.0-flash-001',
      'openrouter': 'google/gemini-2.0-flash'
    }
  },
  'gemini-2.0-flash-lite': {
    family: 'gemini', capabilities: ['text', 'vision', 'code'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.0-flash-lite',
      'google-oauth': 'gemini-2.0-flash-lite',
      'google-api': 'gemini-2.0-flash-lite',
      'vertex-google': 'gemini-2.0-flash-lite',
      'openrouter': 'google/gemini-2.0-flash-lite'
    }
  },

  // GEMINI 2.5 FLASH SERIES
  'gemini-2.5-flash': {
    family: 'gemini', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.5-flash',
      'google-oauth': 'gemini-2.5-flash',
      'google-api': 'gemini-2.5-flash',
      'vertex-google': 'gemini-2.5-flash',
      'openrouter': 'google/gemini-2.5-flash'
    }
  },
  'gemini-2.5-flash-image': {
    family: 'gemini', capabilities: ['vision', 'image-gen'], contextWindow: 32768,
    providers: {
      'google-subscription': 'gemini-2.5-flash-image',
      'google-oauth': 'gemini-2.5-flash-image',
      'google-api': 'gemini-2.5-flash-image',
      'vertex-google': 'gemini-2.5-flash-image',
      'openrouter': 'google/gemini-2.5-flash-image'
    }
  },
  'gemini-2.5-flash-image-preview': {
    family: 'gemini', capabilities: ['vision', 'image-gen'], contextWindow: 32768,
    providers: {
      'google-subscription': 'gemini-2.5-flash-image-preview',
      'google-oauth': 'gemini-2.5-flash-image-preview',
      'google-api': 'gemini-2.5-flash-image-preview',
      'vertex-google': 'gemini-2.5-flash-image-preview',
      'openrouter': 'google/gemini-2.5-flash-image-preview'
    }
  },
  'gemini-2.5-flash-lite': {
    family: 'gemini', capabilities: ['text', 'vision', 'code'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.5-flash-lite',
      'google-oauth': 'gemini-2.5-flash-lite',
      'google-api': 'gemini-2.5-flash-lite',
      'vertex-google': 'gemini-2.5-flash-lite',
      'openrouter': 'google/gemini-2.5-flash-lite'
    }
  },
  'gemini-2.5-flash-lite-preview-06-17': {
    family: 'gemini', capabilities: ['text', 'vision', 'code'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.5-flash-lite-preview-06-17',
      'google-oauth': 'gemini-2.5-flash-lite-preview-06-17',
      'google-api': 'gemini-2.5-flash-lite-preview-06-17',
      'vertex-google': 'gemini-2.5-flash-lite-preview-06-17',
      'openrouter': 'google/gemini-2.5-flash-lite-preview-06-17'
    }
  },
  'gemini-2.5-flash-lite-preview-09-25': {
    family: 'gemini', capabilities: ['text', 'vision', 'code'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.5-flash-lite-preview-09-2025',
      'google-oauth': 'gemini-2.5-flash-lite-preview-09-2025',
      'google-api': 'gemini-2.5-flash-lite-preview-09-2025',
      'vertex-google': 'gemini-2.5-flash-lite-preview-09-2025',
      'openrouter': 'google/gemini-2.5-flash-lite-preview-09-2025'
    }
  },
  'gemini-2.5-flash-preview-04-17': {
    family: 'gemini', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.5-flash-preview-04-17',
      'google-oauth': 'gemini-2.5-flash-preview-04-17',
      'google-api': 'gemini-2.5-flash-preview-04-17',
      'vertex-google': 'gemini-2.5-flash-preview-04-17',
      'openrouter': 'google/gemini-2.5-flash-preview-04-17'
    }
  },
  'gemini-2.5-flash-preview-05-20': {
    family: 'gemini', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.5-flash-preview-05-20',
      'google-oauth': 'gemini-2.5-flash-preview-05-20',
      'google-api': 'gemini-2.5-flash-preview-05-20',
      'vertex-google': 'gemini-2.5-flash-preview-05-20',
      'openrouter': 'google/gemini-2.5-flash-preview-05-20'
    }
  },
  'gemini-2.5-flash-preview-09-25': {
    family: 'gemini', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.5-flash-preview-09-2025',
      'google-oauth': 'gemini-2.5-flash-preview-09-2025',
      'google-api': 'gemini-2.5-flash-preview-09-2025',
      'vertex-google': 'gemini-2.5-flash-preview-09-2025',
      'openrouter': 'google/gemini-2.5-flash-preview-09-2025'
    }
  },
  'gemini-2.5-flash-preview-tts': {
    family: 'gemini', capabilities: ['text', 'audio', 'tts'], contextWindow: 8000,
    providers: {
      'google-subscription': 'gemini-2.5-flash-preview-tts',
      'google-oauth': 'gemini-2.5-flash-preview-tts',
      'google-api': 'gemini-2.5-flash-preview-tts',
      'vertex-google': 'gemini-2.5-flash-preview-tts',
      'openrouter': 'google/gemini-2.5-flash-preview-tts'
    }
  },

  // GEMINI 2.5 PRO SERIES
  'gemini-2.5-pro': {
    family: 'gemini', capabilities: ['text', 'vision', 'code', 'reasoning', 'audio'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.5-pro',
      'google-oauth': 'gemini-2.5-pro',
      'google-api': 'gemini-2.5-pro',
      'vertex-google': 'gemini-2.5-pro',
      'github-copilot': 'gemini-2.5-pro',
      'openrouter': 'google/gemini-2.5-pro'
    }
  },
  'gemini-2.5-pro-preview-05-06': {
    family: 'gemini', capabilities: ['text', 'vision', 'code', 'reasoning', 'audio'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.5-pro-preview-05-06',
      'google-oauth': 'gemini-2.5-pro-preview-05-06',
      'google-api': 'gemini-2.5-pro-preview-05-06',
      'vertex-google': 'gemini-2.5-pro-preview-05-06',
      'openrouter': 'google/gemini-2.5-pro-preview-05-06'
    }
  },
  'gemini-2.5-pro-preview-06-05': {
    family: 'gemini', capabilities: ['text', 'vision', 'code', 'reasoning', 'audio'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-2.5-pro-preview-06-05',
      'google-oauth': 'gemini-2.5-pro-preview-06-05',
      'google-api': 'gemini-2.5-pro-preview-06-05',
      'vertex-google': 'gemini-2.5-pro-preview-06-05',
      'openrouter': 'google/gemini-2.5-pro-preview-06-05'
    }
  },
  'gemini-2.5-pro-preview-tts': {
    family: 'gemini', capabilities: ['text', 'audio', 'tts'], contextWindow: 8000,
    providers: {
      'google-subscription': 'gemini-2.5-pro-preview-tts',
      'google-oauth': 'gemini-2.5-pro-preview-tts',
      'google-api': 'gemini-2.5-pro-preview-tts',
      'vertex-google': 'gemini-2.5-pro-preview-tts',
      'openrouter': 'google/gemini-2.5-pro-preview-tts'
    }
  },

  // GEMINI 3 SERIES
  'gemini-3-flash-preview': {
    family: 'gemini', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-3-flash-preview',
      'google-oauth': 'gemini-3-flash-preview',
      'google-api': 'gemini-3-flash-preview',
      'vertex-google': 'gemini-3-flash-preview',
      'github-copilot': 'gemini-3-flash-preview',
      'openrouter': 'google/gemini-3-flash-preview'
    }
  },
  'gemini-3-pro-preview': {
    family: 'gemini', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 1000000,
    providers: {
      'google-subscription': 'gemini-3-pro-preview',
      'google-oauth': 'gemini-3-pro-preview',
      'google-api': 'gemini-3-pro-preview',
      'vertex-google': 'gemini-3-pro-preview',
      'github-copilot': 'gemini-3-pro-preview',
      'openrouter': 'google/gemini-3-pro-preview'
    }
  },

  // GEMINI UTILITY MODELS
  'gemini-embedding-001': {
    family: 'gemini', capabilities: ['embedding'], contextWindow: 2048,
    providers: {
      'google-subscription': 'gemini-embedding-001',
      'google-oauth': 'gemini-embedding-001',
      'google-api': 'gemini-embedding-001',
      'vertex-google': 'gemini-embedding-001'
    }
  },
  'gemini-flash-latest': {
    family: 'gemini', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-flash-latest',
      'google-oauth': 'gemini-flash-latest',
      'google-api': 'gemini-flash-latest',
      'vertex-google': 'gemini-flash-latest',
      'openrouter': 'google/gemini-flash-latest'
    }
  },
  'gemini-flash-lite-latest': {
    family: 'gemini', capabilities: ['text', 'vision', 'code'], contextWindow: 1048576,
    providers: {
      'google-subscription': 'gemini-flash-lite-latest',
      'google-oauth': 'gemini-flash-lite-latest',
      'google-api': 'gemini-flash-lite-latest',
      'vertex-google': 'gemini-flash-lite-latest',
      'openrouter': 'google/gemini-flash-lite-latest'
    }
  },

  // GEMINI LIVE (Real-time)
  'gemini-live-2.5-flash': {
    family: 'gemini', capabilities: ['text', 'vision', 'audio', 'realtime'], contextWindow: 128000,
    providers: {
      'google-subscription': 'gemini-live-2.5-flash',
      'google-oauth': 'gemini-live-2.5-flash',
      'google-api': 'gemini-live-2.5-flash',
      'vertex-google': 'gemini-live-2.5-flash',
      'openrouter': 'google/gemini-live-2.5-flash'
    }
  },
  'gemini-live-2.5-flash-preview-native-audio': {
    family: 'gemini', capabilities: ['text', 'audio', 'realtime'], contextWindow: 131072,
    providers: {
      'google-subscription': 'gemini-live-2.5-flash-preview-native-audio',
      'google-oauth': 'gemini-live-2.5-flash-preview-native-audio',
      'google-api': 'gemini-live-2.5-flash-preview-native-audio',
      'vertex-google': 'gemini-live-2.5-flash-preview-native-audio',
      'openrouter': 'google/gemini-live-2.5-flash-preview-native-audio'
    }
  },

  // ANTIGRAVITY (Google OAuth-based access to various models)
  'antigravity-gemini-3-flash': {
    family: 'antigravity', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 1000000,
    thinkingMode: 'minimal',
    providers: {
      'opencode-antigravity-auth': 'google/antigravity-gemini-3-flash',
      'google-oauth': 'google/antigravity-gemini-3-flash',
      'openrouter': 'google/antigravity-gemini-3-flash'
    }
  },
  'antigravity-gemini-3-pro-low': {
    family: 'antigravity', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 1000000,
    thinkingMode: 'low',
    providers: {
      'opencode-antigravity-auth': 'google/antigravity-gemini-3-pro-low',
      'google-oauth': 'google/antigravity-gemini-3-pro-low',
      'openrouter': 'google/antigravity-gemini-3-pro-low'
    }
  },
  'antigravity-gemini-3-pro-high': {
    family: 'antigravity', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 1000000,
    thinkingMode: 'high',
    providers: {
      'opencode-antigravity-auth': 'google/antigravity-gemini-3-pro-high',
      'google-oauth': 'google/antigravity-gemini-3-pro-high',
      'openrouter': 'google/antigravity-gemini-3-pro-high'
    }
  },
  'antigravity-claude-sonnet-4-5': {
    family: 'antigravity', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    thinkingMode: 'none',
    providers: {
      'opencode-antigravity-auth': 'google/antigravity-claude-sonnet-4-5',
      'google-oauth': 'google/antigravity-claude-sonnet-4-5',
      'openrouter': 'google/antigravity-claude-sonnet-4-5'
    }
  },
  'antigravity-claude-sonnet-4-5-thinking-low': {
    family: 'antigravity', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    thinkingMode: 'low', thinkingBudget: 8192,
    providers: {
      'opencode-antigravity-auth': 'google/antigravity-claude-sonnet-4-5-thinking-low',
      'google-oauth': 'google/antigravity-claude-sonnet-4-5-thinking-low',
      'openrouter': 'google/antigravity-claude-sonnet-4-5-thinking-low'
    }
  },
  'antigravity-claude-sonnet-4-5-thinking-medium': {
    family: 'antigravity', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    thinkingMode: 'medium', thinkingBudget: 16384,
    providers: {
      'opencode-antigravity-auth': 'google/antigravity-claude-sonnet-4-5-thinking-medium',
      'google-oauth': 'google/antigravity-claude-sonnet-4-5-thinking-medium',
      'openrouter': 'google/antigravity-claude-sonnet-4-5-thinking-medium'
    }
  },
  'antigravity-claude-sonnet-4-5-thinking-high': {
    family: 'antigravity', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    thinkingMode: 'high', thinkingBudget: 32768,
    providers: {
      'opencode-antigravity-auth': 'google/antigravity-claude-sonnet-4-5-thinking-high',
      'google-oauth': 'google/antigravity-claude-sonnet-4-5-thinking-high',
      'openrouter': 'google/antigravity-claude-sonnet-4-5-thinking-high'
    }
  },
  'antigravity-claude-opus-4-5-thinking-low': {
    family: 'antigravity', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    thinkingMode: 'low', thinkingBudget: 8192,
    providers: {
      'opencode-antigravity-auth': 'google/antigravity-claude-opus-4-5-thinking-low',
      'google-oauth': 'google/antigravity-claude-opus-4-5-thinking-low',
      'openrouter': 'google/antigravity-claude-opus-4-5-thinking-low'
    }
  },
  'antigravity-claude-opus-4-5-thinking-medium': {
    family: 'antigravity', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    thinkingMode: 'medium', thinkingBudget: 16384,
    providers: {
      'opencode-antigravity-auth': 'google/antigravity-claude-opus-4-5-thinking-medium',
      'google-oauth': 'google/antigravity-claude-opus-4-5-thinking-medium',
      'openrouter': 'google/antigravity-claude-opus-4-5-thinking-medium'
    }
  },
  'antigravity-claude-opus-4-5-thinking-high': {
    family: 'antigravity', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 200000,
    thinkingMode: 'high', thinkingBudget: 32768,
    providers: {
      'opencode-antigravity-auth': 'google/antigravity-claude-opus-4-5-thinking-high',
      'google-oauth': 'google/antigravity-claude-opus-4-5-thinking-high',
      'openrouter': 'google/antigravity-claude-opus-4-5-thinking-high'
    }
  },

  // META LLAMA
  'llama-4-maverick': {
    family: 'llama', capabilities: ['text', 'vision', 'code'], contextWindow: 1000000,
    providers: {
      'bedrock': 'meta.llama-4-maverick-17b-128e-instruct-v1:0',
      'together': 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
      'openrouter': 'meta-llama/llama-4-maverick'
    }
  },
  'llama-3.3-70b': {
    family: 'llama', capabilities: ['text', 'code'], contextWindow: 128000,
    providers: {
      'bedrock': 'meta.llama-3-3-70b-instruct-v1:0',
      'together': 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      'groq': 'llama-3.3-70b-versatile',
      'openrouter': 'meta-llama/llama-3.3-70b-instruct'
    }
  },

  // MISTRAL
  'mistral-large': {
    family: 'mistral', capabilities: ['text', 'code'], contextWindow: 128000,
    providers: {
      'mistral-api': 'mistral-large-2411',
      'bedrock': 'mistral.mistral-large-2411-v1:0',
      'azure': 'mistral-large-2411',
      'openrouter': 'mistralai/mistral-large'
    }
  },
  'codestral': {
    family: 'mistral', capabilities: ['code'], contextWindow: 256000,
    providers: {
      'mistral-api': 'codestral-2501',
      'openrouter': 'mistralai/codestral'
    }
  },

  // XAI GROK
  'grok-3': {
    family: 'grok', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 131072,
    providers: {
      'xai-subscription': 'grok-3',
      'xai-api': 'grok-3',
      'openrouter': 'x-ai/grok-3'
    }
  },
  'grok-3-mini': {
    family: 'grok', capabilities: ['text', 'code', 'reasoning'], contextWindow: 131072,
    providers: {
      'xai-subscription': 'grok-3-mini',
      'xai-api': 'grok-3-mini',
      'openrouter': 'x-ai/grok-3-mini'
    }
  },
  'grok-code-fast-1': {
    family: 'grok', capabilities: ['code'], contextWindow: 128000,
    providers: {
      'github-copilot': 'grok-code-fast-1',
      'openrouter': 'x-ai/grok-code-fast-1'
    }
  },

  // DEEPSEEK
  'deepseek-r1': {
    family: 'deepseek', capabilities: ['text', 'code', 'reasoning'], contextWindow: 128000,
    providers: {
      'deepseek-api': 'deepseek-reasoner',
      'together': 'deepseek-ai/DeepSeek-R1',
      'openrouter': 'deepseek/deepseek-r1'
    }
  },
  'deepseek-v3': {
    family: 'deepseek', capabilities: ['text', 'code'], contextWindow: 128000,
    providers: {
      'deepseek-api': 'deepseek-chat',
      'together': 'deepseek-ai/DeepSeek-V3',
      'openrouter': 'deepseek/deepseek-chat'
    }
  },

  // COHERE
  'command-r-plus': {
    family: 'cohere', capabilities: ['text', 'code', 'rag'], contextWindow: 128000,
    providers: {
      'cohere-api': 'command-r-plus-08-2024',
      'bedrock': 'cohere.command-r-plus-v1:0',
      'openrouter': 'cohere/command-r-plus'
    }
  },

  // QWEN
  'qwen-2.5-72b': {
    family: 'qwen', capabilities: ['text', 'code'], contextWindow: 128000,
    providers: {
      'together': 'Qwen/Qwen2.5-72B-Instruct-Turbo',
      'openrouter': 'qwen/qwen-2.5-72b-instruct'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RAPTOR (GitHub Copilot Experimental)
  // ═══════════════════════════════════════════════════════════════════════════
  'raptor-mini': {
    family: 'raptor', capabilities: ['text', 'code', 'reasoning'], contextWindow: 200000,
    providers: {
      'github-copilot': 'oswe-vscode-prime'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Z.AI CODING PLAN (GLM Series)
  // ═══════════════════════════════════════════════════════════════════════════
  'glm-4.5': {
    family: 'glm', capabilities: ['text', 'code', 'reasoning'], contextWindow: 131072,
    providers: {
      'zai-coding-plan': 'glm-4.5',
      'openrouter': 'zhipu/glm-4.5'
    }
  },
  'glm-4.5-air': {
    family: 'glm', capabilities: ['text', 'code'], contextWindow: 131072,
    providers: {
      'zai-coding-plan': 'glm-4.5-air',
      'openrouter': 'zhipu/glm-4.5-air'
    }
  },
  'glm-4.5-flash': {
    family: 'glm', capabilities: ['text', 'code'], contextWindow: 131072,
    providers: {
      'zai-coding-plan': 'glm-4.5-flash',
      'openrouter': 'zhipu/glm-4.5-flash'
    }
  },
  'glm-4.5v': {
    family: 'glm', capabilities: ['text', 'vision', 'code'], contextWindow: 64000,
    providers: {
      'zai-coding-plan': 'glm-4.5v',
      'openrouter': 'zhipu/glm-4.5v'
    }
  },
  'glm-4.6': {
    family: 'glm', capabilities: ['text', 'code', 'reasoning'], contextWindow: 204800,
    providers: {
      'zai-coding-plan': 'glm-4.6',
      'openrouter': 'zhipu/glm-4.6'
    }
  },
  'glm-4.6v': {
    family: 'glm', capabilities: ['text', 'vision', 'code', 'reasoning'], contextWindow: 128000,
    providers: {
      'zai-coding-plan': 'glm-4.6v',
      'openrouter': 'zhipu/glm-4.6v'
    }
  },
  'glm-4.7': {
    family: 'glm', capabilities: ['text', 'code', 'reasoning'], contextWindow: 204800,
    providers: {
      'zai-coding-plan': 'glm-4.7',
      'openrouter': 'zhipu/glm-4.7'
    }
  }
};

export function getModelsByFamily(family) {
  return Object.entries(MODEL_REGISTRY)
    .filter(([_, m]) => m.family === family)
    .map(([name, m]) => ({ id: name, name, ...m }));
}

export function getModelsByCapability(capability) {
  return Object.entries(MODEL_REGISTRY)
    .filter(([_, m]) => m.capabilities.includes(capability))
    .map(([name, m]) => ({ id: name, name, ...m }));
}

export function getProviderModelId(canonicalName, providerId) {
  const model = MODEL_REGISTRY[canonicalName];
  return model?.providers[providerId] || null;
}

export function getProvidersForModel(canonicalName) {
  const model = MODEL_REGISTRY[canonicalName];
  return model ? Object.keys(model.providers) : [];
}

export function listAllModels() {
  return Object.keys(MODEL_REGISTRY);
}

export function getModelInfo(canonicalName) {
  return MODEL_REGISTRY[canonicalName] || null;
}

// Additional ESM exports for MCP compatibility
export function getModels() {
  return Object.entries(MODEL_REGISTRY).map(([id, m]) => ({ id, ...m }));
}

export function getModelById(id) {
  const model = MODEL_REGISTRY[id];
  return model ? { id, ...model } : null;
}

export function getModelsByProvider(providerId) {
  return Object.entries(MODEL_REGISTRY)
    .filter(([_, m]) => m.providers && m.providers[providerId])
    .map(([id, m]) => ({ id, ...m }));
}

// Default export for convenience
export default {
  MODEL_REGISTRY,
  getModelsByFamily,
  getModelsByCapability,
  getProviderModelId,
  getProvidersForModel,
  listAllModels,
  getModelInfo,
  getModels,
  getModelById,
  getModelsByProvider
};
