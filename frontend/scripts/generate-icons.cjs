// Generates simple solid-colour PWA/app icon PNGs with no external deps.
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

// Draws a rounded-rect background + a simple wallet glyph, RGBA.
function drawIcon(size, bg, fg) {
  const px = new Uint8Array(size * size * 4);
  const radius = Math.floor(size * 0.18);
  const set = (x, y, color) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    px[i] = color[0];
    px[i + 1] = color[1];
    px[i + 2] = color[2];
    px[i + 3] = color[3];
  };
  const inRoundedRect = (x, y) => {
    const cx = Math.min(x, size - 1 - x);
    const cy = Math.min(y, size - 1 - y);
    if (cx >= radius || cy >= radius) return true;
    const dx = radius - cx;
    const dy = radius - cy;
    return dx * dx + dy * dy <= radius * radius;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inRoundedRect(x, y)) set(x, y, bg);
    }
  }
  // simple wallet glyph: a rounded rect outline + a small tab circle
  const wx0 = Math.floor(size * 0.24);
  const wx1 = Math.floor(size * 0.76);
  const wy0 = Math.floor(size * 0.32);
  const wy1 = Math.floor(size * 0.68);
  const stroke = Math.max(2, Math.floor(size * 0.045));
  for (let y = wy0; y <= wy1; y++) {
    for (let x = wx0; x <= wx1; x++) {
      const onBorder =
        x < wx0 + stroke || x > wx1 - stroke || y < wy0 + stroke || y > wy1 - stroke;
      if (onBorder) set(x, y, fg);
    }
  }
  const cx = wx1 - Math.floor((wy1 - wy0) * 0.22);
  const cyMid = Math.floor((wy0 + wy1) / 2);
  const r = Math.max(2, Math.floor(size * 0.035));
  for (let y = cyMid - r; y <= cyMid + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx;
      const dy = y - cyMid;
      if (dx * dx + dy * dy <= r * r) set(x, y, bg);
    }
  }
  return px;
}

function encodePng(size, px) {
  const rowBytes = size * 4;
  const raw = Buffer.alloc((rowBytes + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (rowBytes + 1)] = 0; // filter: none
    Buffer.from(px.buffer, y * rowBytes, rowBytes).copy(raw, y * (rowBytes + 1) + 1);
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const BG = [42, 120, 214, 255]; // theme primary blue
const FG = [255, 255, 255, 255];

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const sizes = [180, 192, 512];
for (const size of sizes) {
  const px = drawIcon(size, BG, FG);
  const png = encodePng(size, px);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`wrote icon-${size}.png`);
}
