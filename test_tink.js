/** Test suite for tink-js (node --test or any test runner). */

import { test } from 'node:test';
import assert from 'node:assert';
import { crc32, frameEncode, frameNext, frameSkip } from './tink.js';

function utf8(s) { return new TextEncoder().encode(s); }

test('crc32 vector', () => {
  assert.strictEqual(crc32(utf8('123456789')), 0xCBF43926);
});

test('frame roundtrip', () => {
  const p = new Uint8Array([1, 2, 3]);
  const f = frameEncode(p);
  const [back, next] = frameNext(f, 0);
  assert.strictEqual(next, f.length);
  assert.deepStrictEqual(back, p);
});

test('empty frame roundtrip', () => {
  const f = frameEncode(new Uint8Array(0));
  const [back, next] = frameNext(f, 0);
  assert.strictEqual(next, f.length);
  assert.strictEqual(back.length, 0);
});

test('crc tamper rejected', () => {
  const f = frameEncode(new Uint8Array([1, 2, 3]));
  f[5] += 1; // tamper payload[1]
  assert.strictEqual(frameNext(f, 0), null);
});

test('frameSkip matches length', () => {
  const f = frameEncode(new Uint8Array([1, 2, 3]));
  assert.strictEqual(frameSkip(f, 0), f.length);
});

test('out of bounds', () => {
  const f = frameEncode(new Uint8Array([1, 2, 3]));
  assert.strictEqual(frameNext(f, f.length), null);
  assert.strictEqual(frameSkip(f, f.length), null);
});
