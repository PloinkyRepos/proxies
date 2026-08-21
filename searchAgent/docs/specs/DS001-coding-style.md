---
title: DS001-coding-style
summary: Defines SearchAgent source layout, module boundaries, logging, documentation, and test conventions.
---

## Introduction

This specification is the coding-style authority for SearchAgent. It governs maintainable changes without duplicating the runtime contracts owned by later specifications.

## Core Content

JavaScript must use ES modules and four-space indentation. Shell scripts must fail explicitly on required startup errors, and JSON must use two-space indentation.

The command handlers under `tools/` must own MCP business operations. `openai-api/` must adapt those operations to OpenAI-compatible request and response shapes. Shared validation, settings, secrets, normalization, logging, and tool I/O must remain in focused modules under `src/lib/`. Provider-specific transport and parsing must remain under `src/providers/`, while browser-pool lifecycle and protocol code must remain under `src/browser/`.

Tool payloads must use standard output and operational logs must use standard error. Logs must describe metadata needed for diagnosis without including raw queries, result content, URLs, or credentials by default.

Tests must use descriptive `.test.mjs` names under `test/`, keep provider network behavior deterministic through fixtures or local test servers, and cover normalization, settings persistence, public handlers, provider failures, discovery readiness, and manifest startup behavior. The complete SearchAgent suite must run through `node testAll.mjs`.

Documentation, specifications, comments, and user-facing strings must be English. Source behavior changes must update the relevant HTML explanation and DS contract in the same change. DS prose must remain unwrapped in source, use only `Introduction` and `Core Content` as top-level content sections, and avoid Q&A or conclusion sections.
