import test from 'node:test';
import assert from 'node:assert/strict';

import { isBrowserConnected } from '../src/browser/browser-pool.mjs';

test('browser connection detection supports Puppeteer 25 connected property', () => {
    assert.equal(isBrowserConnected({ connected: true }), true);
    assert.equal(isBrowserConnected({ connected: false }), false);
});

test('browser connection detection remains compatible with older Puppeteer', () => {
    assert.equal(isBrowserConnected({ connected: false, isConnected: () => true }), true);
    assert.equal(isBrowserConnected({ connected: true, isConnected: () => false }), false);
    assert.equal(isBrowserConnected(null), false);
});
