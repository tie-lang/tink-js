# tink-js

tink data-flow node frame protocol — JavaScript/TypeScript (ES modules, zero
deps). Universal and language-agnostic: any component that obeys the frame
protocol can join a tink pipeline.

```
帧 = [ len: u32 BE ][ payload: len 字节 ][ crc: u32 BE ]
len = payload 字节数
crc = CRC32-IEEE(payload)（多项式 0xEDB88320）
```

Mirrors `std/tink.tie` (tie standard library) and the Rust / C / Python tink
libraries; pure functions over `Uint8Array`, IO (stdin/stdout) left to the
caller. `frameNext` / `frameSkip` are zero-copy (return views into the input).

## API

| function | description |
| --- | --- |
| `crc32(data: Uint8Array): number` | CRC32-IEEE over a byte array. Check vector: `crc32(utf8("123456789")) === 0xCBF43926` |
| `frameEncode(payload: Uint8Array): Uint8Array` | encode a payload into a full frame `[len][payload][crc]` |
| `frameNext(bytes: Uint8Array, pos: number): [payload, next] \| null` | parse one frame at `pos`, verify CRC; `null` on out-of-bounds / mismatch. `payload` is a zero-copy view |
| `frameSkip(bytes: Uint8Array, pos: number): number \| null` | skip one frame at `pos` without copying or verifying; `null` on out-of-bounds |

## Usage

```js
import { frameEncode, frameNext } from 'tink-js';

const frame = frameEncode(new TextEncoder().encode('hi'));
const [payload, next] = frameNext(frame, 0);
// payload === Uint8Array [104, 105], next === frame.length
```

TypeScript types ship with the package (`tink.d.ts`).

## Test

```bash
npm test        # node --test test_tink.js
```

## Cross-language

tink 帧协议各语言实现（API 语义与校验向量一致）：

| language | library |
| --- | --- |
| tie | `std/tink.tie` |
| Rust | `tink-rust`（tink crate） |
| C | `tink-c`（`tink.h` + `tink.c`） |
| Python | `tink-python`（`tink.py`） |
| JavaScript | this package（`tink-js`） |

## License

本仓库使用 **TIE-LANG Open Source License v1.1**，完整文本见 [LICENSE](LICENSE)。
This repository is distributed under the **TIE-LANG Open Source License v1.1** — see [LICENSE](LICENSE) for the full text.