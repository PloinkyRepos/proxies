import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const manifestUrl = new URL('../manifest.json', import.meta.url);
const installUrl = new URL('../scripts/install-searxng.sh', import.meta.url);
const startUrl = new URL('../scripts/start-search-agent.sh', import.meta.url);
const readinessUrl = new URL('../readiness.sh', import.meta.url);
const browserPoolUrl = new URL('../src/browser/browser-pool.mjs', import.meta.url);

test('SearchAgent uses the dedicated unprivileged runtime image', async () => {
    const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
    const install = await readFile(installUrl, 'utf8');
    const start = await readFile(startUrl, 'utf8');
    const readiness = await readFile(readinessUrl, 'utf8');

    assert.equal(manifest.container, 'docker.io/assistos/search-agent@sha256:d366ee752f6065192f9fd8fa03647b8fba33c2ebdb879a085dee5498fba82f0e');
    assert.equal(manifest.profiles.default.install, 'sh /code/scripts/install-searxng.sh');
    assert.doesNotMatch(install, /\b(?:apt-get|apk|dnf|yum)\b/);
    assert.doesNotMatch(install, /\bgit\s+(?:clone|pull|fetch)\b/);
    assert.match(install, /\/opt\/search-agent/);
    assert.match(install, /configure-searxng-settings\.mjs/);
    assert.match(start, /SEARXNG_VENV:-\/opt\/search-agent\/searx-pyenv/);
    assert.match(start, /SEARXNG_APP_DIR:-\/opt\/search-agent\/searxng-src/);
    assert.match(start, /SEARXNG_PORT}\/healthz/);
    assert.match(readiness, /127\.0\.0\.1:8888\/healthz/);
    assert.doesNotMatch(readiness, /search\?q=/);
});

test('browser pool resolves Puppeteer from the image NODE_PATH contract', async () => {
    const source = await readFile(browserPoolUrl, 'utf8');
    assert.match(source, /createRequire\(import\.meta\.url\)/);
    assert.match(source, /pathToFileURL\(require\.resolve\('puppeteer-core'\)\)/);
});
