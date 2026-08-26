#!/usr/bin/env sh
set -eu

SEARXNG_HOME="${SEARXNG_HOME:-/opt/search-agent}"
SEARXNG_CLONE_DIR="${SEARXNG_HOME}/searxng-src"
SEARXNG_VENV="${SEARXNG_HOME}/searx-pyenv"

if [ ! -x "${SEARXNG_VENV}/bin/python" ] || [ ! -d "${SEARXNG_CLONE_DIR}/searx" ]; then
    echo "ERROR: SearchAgent runtime dependencies are missing from ${SEARXNG_HOME}." >&2
    echo "Use docker.io/assistos/search-agent:searxng-browser; runtime installation does not require root." >&2
    exit 1
fi

if ! command -v chromium >/dev/null 2>&1; then
    echo "ERROR: Chromium is missing from the SearchAgent runtime image." >&2
    exit 1
fi

if ! node -e "require('puppeteer-core')" >/dev/null 2>&1; then
    echo "ERROR: puppeteer-core is missing from the SearchAgent runtime image." >&2
    exit 1
fi

node /code/scripts/configure-searxng-settings.mjs
