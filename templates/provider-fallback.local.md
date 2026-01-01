---
enabled: true
default_model: claude-4-sonnet
auto_switch: true
notify_on_switch: true
provider_priority:
  - anthropic-subscription
  - opencode-antigravity-auth
  - openai-subscription
  - google-subscription
  - zai-coding-plan
  - github-copilot
  - bedrock
  - vertex
  - openrouter
---

# Provider Fallback Configuration

This file configures the provider-fallback plugin for this project.

## Settings

- **enabled**: Enable/disable provider fallback for this project
- **default_model**: Preferred model to use
- **auto_switch**: Automatically switch providers when limits hit
- **notify_on_switch**: Show notification when provider switches
- **provider_priority**: Custom priority order (overrides global)

## Usage

Edit this file to customize provider behavior for this project.
Changes require Claude Code restart to take effect.
