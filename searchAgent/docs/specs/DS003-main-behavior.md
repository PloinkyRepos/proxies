---
title: DS003-main-behavior
summary: Defines the normalized search, OpenAI-compatible access, and readiness and credential behaviors that produce SearchAgent's primary outcome.
---

## Introduction

[SearchAgent](wiki.html#definition-search-agent) lets an MCP caller or OpenAI-compatible client select a search provider, submit a query, and receive a stable search payload without implementing provider-specific transport or response parsing.

## Core Content

### Main Behavior Components

| Name | Explanation |
| --- | --- |
| Provider-selected normalized search | An MCP caller selects a provider and receives deduplicated results with stable fields or a structured search error. |
| OpenAI-compatible search access | An OpenAI-compatible client uses the model name as the provider and receives the search payload through Chat Completions or discovers ready providers through Models. |
| Readiness and credential isolation | An operator receives a service only after required local processes are healthy, while provider secrets remain outside ordinary SearchAgent settings and responses. |

### Provider-selected normalized search

An authenticated MCP caller initiates `search_agent_search` with `provider`, `query`, and optional `maxResults`. SearchAgent must validate the request, apply persisted query and result limits, load only the selected provider's declared credentials, call that provider, and return [normalized search results](wiki.html#definition-normalized-search-result). Entries without URLs must be discarded, exact duplicate URLs must be collapsed, and useful provider fields must be preserved. The caller must receive a structured non-retryable error for invalid input or unknown providers and a classified provider error when execution fails. SearchAgent must not select or persist a provider on the caller's behalf.

### OpenAI-compatible search access

An OpenAI-compatible client initiates `/v1/chat/completions` through AgentServer with a provider key in `model` and a query in the latest non-empty user message. SearchAgent must run the same provider search with a ten-result request limit and return the complete search payload as JSON text in the assistant message. Streaming must emit the same text as one delta followed by a finish chunk and `[DONE]`. The `/v1/models` handler must expose only ready providers and must describe each as a search-capable model. These endpoints must remain adapters over SearchAgent behavior rather than independent search implementations.

### Readiness and credential isolation

An operator or dependent agent initiates SearchAgent through its manual Ploinky activation. Startup must make required [SearXNG](wiki.html#definition-searxng) and AgentServer processes healthy before readiness succeeds, and it may add the optional browser pool when available. Provider listing must omit providers whose required [DPU secrets](wiki.html#definition-dpu-secret) or local services are unavailable. Search execution must keep credentials outside non-secret settings, response payloads, and default logs. Readiness discovery is a point-in-time result and must not be represented as a guarantee that an upstream provider cannot fail later.
