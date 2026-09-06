---
title: DS001-coding-style
summary: Defines Default Local LLM shell, JavaScript, error-reporting, documentation, and test conventions.
---

## Introduction

This specification is the coding-style authority for Default Local LLM. The small agent must keep lifecycle and request-forwarding responsibilities explicit.

## Core Content

JavaScript must use ES modules and four-space indentation. JSON must use two-space indentation. Shell scripts must use strict error handling and must quote runtime paths and values.

`startup.sh` must own model-file validation, llama-server launch, health waiting, child cleanup, and AgentServer handoff. `healthcheck.sh` must remain a focused readiness check. `chat-completions.mjs` must own AgentServer envelope validation and loopback request forwarding without absorbing process lifecycle concerns.

Errors written for runtime diagnosis must use standard error. Buffered responses and streaming chunks must use standard output so AgentServer can forward them without mixed log data. Error messages must not include more upstream response content than needed for diagnosis.

Tests must use Node's built-in test runner, keep request forwarding deterministic through injected fetch behavior, and cover valid envelope parsing, missing messages, successful forwarding, and non-2xx upstream behavior. Startup tests must execute the shell with isolated fake inference and AgentServer processes and verify thread arguments, defaults, invalid values, and the missing-model path without loading a model. The agent suite must run through `node --test *.test.mjs`.

Documentation, specifications, comments, and user-facing strings must be English. Behavior changes must update the relevant HTML explanation and DS contract. DS prose must remain unwrapped in source, use only `Introduction` and `Core Content` as top-level content sections, and avoid Q&A or conclusion sections.
