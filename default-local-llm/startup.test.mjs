import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const startupPath = fileURLToPath(new URL('./startup.sh', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('./manifest.json', import.meta.url), 'utf8'));

function createFixture(t) {
    const root = mkdtempSync(path.join(tmpdir(), 'llama-startup-'));
    const bin = path.join(root, 'bin');
    const agentLib = path.join(root, 'agent lib');
    const capture = path.join(root, 'llama.json');
    const handoff = path.join(root, 'handoff');
    const model = path.join(root, 'test model.gguf');
    mkdirSync(bin);
    mkdirSync(path.join(agentLib, 'server'), { recursive: true });
    writeFileSync(model, 'fixture only; never load a real model');
    function executable(name, source) {
        const target = path.join(bin, name);
        writeFileSync(target, `#!${process.execPath}\n${source}`, { mode: 0o700 });
        return target;
    }
    const llama = executable('llama-stub', `
        const fs = require('node:fs');
        fs.writeFileSync(process.env.TEST_CAPTURE, JSON.stringify({ pid: process.pid, args: process.argv.slice(2) }));
        setInterval(() => {}, 1000);
    `);
    executable('curl', `
        const fs = require('node:fs');
        const deadline = Date.now() + 2000;
        function ready() {
            try {
                JSON.parse(fs.readFileSync(process.env.TEST_CAPTURE, 'utf8'));
                process.exit(0);
            } catch (_) {
                if (Date.now() >= deadline) process.exit(1);
                setTimeout(ready, 10);
            }
        }
        ready();
    `);
    const finish = executable('handoff-stub', `
        const fs = require('node:fs');
        const { pid } = JSON.parse(fs.readFileSync(process.env.TEST_CAPTURE, 'utf8'));
        process.kill(pid, 'SIGTERM');
        fs.writeFileSync(process.env.TEST_HANDOFF, 'ready');
    `);
    writeFileSync(path.join(agentLib, 'server', 'AgentServer.sh'), 'exec "$TEST_FINISH"\n');
    t.after(() => {
        if (!existsSync(handoff) && existsSync(capture)) {
            const { pid } = JSON.parse(readFileSync(capture, 'utf8'));
            try { process.kill(pid, 'SIGTERM'); } catch (error) {
                if (error.code !== 'ESRCH') throw error;
            }
        }
        rmSync(root, { recursive: true, force: true });
    });
    return {
        root, capture, handoff, model,
        env: {
            PATH: `${bin}:${path.dirname(process.execPath)}:/usr/bin:/bin`,
            LLAMA_MODEL_PATH: model,
            LLAMA_SERVER_BIN: llama,
            LLAMA_LOG: path.join(root, 'llama.log'),
            PLOINKY_AGENT_LIB_DIR: agentLib,
            TEST_CAPTURE: capture,
            TEST_HANDOFF: handoff,
            TEST_FINISH: finish,
        },
    };
}

function runStartup(fixture, overrides = {}) {
    const result = spawnSync('bash', [startupPath], {
        env: { ...fixture.env, ...overrides },
        encoding: 'utf8',
        timeout: 10000,
    });
    assert.ifError(result.error);
    return result;
}

for (const [label, env, generation, batch] of [
    ['unset values', {}, '2', '2'],
    ['legacy empty values', { LLAMA_THREADS: '', LLAMA_THREADS_BATCH: '' }, '2', '2'],
    ['inherited prompt count', { LLAMA_THREADS: '3' }, '3', '3'],
    ['independent prompt count', { LLAMA_THREADS: '2', LLAMA_THREADS_BATCH: '1' }, '2', '1'],
    ['prompt override alone', { LLAMA_THREADS_BATCH: '4' }, '2', '4'],
    ['minimum count', { LLAMA_THREADS: '1' }, '1', '1'],
    ['integer parser upper boundary', { LLAMA_THREADS: '2147483647' }, '2147483647', '2147483647'],
]) {
    test(`startup passes explicit generation and prompt limits: ${label}`, (t) => {
        const fixture = createFixture(t);
        const result = runStartup(fixture, env);
        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stderr, '');
        assert.equal(readFileSync(fixture.handoff, 'utf8'), 'ready');
        assert.deepEqual(JSON.parse(readFileSync(fixture.capture, 'utf8')).args, [
            '--model', fixture.model, '--host', '127.0.0.1', '--port', '8080',
            '--ctx-size', '4096', '--threads', generation, '--threads-batch', batch,
        ]);
        assert.match(result.stdout, new RegExp(`inference threads: generation=${generation} prompt=${batch}`));
    });
}

for (const variable of ['LLAMA_THREADS', 'LLAMA_THREADS_BATCH']) {
    for (const value of ['0', '-1', '1.5', ' 2', '2 ', '02', 'auto', '２', '2147483648', '9'.repeat(200), '2 --host 0.0.0.0', '$(touch SHOULD_NOT_EXIST)']) {
        test(`startup rejects ${variable}=${JSON.stringify(value)} before launch`, (t) => {
            const fixture = createFixture(t);
            const result = runStartup(fixture, { [variable]: value });
            assert.equal(result.status, 1);
            assert.match(result.stderr, new RegExp(`${variable} must be a positive integer between 1 and 2147483647`));
            assert.equal(result.stdout, '');
            assert.equal(existsSync(fixture.capture), false);
            assert.equal(existsSync(fixture.handoff), false);
        });
    }
}

test('missing model still fails before either process starts', (t) => {
    const fixture = createFixture(t);
    const result = runStartup(fixture, { LLAMA_MODEL_PATH: path.join(fixture.root, 'missing.gguf') });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /model file missing/);
    assert.equal(existsSync(fixture.capture), false);
    assert.equal(existsSync(fixture.handoff), false);
});

test('manifest defaults retain the startup thread budget and prompt inheritance', () => {
    assert.deepEqual(manifest.profiles.default.env.LLAMA_THREADS, { required: false, default: '2' });
    assert.deepEqual(manifest.profiles.default.env.LLAMA_THREADS_BATCH, { required: false, default: '' });
});
