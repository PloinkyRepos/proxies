#!/bin/sh
set -eu
curl -fsS "http://127.0.0.1:${LLAMA_SERVER_PORT:-8080}/health" >/dev/null
