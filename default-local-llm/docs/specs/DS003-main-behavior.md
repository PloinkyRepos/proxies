---
title: DS003-main-behavior
summary: Defines readiness-gated local inference and buffered or streaming Chat Completions forwarding as the agent's main behaviors.
---

## Introduction

[Default Local LLM](wiki.html#definition-default-local-llm) lets a Ploinky consumer send OpenAI-compatible Chat Completions requests to a local model without connecting directly to llama.cpp.

## Core Content

### Main Behavior Components

| Name | Explanation |
| --- | --- |
| Readiness-gated local model service | An operator receives an AgentServer endpoint only after the configured model exists and llama-server reports healthy. |
| Buffered and streaming Chat Completions forwarding | A Ploinky consumer sends one OpenAI-compatible request and receives llama-server JSON or Server-Sent Events through AgentServer. |

### Readiness-gated local model service

An operator or Ploinky lifecycle action initiates `startup.sh`. The agent must verify the selected [model artifact](wiki.html#definition-model-artifact), launch [llama-server](wiki.html#definition-llama-server) on loopback with the configured model and resource arguments, and wait for its health route. Only a healthy inference process may trigger AgentServer startup and successful Ploinky readiness. A missing model, early process exit, or unavailable health route must leave the agent unavailable and must produce a diagnostic error. The agent must not expose llama-server itself as the supported client boundary.

### Buffered and streaming Chat Completions forwarding

A Ploinky consumer initiates the AgentServer Chat Completions endpoint with an envelope whose `request.messages` is an array. The [Chat Completions handler](wiki.html#definition-chat-completions-handler) must forward the entire request to llama-server. A buffered request must return the upstream JSON response, while a streaming request must copy upstream Server-Sent Events chunks without buffering or reinterpretation. Invalid input must exit with status 2, and an unavailable or unsuccessful upstream must exit with status 1 so AgentServer produces a server error. The handler must not retry, select another model, or synthesize a successful response.
