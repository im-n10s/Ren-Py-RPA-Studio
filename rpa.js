/**
 * Ren'Py Archive (RPA) & Python Pickle Engine
 * 100% Client-Side Pure JavaScript Implementation
 * 
 * Supports:
 * - RPA-3.0 (header + 32-bit XOR key + zlib + Python Pickle index)
 * - RPA-2.0 (header + zlib + Python Pickle index)
 * - Python Pickle binary streams (Protocols 0, 1, 2, 3, 4, and 5)
 * - Python Pickle Protocol 2 serialization
 */

(function (global) {
  'use strict';

  // --- Utility Functions ---

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function generateRandomXorKey() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const key = array[0] >>> 0;
    const hex = key.toString(16).padStart(8, '0');
    return { num: key, bigint: BigInt(key), hex };
  }

  function detectMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
      // Ren'Py scripts
      rpy: 'text/plain;charset=utf-8',
      rpym: 'text/plain;charset=utf-8',
      rpyc: 'application/octet-stream',
      rpymc: 'application/octet-stream',
      py: 'text/plain;charset=utf-8',
      txt: 'text/plain;charset=utf-8',
      json: 'application/json',
      // Images
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      // Audio
      ogg: 'audio/ogg',
      opus: 'audio/opus',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      flac: 'audio/flac',
      // Video
      webm: 'video/webm',
      mp4: 'video/mp4',
      ogv: 'video/ogg',
      // Fonts
      ttf: 'font/ttf',
      otf: 'font/otf',
      woff: 'font/woff',
      woff2: 'font/woff2'
    };
    return map[ext] || 'application/octet-stream';
  }

  // --- Python Pickle Parser (Protocols 0 to 5) ---

  class PickleParser {
    constructor(buffer) {
      this.buffer = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
      this.pos = 0;
      this.stack = [];
      this.marks = [];
      this.memo = {};
      this.utf8Decoder = new TextDecoder('utf-8');
      this.latin1Decoder = new TextDecoder('latin1');
    }

    readLine() {
      const start = this.pos;
      while (this.pos < this.buffer.length && this.buffer[this.pos] !== 0x0a) {
        this.pos++;
      }
      let end = this.pos;
      if (this.pos < this.buffer.length && this.buffer[this.pos] === 0x0a) {
        this.pos++; // skip \n
      }
      if (end > start && this.buffer[end - 1] === 0x0d) {
        end--; // strip \r
      }
      const slice = this.buffer.subarray(start, end);
      return this.latin1Decoder.decode(slice);
    }

    readStringLiteral(raw) {
      if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
        raw = raw.slice(1, -1);
      }
      return raw.replace(/\\([\\'"nrtbfv]|x[0-9a-fA-F]{2})/g, (match, esc) => {
        if (esc === 'n') return '\n';
        if (esc === 'r') return '\r';
        if (esc === 't') return '\t';
        if (esc === 'b') return '\b';
        if (esc === 'f') return '\f';
        if (esc === 'v') return '\v';
        if (esc === '\\') return '\\';
        if (esc === "'" || esc === '"') return esc;
        if (esc.startsWith('x')) return String.fromCharCode(parseInt(esc.slice(1), 16));
        return match;
      });
    }

    parse() {
      while (this.pos < this.buffer.length) {
        const opcode = this.buffer[this.pos++];
        switch (opcode) {
          case 0x80: { // PROTO
            const proto = this.buffer[this.pos++];
            if (proto > 5) {
              console.warn(`Pickle protocol ${proto} encountered.`);
            }
            break;
          }
          case 0x95: { // FRAME
            // 8-byte uint64 frame size
            this.pos += 8;
            break;
          }
          case 0x2e: { // STOP '.'
            return this.stack.pop();
          }
          case 0x28: { // MARK '('
            this.marks.push(this.stack.length);
            break;
          }
          case 0x64: { // DICT 'd' (Protocol 0)
            const mark = this.marks.pop();
            const items = this.stack.splice(mark);
            const dict = {};
            for (let i = 0; i < items.length; i += 2) {
              dict[items[i]] = items[i + 1];
            }
            this.stack.push(dict);
            break;
          }
          case 0x6c: { // LIST 'l' (Protocol 0)
            const mark = this.marks.pop();
            const items = this.stack.splice(mark);
            this.stack.push(items);
            break;
          }
          case 0x7d: { // EMPTY_DICT '}'
            this.stack.push({});
            break;
          }
          case 0x5d: { // EMPTY_LIST ']'
            this.stack.push([]);
            break;
          }
          case 0x29: { // EMPTY_TUPLE ')'
            this.stack.push([]);
            break;
          }
          case 0x74: { // TUPLE 't'
            const mark = this.marks.pop();
            const items = this.stack.splice(mark);
            this.stack.push(items);
            break;
          }
          case 0x85: { // TUPLE1
            const a = this.stack.pop();
            this.stack.push([a]);
            break;
          }
          case 0x86: { // TUPLE2
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push([a, b]);
            break;
          }
          case 0x87: { // TUPLE3
            const c = this.stack.pop();
            const b = this.stack.pop();
            const a = this.stack.pop();
            this.stack.push([a, b, c]);
            break;
          }
          case 0x65: { // APPENDS 'e'
            const mark = this.marks.pop();
            const items = this.stack.splice(mark);
            const list = this.stack[this.stack.length - 1];
            for (let i = 0; i < items.length; i++) {
              list.push(items[i]);
            }
            break;
          }
          case 0x61: { // APPEND 'a'
            const item = this.stack.pop();
            this.stack[this.stack.length - 1].push(item);
            break;
          }
          case 0x75: { // SETITEMS 'u'
            const mark = this.marks.pop();
            const items = this.stack.splice(mark);
            const dict = this.stack[this.stack.length - 1];
            for (let i = 0; i < items.length; i += 2) {
              dict[items[i]] = items[i + 1];
            }
            break;
          }
          case 0x73: { // SETITEM 's'
            const val = this.stack.pop();
            const key = this.stack.pop();
            this.stack[this.stack.length - 1][key] = val;
            break;
          }
          case 0x4a: { // BININT 'J' (4 bytes signed)
            const val = this.view.getInt32(this.pos, true);
            this.pos += 4;
            this.stack.push(val);
            break;
          }
          case 0x4b: { // BININT1 'K' (1 byte unsigned)
            const val = this.buffer[this.pos++];
            this.stack.push(val);
            break;
          }
          case 0x4d: { // BININT2 'M' (2 bytes unsigned)
            const val = this.view.getUint16(this.pos, true);
            this.pos += 2;
            this.stack.push(val);
            break;
          }
          case 0x8a: { // LONG1 (1-byte length followed by little-endian signed integer)
            const len = this.buffer[this.pos++];
            let val = 0n;
            for (let i = 0; i < len; i++) {
              val |= BigInt(this.buffer[this.pos + i]) << BigInt(i * 8);
            }
            if (len > 0 && (this.buffer[this.pos + len - 1] & 0x80)) {
              val -= 1n << BigInt(len * 8);
            }
            this.pos += len;
            this.stack.push(Number(val));
            break;
          }
          case 0x8b: { // LONG4 (4-byte length followed by little-endian signed integer)
            const len = this.view.getInt32(this.pos, true);
            this.pos += 4;
            let val = 0n;
            for (let i = 0; i < len; i++) {
              val |= BigInt(this.buffer[this.pos + i]) << BigInt(i * 8);
            }
            if (len > 0 && (this.buffer[this.pos + len - 1] & 0x80)) {
              val -= 1n << BigInt(len * 8);
            }
            this.pos += len;
            this.stack.push(Number(val));
            break;
          }
          case 0x49: { // INT 'I'
            const line = this.readLine();
            if (line === '01') {
              this.stack.push(true);
            } else if (line === '00') {
              this.stack.push(false);
            } else {
              this.stack.push(parseInt(line, 10));
            }
            break;
          }
          case 0x4c: { // LONG 'L'
            let line = this.readLine();
            if (line.endsWith('L')) line = line.slice(0, -1);
            this.stack.push(Number(BigInt(line)));
            break;
          }
          case 0x8c: { // SHORT_BINUNICODE
            const len = this.buffer[this.pos++];
            const str = this.utf8Decoder.decode(this.buffer.subarray(this.pos, this.pos + len));
            this.pos += len;
            this.stack.push(str);
            break;
          }
          case 0x58: { // BINUNICODE 'X'
            const len = this.view.getUint32(this.pos, true);
            this.pos += 4;
            const str = this.utf8Decoder.decode(this.buffer.subarray(this.pos, this.pos + len));
            this.pos += len;
            this.stack.push(str);
            break;
          }
          case 0x8d: { // BINUNICODE8
            const len = Number(this.view.getBigUint64(this.pos, true));
            this.pos += 8;
            const str = this.utf8Decoder.decode(this.buffer.subarray(this.pos, this.pos + len));
            this.pos += len;
            this.stack.push(str);
            break;
          }
          case 0x56: { // UNICODE 'V'
            const line = this.readLine();
            this.stack.push(line);
            break;
          }
          case 0x43: { // SHORT_BINBYTES 'C'
            const len = this.buffer[this.pos++];
            const bytes = this.buffer.slice(this.pos, this.pos + len);
            this.pos += len;
            this.stack.push(bytes);
            break;
          }
          case 0x42: { // BINBYTES 'B'
            const len = this.view.getUint32(this.pos, true);
            this.pos += 4;
            const bytes = this.buffer.slice(this.pos, this.pos + len);
            this.pos += len;
            this.stack.push(bytes);
            break;
          }
          case 0x8e: { // BINBYTES8
            const len = Number(this.view.getBigUint64(this.pos, true));
            this.pos += 8;
            const bytes = this.buffer.slice(this.pos, this.pos + len);
            this.pos += len;
            this.stack.push(bytes);
            break;
          }
          case 0x55: { // SHORT_BINSTRING 'U'
            const len = this.buffer[this.pos++];
            const bytes = this.buffer.subarray(this.pos, this.pos + len);
            this.pos += len;
            const str = this.latin1Decoder.decode(bytes);
            this.stack.push(str);
            break;
          }
          case 0x54: { // BINSTRING 'T'
            const len = this.view.getUint32(this.pos, true);
            this.pos += 4;
            const bytes = this.buffer.subarray(this.pos, this.pos + len);
            this.pos += len;
            const str = this.latin1Decoder.decode(bytes);
            this.stack.push(str);
            break;
          }
          case 0x53: { // STRING 'S'
            const line = this.readLine();
            this.stack.push(this.readStringLiteral(line));
            break;
          }
          case 0x71: { // BINPUT 'q'
            const idx = this.buffer[this.pos++];
            this.memo[idx] = this.stack[this.stack.length - 1];
            break;
          }
          case 0x72: { // LONG_BINPUT 'r'
            const idx = this.view.getUint32(this.pos, true);
            this.pos += 4;
            this.memo[idx] = this.stack[this.stack.length - 1];
            break;
          }
          case 0x94: { // MEMOIZE
            const idx = Object.keys(this.memo).length;
            this.memo[idx] = this.stack[this.stack.length - 1];
            break;
          }
          case 0x68: { // BINGET 'h'
            const idx = this.buffer[this.pos++];
            this.stack.push(this.memo[idx]);
            break;
          }
          case 0x6a: { // LONG_BINGET 'j'
            const idx = this.view.getUint32(this.pos, true);
            this.pos += 4;
            this.stack.push(this.memo[idx]);
            break;
          }
          case 0x70: { // PUT 'p'
            const idx = parseInt(this.readLine(), 10);
            this.memo[idx] = this.stack[this.stack.length - 1];
            break;
          }
          case 0x67: { // GET 'g'
            const idx = parseInt(this.readLine(), 10);
            this.stack.push(this.memo[idx]);
            break;
          }
          case 0x4e: { // NONE 'N'
            this.stack.push(null);
            break;
          }
          case 0x88: { // NEWTRUE
            this.stack.push(true);
            break;
          }
          case 0x89: { // NEWFALSE
            this.stack.push(false);
            break;
          }
          case 0x30: { // POP '0'
            this.stack.pop();
            break;
          }
          case 0x32: { // DUP '2'
            this.stack.push(this.stack[this.stack.length - 1]);
            break;
          }
          case 0x31: { // POP_MARK '1'
            const mark = this.marks.pop();
            this.stack.splice(mark);
            break;
          }
          case 0x63: { // GLOBAL 'c'
            const module = this.readLine();
            const name = this.readLine();
            this.stack.push({ __global__: true, module, name });
            break;
          }
          case 0x52: { // REDUCE 'R'
            const args = this.stack.pop();
            const callable = this.stack.pop();
            if (callable && (callable.name === 'bytes' && (callable.module === '__builtin__' || callable.module === 'builtins'))) {
              if (!args || args.length === 0) {
                this.stack.push(new Uint8Array(0));
              } else if (typeof args[0] === 'string') {
                this.stack.push(new TextEncoder().encode(args[0]));
              } else if (Array.isArray(args[0])) {
                this.stack.push(new Uint8Array(args[0]));
              } else {
                this.stack.push(args[0]);
              }
            } else if (callable && (callable.name === 'encode' && (callable.module === '_codecs' || callable.module === 'codecs'))) {
              const str = args[0] || '';
              const bytes = new Uint8Array(str.length);
              for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
              this.stack.push(bytes);
            } else {
              this.stack.push({ __reduce__: true, callable, args });
            }
            break;
          }
          case 0x62: { // BUILD 'b'
            const state = this.stack.pop();
            const target = this.stack[this.stack.length - 1];
            if (target && typeof target === 'object' && state && typeof state === 'object') {
              Object.assign(target, state);
            }
            break;
          }
          default:
            throw new Error(`Unsupported pickle opcode: 0x${opcode.toString(16)} ('${String.fromCharCode(opcode)}') at offset ${this.pos - 1}`);
        }
      }
      return this.stack.pop();
    }
  }

  // --- Python Pickle Protocol 2 Serializer ---

  function encodeInteger(val) {
    val = BigInt(val);
    if (val >= 0n && val <= 255n) {
      return [0x4b, Number(val)]; // BININT1
    }
    if (val >= 0n && val <= 65535n) {
      return [0x4d, Number(val & 0xffn), Number((val >> 8n) & 0xffn)]; // BININT2
    }
    if (val >= 0n && val <= 0x7fffffffn) {
      const n = Number(val);
      return [0x4a, n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff]; // BININT
    }
    // LONG1 (little-endian signed integer)
    const bytes = [];
    let temp = val;
    while (temp > 0n) {
      bytes.push(Number(temp & 0xffn));
      temp >>= 8n;
    }
    if (bytes.length === 0) bytes.push(0);
    if (bytes[bytes.length - 1] & 0x80) {
      bytes.push(0x00);
    }
    return [0x8a, bytes.length, ...bytes];
  }

  function serializePickleProto2(indexObj) {
    const parts = [];
    // PROTO 2, EMPTY_DICT '}'
    parts.push(Uint8Array.from([0x80, 0x02, 0x7d]));

    const encoder = new TextEncoder();

    for (const [key, segments] of Object.entries(indexObj)) {
      // 1. Push Key (Unicode string)
      const keyBytes = encoder.encode(key);
      if (keyBytes.length <= 255) {
        parts.push(Uint8Array.from([0x8c, keyBytes.length])); // SHORT_BINUNICODE
        parts.push(keyBytes);
      } else {
        const lenBuf = new Uint8Array(4);
        new DataView(lenBuf.buffer).setUint32(0, keyBytes.length, true);
        parts.push(Uint8Array.from([0x58])); // BINUNICODE
        parts.push(lenBuf);
        parts.push(keyBytes);
      }

      // 2. Push List of segments
      parts.push(Uint8Array.from([0x5d])); // EMPTY_LIST ']'
      for (const seg of segments) {
        // seg is [offset, length, prefix]
        const [rawOff, rawLen, pfx] = seg;
        const offBytes = encodeInteger(rawOff);
        const lenBytes = encodeInteger(rawLen);
        parts.push(Uint8Array.from(offBytes));
        parts.push(Uint8Array.from(lenBytes));

        // Prefix
        let pfxBytes = pfx instanceof Uint8Array ? pfx : (typeof pfx === 'string' ? encoder.encode(pfx) : new Uint8Array(0));
        if (pfxBytes.length <= 255) {
          parts.push(Uint8Array.from([0x55, pfxBytes.length])); // SHORT_BINSTRING
          parts.push(pfxBytes);
        } else {
          const lenBuf = new Uint8Array(4);
          new DataView(lenBuf.buffer).setUint32(0, pfxBytes.length, true);
          parts.push(Uint8Array.from([0x54])); // BINSTRING
          parts.push(lenBuf);
          parts.push(pfxBytes);
        }

        // TUPLE3 '0x87'
        parts.push(Uint8Array.from([0x87]));
        // APPEND '0x61'
        parts.push(Uint8Array.from([0x61]));
      }

      // SETITEM 's' (0x73)
      parts.push(Uint8Array.from([0x73]));
    }

    // STOP '.' (0x2e)
    parts.push(Uint8Array.from([0x2e]));

    // Combine into single Uint8Array
    const totalLen = parts.reduce((acc, p) => acc + p.length, 0);
    const result = new Uint8Array(totalLen);
    let pos = 0;
    for (const p of parts) {
      result.set(p, pos);
      pos += p.length;
    }
    return result;
  }

  // --- RPA Unpacker ---

  class RPAUnpacker {
    /**
     * Reads and parses header, deobfuscates index, and returns archive metadata.
     * @param {File|Blob} file 
     * @param {Function} [onStatus] Callback for progress updates
     * @returns {Promise<Object>} Archive details and file index list
     */
    static async readArchive(file, onStatus) {
      if (typeof onStatus === 'function') onStatus('reading_header', 10);

      // Read first 64 bytes to locate the header line ending in \n
      const headerSlice = file.slice(0, Math.min(128, file.size));
      const headerBuffer = await headerSlice.arrayBuffer();
      const headerText = new TextDecoder('latin1').decode(headerBuffer);
      const firstLine = headerText.split('\n')[0].trim();

      const tokens = firstLine.split(/\s+/);
      const version = tokens[0];

      let indexOffset;
      let xorKey;
      let xorKeyHex = '00000000';

      if (version === 'RPA-3.0') {
        if (tokens.length < 3) {
          throw new Error('CORRUPTED_HEADER_30');
        }
        indexOffset = BigInt('0x' + tokens[1]);
        xorKeyHex = tokens[2].toLowerCase().padStart(8, '0');
        xorKey = BigInt('0x' + tokens[2]);
      } else if (version === 'RPA-2.0') {
        if (tokens.length < 2) {
          throw new Error('CORRUPTED_HEADER_20');
        }
        indexOffset = BigInt('0x' + tokens[1]);
        xorKey = 0n;
        xorKeyHex = '00000000';
      } else {
        throw new Error('UNSUPPORTED_HEADER');
      }

      if (indexOffset >= BigInt(file.size)) {
        throw new Error('INVALID_INDEX_OFFSET');
      }

      if (typeof onStatus === 'function') onStatus('decompressing_index', 35);

      // Read compressed index from indexOffset to EOF
      const indexSlice = file.slice(Number(indexOffset));
      const indexCompressedBuffer = await indexSlice.arrayBuffer();
      const compressedBytes = new Uint8Array(indexCompressedBuffer);

      let decompressedBytes;
      try {
        if (typeof pako === 'undefined') {
          throw new Error('PAKO_NOT_LOADED');
        }
        decompressedBytes = pako.inflate(compressedBytes);
      } catch (err) {
        console.error('zlib inflate error:', err);
        throw new Error('ZLIB_INFLATE_FAILED');
      }

      if (typeof onStatus === 'function') onStatus('parsing_pickle', 70);

      // Parse unpickled index
      let rawIndex;
      try {
        const parser = new PickleParser(decompressedBytes);
        rawIndex = parser.parse();
      } catch (err) {
        console.error('Pickle parse error:', err);
        throw new Error('PICKLE_PARSE_FAILED');
      }

      if (!rawIndex || typeof rawIndex !== 'object') {
        throw new Error('INVALID_INDEX_STRUCTURE');
      }

      if (typeof onStatus === 'function') onStatus('deobfuscating', 90);

      // Process file list & deobfuscate
      const entries = [];
      let totalUncompressedSize = 0;

      for (const [filePath, rawSegments] of Object.entries(rawIndex)) {
        if (!Array.isArray(rawSegments)) continue;

        const normalizedPath = filePath.replace(/\\/g, '/');
        const segments = [];
        let fileTotalSize = 0;

        for (const seg of rawSegments) {
          if (!Array.isArray(seg) || seg.length < 2) continue;
          const rawOff = BigInt(seg[0]);
          const rawLen = BigInt(seg[1]);
          const rawPfx = seg[2];

          const actualOffset = Number(rawOff ^ xorKey);
          const actualLength = Number(rawLen ^ xorKey);

          let prefixBytes = new Uint8Array(0);
          if (rawPfx) {
            if (rawPfx instanceof Uint8Array) {
              prefixBytes = rawPfx;
            } else if (typeof rawPfx === 'string') {
              prefixBytes = new TextEncoder().encode(rawPfx);
            }
          }

          const segSize = actualLength + prefixBytes.length;
          fileTotalSize += segSize;

          segments.push({
            offset: actualOffset,
            length: actualLength,
            prefix: prefixBytes,
            size: segSize
          });
        }

        totalUncompressedSize += fileTotalSize;
        const mimeType = detectMimeType(normalizedPath);

        entries.push({
          path: normalizedPath,
          name: normalizedPath.split('/').pop(),
          folder: normalizedPath.includes('/') ? normalizedPath.substring(0, normalizedPath.lastIndexOf('/')) : '',
          size: fileTotalSize,
          formattedSize: formatBytes(fileTotalSize),
          mimeType: mimeType,
          segments: segments
        });
      }

      // Sort files alphabetically
      entries.sort((a, b) => a.path.localeCompare(b.path));

      if (typeof onStatus === 'function') onStatus('ready', 100);

      return {
        version,
        indexOffset: '0x' + indexOffset.toString(16).padStart(16, '0'),
        indexOffsetBigInt: indexOffset,
        xorKeyHex: '0x' + xorKeyHex,
        xorKeyNum: Number(xorKey),
        totalFiles: entries.length,
        totalSize: totalUncompressedSize,
        formattedTotalSize: formatBytes(totalUncompressedSize),
        archiveSize: file.size,
        formattedArchiveSize: formatBytes(file.size),
        entries
      };
    }

    /**
     * Extracts a single file entry into a downloadable Blob.
     * @param {File|Blob} archiveFile 
     * @param {Object} entry 
     * @returns {Promise<Blob>}
     */
    static async extractFile(archiveFile, entry) {
      const parts = [];

      for (const seg of entry.segments) {
        if (seg.prefix && seg.prefix.length > 0) {
          parts.push(seg.prefix);
        }
        if (seg.length > 0) {
          const slice = archiveFile.slice(seg.offset, seg.offset + seg.length);
          const buf = await slice.arrayBuffer();
          parts.push(new Uint8Array(buf));
        }
      }

      return new Blob(parts, { type: entry.mimeType || 'application/octet-stream' });
    }

    /**
     * Bundles all or selected entries into a ZIP file.
     * @param {File|Blob} archiveFile 
     * @param {Array<Object>} entries 
     * @param {Function} [onProgress] Callback with percentage and current file name
     * @returns {Promise<Blob>}
     */
    static async extractToZip(archiveFile, entries, onProgress) {
      if (typeof JSZip === 'undefined') {
        throw new Error('JSZIP_NOT_LOADED');
      }

      const zip = new JSZip();
      const total = entries.length;

      for (let i = 0; i < total; i++) {
        const entry = entries[i];
        if (typeof onProgress === 'function') {
          const percent = Math.round(((i + 1) / total) * 100);
          onProgress(percent, entry.path);
        }

        const blob = await RPAUnpacker.extractFile(archiveFile, entry);
        // Add to zip preserving directory tree
        zip.file(entry.path, blob);
      }

      if (typeof onProgress === 'function') {
        onProgress(100, 'generating_zip');
      }

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, (metadata) => {
        if (typeof onProgress === 'function') {
          onProgress(metadata.percent, 'compressing_zip');
        }
      });

      return zipBlob;
    }
  }

  // --- RPA Packer ---

  class RPAPacker {
    /**
     * Packs files into a standard RPA-3.0 archive.
     * @param {Array<{path: string, file: File|Blob}>} filesList 
     * @param {Object} [options] 
     * @param {Function} [onProgress] 
     * @returns {Promise<Object>}
     */
    static async pack(filesList, options = {}, onProgress) {
      if (!filesList || filesList.length === 0) {
        throw new Error('NO_FILES_TO_PACK');
      }

      if (typeof pako === 'undefined') {
        throw new Error('PAKO_NOT_LOADED');
      }

      // Generate or use user-specified XOR key
      let xorKeyData;
      if (options.xorKeyHex) {
        const hex = options.xorKeyHex.replace(/^0x/i, '').padStart(8, '0');
        const num = parseInt(hex, 16) >>> 0;
        xorKeyData = { num, bigint: BigInt(num), hex };
      } else {
        xorKeyData = generateRandomXorKey();
      }

      const xorKey = xorKeyData.bigint;
      const xorKeyHex = xorKeyData.hex;

      if (typeof onProgress === 'function') onProgress(10, 'preparing_files');

      // 34-byte initial header reservation: RPA-3.0 0000000000000000 00000000\n
      const dummyHeader = 'RPA-3.0 0000000000000000 00000000\n';
      const fileBlobs = [];
      let currentOffset = dummyHeader.length; // 34
      const index = {};

      const total = filesList.length;

      for (let i = 0; i < total; i++) {
        const item = filesList[i];
        const normalizedPath = item.path.replace(/\\/g, '/').replace(/^\/+/, '');
        const fileObj = item.file;
        const fileSize = fileObj.size;

        const fileOffset = currentOffset;
        const fileLength = fileSize;

        // XOR obfuscate offset and length for RPA-3.0
        const obfOffset = BigInt(fileOffset) ^ xorKey;
        const obfLength = BigInt(fileLength) ^ xorKey;

        // Segment entry: [obfOffset, obfLength, prefix]
        index[normalizedPath] = [
          [obfOffset, obfLength, new Uint8Array(0)]
        ];

        fileBlobs.push(fileObj);
        currentOffset += fileLength;

        if (typeof onProgress === 'function') {
          const pct = 10 + Math.round(((i + 1) / total) * 60);
          onProgress(pct, 'processing_files');
        }
      }

      const indexOffset = currentOffset;
      if (typeof onProgress === 'function') onProgress(75, 'serializing_pickle');

      // Serialize index dictionary with Python Pickle Protocol 2
      const serializedIndex = serializePickleProto2(index);

      if (typeof onProgress === 'function') onProgress(85, 'compressing_index');

      // Compress index with zlib
      const compressedIndex = pako.deflate(serializedIndex);

      if (typeof onProgress === 'function') onProgress(95, 'assembling_archive');

      // Build final 34-byte header
      const indexOffsetHex = BigInt(indexOffset).toString(16).padStart(16, '0');
      const finalHeaderStr = `RPA-3.0 ${indexOffsetHex} ${xorKeyHex}\n`;

      if (finalHeaderStr.length !== 34) {
        throw new Error('Header length calculation mismatch');
      }

      // Assemble final Blob
      const archiveBlob = new Blob(
        [finalHeaderStr, ...fileBlobs, compressedIndex],
        { type: 'application/octet-stream' }
      );

      if (typeof onProgress === 'function') onProgress(100, 'done');

      return {
        blob: archiveBlob,
        archiveSize: archiveBlob.size,
        formattedSize: formatBytes(archiveBlob.size),
        fileCount: total,
        xorKeyHex: '0x' + xorKeyHex,
        indexOffsetHex: '0x' + indexOffsetHex
      };
    }
  }

  // --- Export to Global Scope ---
  const RPA = {
    PickleParser,
    PickleSerializer: { serialize: serializePickleProto2, encodeInteger },
    RPAUnpacker,
    RPAPacker,
    utils: {
      formatBytes,
      generateRandomXorKey,
      detectMimeType
    }
  };

  global.RPA = RPA;

})(typeof window !== 'undefined' ? window : this);
