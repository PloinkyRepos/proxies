---
title: DS004-search-interfaces-settings-and-providers
summary: Defines SearchAgent MCP and OpenAI contracts, persistent limits, provider readiness, secrets, normalization, and errors.
---

## Introduction

This specification owns the detailed public interfaces, settings, provider catalog, and failure boundaries that support SearchAgent's defining behaviors.

## Core Content

The MCP catalog must expose `search_agent_search`, `search_agent_get_settings`, and `search_agent_update_settings`. Search input must reject missing or blank provider and query values. `maxResults` must be clamped to the active persisted limit.

The Chat Completions handler must use `request.model` as the provider and the latest user message as the query. Invalid chat search input must still produce an OpenAI completion whose assistant text contains the structured SearchAgent error. The Models handler must list only ready providers and must include the `search` tag, search and retrieval capabilities, active limits, and pricing mode.

SearchAgent must persist exactly `maxResults` and `maxQueryChars` in `$HOME/search-agent-settings.json`. It must normalize their values to 1–100 and 1–20000, write through a temporary file and rename, and use defaults of 20 and 4000 when the file does not exist. Provider selection and provider keys must not enter this file.

The provider registry must contain `duckduckgo`, `tavily`, `brave`, `exa`, `serper`, `searxng`, `jina`, `gemini`, `deep-research`, and `google-ai-mode`. Providers with required secrets must be ready only when those secrets are present. `jina` may use `JINA_API_KEY` but must remain usable without it. The [deep-research provider](wiki.html#definition-deep-research) must use its configured provider list, tolerate individual failures, identify source providers, and deduplicate combined results by URL.

SearchAgent must obtain missing provider credentials through the internal `dpu_agent_secret_get` operation and must return masked hints from the settings tool. Process environment credentials may satisfy the same provider requirement without an additional DPU read. The settings UI must grant stored provider credentials to `agent:proxies/searchAgent` and must not expose raw stored values.

Search-shaped failures must contain `ok: false`, an error with code, message, and retryability, and an empty results array. Provider HTTP errors may include a short upstream response preview for diagnosis, but must not expose credentials. Operational logs must use standard error and must omit request and result content by default.
