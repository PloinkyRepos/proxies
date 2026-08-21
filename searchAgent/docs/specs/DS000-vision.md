---
title: DS000-vision
summary: Defines SearchAgent's purpose, users, product boundary, and documentation authority.
---

## Introduction

[SearchAgent](wiki.html#definition-search-agent) gives agents and integrations one provider-selectable interface for normalized web search without exposing provider-specific result shapes or storing provider credentials in ordinary settings.

## Core Content

SearchAgent must accept searches through its authenticated MCP tool and its OpenAI-compatible Chat Completions handler. Both interfaces must select the provider from explicit request data and must return the same stable search outcome.

Every successful result must use the [normalized search result](wiki.html#definition-normalized-search-result) contract with `title`, `url`, and `snippet` fields while preserving useful provider fields. SearchAgent must not claim equivalent ranking semantics across independent providers.

Non-secret limits must remain separate from [DPU secrets](wiki.html#definition-dpu-secret). Provider credentials must not be persisted in `$HOME/search-agent-settings.json`, emitted in tool responses, or recorded in operational logs.

The HTML documentation must explain practical use and runtime behavior, the wiki must remain the canonical terminology source, and the DS files must remain the authoritative requirements.
