---
title: DS002-runtime-architecture
summary: Defines the llama-server and AgentServer process relationship, startup sequence, readiness, and shutdown boundaries.
---

## Introduction

Default Local LLM combines one loopback [llama-server](wiki.html#definition-llama-server) process with one client-facing [AgentServer](wiki.html#definition-agentserver) process.

## Core Content

Startup must verify the configured model file before starting either process. It must launch llama-server with the configured executable, model path, loopback host, port, context size, and optional thread count, and must direct llama-server output to the configured log file.

Startup must poll `http://127.0.0.1:${LLAMA_SERVER_PORT}/health` for up to 120 one-second attempts. It must fail with a diagnostic log tail when llama-server exits before readiness, and it must not start AgentServer until the health endpoint succeeds. The startup timeout boundary is the fixed attempt count; a process that remains alive but never becomes healthy does not acquire an additional success path.

After readiness, startup must replace its shell process with `${PLOINKY_AGENT_LIB_DIR:-/Agent}/server/AgentServer.sh`. Signal and exit cleanup must terminate the llama-server child when it remains owned by the startup process.

The manifest [readiness probe](wiki.html#definition-readiness-probe) must use the same loopback health endpoint with its declared interval, timeout, and failure threshold. The probe establishes availability of local inference but does not guarantee generation latency, capacity, or output quality.

The llama-server port must remain a loopback implementation boundary. AgentServer must remain the OpenAI-compatible client boundary declared by `endpoints.chatCompletions`.
