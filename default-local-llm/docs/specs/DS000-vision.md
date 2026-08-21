---
title: DS000-vision
summary: Defines Default Local LLM's purpose, consumer outcome, product boundary, and documentation authority.
---

## Introduction

[Default Local LLM](wiki.html#definition-default-local-llm) gives Ploinky consumers a local OpenAI-compatible Chat Completions service backed by a model bundled with the agent image.

## Core Content

The agent must keep llama.cpp inference on loopback and must expose it through the shared [AgentServer](wiki.html#definition-agentserver). Consumers must not need direct access to the inference-process port.

The default image must supply the Qwen2.5-Coder-1.5B-Instruct Q4_K_M [model artifact](wiki.html#definition-model-artifact), while runtime configuration may select another existing GGUF file and supported llama-server parameters.

The agent must preserve OpenAI-compatible buffered and streaming Chat Completions responses. It must not claim model discovery, embeddings, provider routing, retries, fallback, tool execution, or response normalization beyond the behavior supplied by llama-server and AgentServer.

The HTML documentation must explain operation and limits, the wiki must remain the canonical terminology source, and the DS files must remain the authoritative requirements.
