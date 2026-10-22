/**
 * 极简 ZIP 读取器（无第三方依赖，纯 Node 标准库）
 * 只做本项目需要的事：列出条目、按名称取出一个文件的 Buffer。
 * 支持 stored(0) 与 deflate(8) 两种压缩方式；不支持加密与 Zip64。
 */
import fs from 'node:fs';
import zlib from 'node:zlib';

const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const LOC_SIG = 0x04034b50;

function findEocd(buf) {
  const min = Math.max(0, buf.length - 0xffff - 22);
  for (let i = buf.length - 22; i >= min; i -= 1) {
    if (buf.readUInt32LE(i) === EOCD_SIG) return i;
  }
  return -1;
}

export function listEntries(zipPath) {
  const buf = fs.readFileSync(zipPath);
  const eocd = findEocd(buf);
  if (eocd < 0) throw new Error('不是有效的 zip（找不到 EOCD）');
  const count = buf.readUInt16LE(eocd + 10);
  let ptr = buf.readUInt32LE(eocd + 16);
  const entries = [];
  for (let i = 0; i < count; i += 1) {
    if (buf.readUInt32LE(ptr) !== CEN_SIG) throw new Error('zip 中央目录损坏');
    const method = buf.readUInt16LE(ptr + 10);
    const compressedSize = buf.readUInt32LE(ptr + 20);
    const uncompressedSize = buf.readUInt32LE(ptr + 24);
    const nameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localOffset = buf.readUInt32LE(ptr + 42);
    const name = buf.toString('utf8', ptr + 46, ptr + 46 + nameLen);
    entries.push({ name, method, compressedSize, uncompressedSize, localOffset });
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return { buf, entries };
}

export function readEntry(zipPath, wanted) {
  const { buf, entries } = listEntries(zipPath);
  const entry = entries.find((e) => e.name === wanted);
  if (!entry) return null;
  if (entry.method !== 0 && entry.method !== 8) throw new Error(`不支持的压缩方式 ${entry.method}`);
  if (buf.readUInt32LE(entry.localOffset) !== LOC_SIG) throw new Error('zip 本地文件头损坏');
  const nameLen = buf.readUInt16LE(entry.localOffset + 26);
  const extraLen = buf.readUInt16LE(entry.localOffset + 28);
  const start = entry.localOffset + 30 + nameLen + extraLen;
  const raw = buf.subarray(start, start + entry.compressedSize);
  return entry.method === 0 ? Buffer.from(raw) : zlib.inflateRawSync(raw);
}
