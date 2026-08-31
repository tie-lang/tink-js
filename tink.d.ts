/**
 * tink-js —— tink data-flow node frame protocol (universal, language-agnostic).
 *
 * Frame = [len u32 BE][payload][crc u32 BE]; crc = CRC32-IEEE (0xEDB88320).
 * Pure functions over Uint8Array, IO (stdin/stdout) left to the caller.
 */

/** CRC32-IEEE over a Uint8Array.
 * Check vector: crc32(utf8("123456789")) === 0xCBF43926. */
export function crc32(data: Uint8Array): number;

/** Encode a payload into a full frame [len][payload][crc]. */
export function frameEncode(payload: Uint8Array): Uint8Array;

/** Parse one frame at `pos` (verifies CRC).
 * Returns [payload, nextPos] on success, or null on error. */
export function frameNext(bytes: Uint8Array, pos: number): [Uint8Array, number] | null;

/** Skip one frame at `pos` without copying or verifying.
 * Returns nextPos on success, or null on error. */
export function frameSkip(bytes: Uint8Array, pos: number): number | null;
