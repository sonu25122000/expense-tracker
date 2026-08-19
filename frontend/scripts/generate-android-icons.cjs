// Generates Android launcher icons (legacy + adaptive foreground) with no external deps.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CRC_TABLE = (() => {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(size, px) {
  const rowBytes = size * 4;
  const raw = Buffer.alloc((rowBytes + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (rowBytes + 1)] = 0;
    Buffer.from(px.buffer, y * rowBytes, rowBytes).copy(raw, y * (rowBytes + 1) + 1);
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function newCanvas(size) {
  return new Uint8Array(size * size * 4);
}

function setPx(px, size, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const i = (y * size + x) * 4;
  px[i] = color[0];
  px[i + 1] = color[1];
  px[i + 2] = color[2];
  px[i + 3] = color[3];
}

// Draws the wallet glyph scaled/centered within [x0,y0]-[x1,y1] box.
function drawWalletGlyph(px, size, x0, y0, x1, y1, color) {
  const w = x1 - x0;
  const h = y1 - y0;
  const stroke = Math.max(2, Math.floor(w * 0.09));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const onBorder = x < x0 + stroke || x > x1 - stroke || y < y0 + stroke || y > y1 - stroke;
      if (onBorder) setPx(px, size, x, y, color);
    }
  }
  const cx = x1 - Math.floor(h * 0.22);
  const cyMid = Math.floor((y0 + y1) / 2);
  const r = Math.max(2, Math.floor(w * 0.09));
  const bg = [0, 0, 0, 0]; // punch a transparent hole for the clasp
  for (let y = cyMid - r; y <= cyMid + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx;
      const dy = y - cyMid;
      if (dx * dx + dy * dy <= r * r) setPx(px, size, x, y, bg);
    }
  }
}

function inRoundedRect(x, y, size, radius) {
  const cx = Math.min(x, size - 1 - x);
  const cy = Math.min(y, size - 1 - y);
  if (cx >= radius || cy >= radius) return true;
  const dx = radius - cx;
  const dy = radius - cy;
  return dx * dx + dy * dy <= radius * radius;
}

const BG = [42, 120, 214, 255];
const FG = [255, 255, 255, 255];

function legacyIcon(size) {
  const px = newCanvas(size);
  const radius = Math.floor(size * 0.18);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inRoundedRect(x, y, size, radius)) setPx(px, size, x, y, BG);
    }
  }
  const margin = Math.floor(size * 0.24);
  drawWalletGlyph(px, size, margin, Math.floor(size * 0.32), size - margin, Math.floor(size * 0.68), FG);
  return px;
}

// Adaptive foreground: transparent canvas, glyph confined to the ~66% safe zone.
function foregroundIcon(size) {
  const px = newCanvas(size);
  const safe = size * 0.62;
  const offset = (size - safe) / 2;
  const x0 = Math.floor(offset + safe * 0.12);
  const x1 = Math.floor(size - offset - safe * 0.12);
  const y0 = Math.floor(offset + safe * 0.22);
  const y1 = Math.floor(size - offset - safe * 0.22);
  drawWalletGlyph(px, size, x0, y0, x1, y1, FG);
  return px;
}

const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const densities = [
  { dir: 'mipmap-mdpi', legacy: 48, fg: 108 },
  { dir: 'mipmap-hdpi', legacy: 72, fg: 162 },
  { dir: 'mipmap-xhdpi', legacy: 96, fg: 216 },
  { dir: 'mipmap-xxhdpi', legacy: 144, fg: 324 },
  { dir: 'mipmap-xxxhdpi', legacy: 192, fg: 432 },
];

for (const { dir, legacy, fg } of densities) {
  const target = path.join(resDir, dir);
  if (!fs.existsSync(target)) {
    console.log(`skip (missing) ${dir}`);
    continue;
  }
  const legacyPng = encodePng(legacy, legacyIcon(legacy));
  fs.writeFileSync(path.join(target, 'ic_launcher.png'), legacyPng);
  fs.writeFileSync(path.join(target, 'ic_launcher_round.png'), legacyPng);
  fs.writeFileSync(path.join(target, 'ic_launcher_foreground.png'), encodePng(fg, foregroundIcon(fg)));
  console.log(`wrote icons for ${dir}`);
}
