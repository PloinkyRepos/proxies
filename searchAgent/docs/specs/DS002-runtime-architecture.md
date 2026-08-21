---
title: DS002-runtime-architecture
summary: Defines SearchAgent startup, AgentServer integration, local service ownership, readiness, and process boundaries.
---

## Introduction

SearchAgent is a manually activated Ploinky agent whose runtime combines required local search infrastructure, optional browser search, and the shared [AgentServer](wiki.html#definition-agentserver).

## Core Content

The manifest must retain manual startup. SearchAgent must start only after an operator or dependent workflow explicitly activates it, and its Ploinky runtime may maintain that activated service according to the surrounding workspace lifecycle.

The install hook must prepare the local [SearXNG](wiki.html#definition-searxng) Python environment and minimal settings. Startup must fail when the settings file or Python executable is missing, must launch SearXNG on `127.0.0.1:8888`, and must wait for a valid JSON search response before starting AgentServer.

Startup may launch the optional [Google AI Mode browser pool](wiki.html#definition-google-ai-mode-browser-pool) when Chromium and `puppeteer-core` are available. Failure of this optional sidecar must remove `google-ai-mode` from ready provider discovery without preventing other providers from running.

AgentServer must listen on the configured Ploinky agent port only after required local readiness succeeds. The readiness script must verify both AgentServer and SearXNG, and it must not require the optional browser pool.

The startup process must monitor AgentServer and SearXNG, terminate sibling child processes during cleanup, and stop the service when either required process exits. Loopback ports are internal runtime boundaries and are not independent public SearchAgent APIs.
