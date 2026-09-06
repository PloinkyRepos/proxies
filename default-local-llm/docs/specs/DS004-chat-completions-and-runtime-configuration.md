---
title: DS004-chat-completions-and-runtime-configuration
summary: Defines the handler envelope, upstream request and response behavior, runtime variables, readiness settings, and errors.
---

## Introduction

This specification owns the detailed Chat Completions and runtime-configuration contract for Default Local LLM.

## Core Content

The AgentServer handler input must be a JSON object with a `request` object whose `messages` field is an array. The handler may ignore envelope metadata, but it must forward every field inside the request object unchanged to `/v1/chat/completions` on the configured loopback llama-server base URL.

For non-streaming requests, the handler must require an HTTP success response, parse the body as JSON, and write that JSON object to standard output. A non-success response must include its status and no more than the first 200 characters of response text in the thrown diagnostic.

For `stream: true`, the handler must require a successful upstream response with a readable body and must copy each body chunk to standard output. It must not buffer, parse, combine, or generate SSE events. An unsuccessful streaming response or missing body must cause a non-zero exit.

| Variable | Contract |
| --- | --- |
| `LLAMA_MODEL_PATH` | Selects the required GGUF file and defaults to `/opt/models/Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf`. |
| `LLAMA_SERVER_PORT` | Selects the loopback llama-server port and defaults to `8080`. |
| `LLAMA_SERVER_BIN` | Selects the inference executable and defaults to `llama-server`. |
| `LLAMA_CTX_SIZE` | Supplies `--ctx-size` and defaults to `4096`. |
| `LLAMA_THREADS` | Supplies `--threads` for generation; unset or empty values default to `2`. |
| `LLAMA_THREADS_BATCH` | Supplies `--threads-batch` for prompt processing; unset or empty values inherit the effective `LLAMA_THREADS`. |
| `LLAMA_LOG` | Selects the llama-server log and defaults to `/tmp/llama-server.log`. |
| `PLOINKY_AGENT_LIB_DIR` | Locates AgentServer and defaults to `/Agent`. |

Both thread settings must be decimal positive integers from 1 through 2147483647 without leading zeroes. Invalid values must produce a diagnostic and a non-zero exit before either service starts. The generation default is deliberately conservative for shared workspaces; operators may independently tune both counts. These settings constrain inference parallelism but must not be represented as a hard process CPU quota or CPU-core reservation.

The manifest must declare Chat Completions streaming support and must configure readiness with `healthcheck.sh`, a five-second interval, a ten-second timeout, and a failure threshold of 60. The readiness script must fail unless the configured loopback `/health` request succeeds.

Malformed JSON or a missing messages array must write a bad-input diagnostic and exit with status 2. Fetch failures, non-success upstream responses, missing streaming bodies, and invalid buffered JSON must write an upstream diagnostic and exit with status 1. Neither error path may emit a partial successful JSON completion.
