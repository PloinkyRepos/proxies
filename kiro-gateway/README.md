# Kiro Gateway Agent

OpenAI/Anthropic compatible proxy for Kiro API (Claude models via AWS CodeWhisperer).

## Quick Start

### 1. Add the proxies repo to ploinky

```bash
ploinky add repo proxies
```

### 2. Start the agent

```bash
ploinky start kiro-gateway
```

### 3. Authenticate with Kiro

```bash
ploinky cli kiro-gateway
```

This will display a device code and URL. Open the URL in your browser and enter the code to authenticate.

## Configuration

### PROXY_API_KEY

The API key used to authenticate requests to the gateway. Default: `kiro-gateway-key`

To set a custom key:

```bash
ploinky var PROXY_API_KEY your-secret-key
ploinky restart
```

## Usage with opencode

Edit `~/.config/opencode/opencode.json` and add the Kiro provider:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "kiro/claude-sonnet-4",
  "provider": {
    "kiro": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Kiro Gateway",
      "options": {
        "baseURL": "http://localhost:8000/v1",
        "headers": {
          "Authorization": "Bearer kiro-gateway-key"
        }
      },
      "models": {
        "auto": {
          "name": "Claude (Auto)"
        },
        "claude-sonnet-4.5": {
          "name": "Claude Sonnet 4.5"
        },
        "claude-sonnet-4": {
          "name": "Claude Sonnet 4"
        },
        "claude-3.7-sonnet": {
          "name": "Claude 3.7 Sonnet"
        },
        "claude-haiku-4.5": {
          "name": "Claude Haiku 4.5"
        }
      }
    }
  }
}
```

Then start opencode:

```bash
opencode
```

Use `Ctrl+K` to switch models and select a Kiro model.
