#!/bin/sh
set -eu

node --input-type=module <<'NODE'
const checks = [
    {
        label: 'AgentServer',
        url: 'http://127.0.0.1:7000/health',
        validate: async (response) => {
            const payload = await response.json();
            if (payload?.ok !== true) {
                throw new Error(`unexpected payload ${JSON.stringify(payload).slice(0, 500)}`);
            }
        },
    },
    {
        label: 'SearXNG',
        url: 'http://127.0.0.1:8888/healthz',
        validate: async (response) => {
            const payload = (await response.text()).trim();
            if (payload !== 'OK') {
                throw new Error(`unexpected payload ${JSON.stringify(payload).slice(0, 500)}`);
            }
        },
    },
];

for (const check of checks) {
    try {
        const response = await fetch(check.url, {
            headers: { accept: 'application/json' },
            signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        await check.validate(response);
    } catch (error) {
        console.error(`${check.label} is not ready on ${check.url}: ${error?.message || error}`);
        process.exit(1);
    }
}
NODE
