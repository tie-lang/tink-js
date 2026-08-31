/**
 * tink.js —— tink data-flow node frame protocol (universal, language-agnostic).
 *
 * Frame = [len u32 BE][payload][crc u32 BE]; crc = CRC32-IEEE (0xEDB88320).
 * Mirrors std/tink.tie (tie standard library) and the Rust crate / C library /
 * Python package; pure functions over byte arrays, IO (stdin/stdout) left to
 * the caller. ES modules (Node.js ≥ 12, or any modern engine), zero deps.
 *
 *   import { frameEncode, frameNext } from 'tink-js';
 *   const frame = frameEncode(new TextEncoder().encode('hi'));
 *   const [payload, next] = frameNext(frame, 0);
 *   // payload === Uint8Array [104, 105], next === frame.length
 */

/** CRC32-IEEE over a Uint8Array (bit-loop, no table; matches zlib.crc32).
 * Check vector: crc32(utf8("123456789")) === 0xCBF43926. */
export function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let k = 0; k < 8; k++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** Encode a payload (Uint8Array) into a full frame [len][payload][crc].
 * Returns a new Uint8Array of payload.length + 8. */
export function frameEncode(payload) {
  const out = new Uint8Array(8 + payload.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, payload.length, false);
  out.set(payload, 4);
  dv.setUint32(4 + payload.length, crc32(payload), false);
  return out;
}

/** Parse one frame at `pos` (verifies CRC). Returns [payload, nextPos], or
 * null on out-of-bounds / CRC mismatch. payload is a zero-copy view. */
export function frameNext(bytes, pos) {
  if (bytes.length < pos + 8) return null;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const n = dv.getUint32(pos, false);
  const end = pos + 8 + n;
  if (bytes.length < end) return null;
  const payload = bytes.subarray(pos + 4, pos + 4 + n);
  if (crc32(payload) !== dv.getUint32(end - 4, false)) return null;
  return [payload, end];
}

/** Skip one frame at `pos` without copying or verifying (zero-copy).
 * Returns nextPos, or null on out-of-bounds. */
export function frameSkip(bytes, pos) {
  if (bytes.length < pos + 8) return null;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const n = dv.getUint32(pos, false);
  const end = pos + 8 + n;
  if (bytes.length < end) return null;
  return end;
}