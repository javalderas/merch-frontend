/**
 * Generates placeholder PWA icons using Node.js built-ins only.
 * Uses the Jimp-free approach: writes raw RGBA PNG via pure zlib + CRC.
 *
 * Colors: background #0f0f14 (app bg), letter "M" in #a855f7 (theme purple)
 *
 * Usage: node scripts/generate-icons.mjs
 */

import { createWriteStream } from "fs"
import { deflateSync } from "zlib"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, "../public/icons")

// ── PNG helpers ──────────────────────────────────────────────────────────────

function crc32(buf) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[i] = c
    }
    return t
  })())
  let c = 0xffffffff
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii")
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcInput = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([len, typeBytes, data, crcBuf])
}

function buildPNG(size, bgHex, fgHex) {
  const bg = hexToRgb(bgHex)
  const fg = hexToRgb(fgHex)

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // color type RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // Build pixel grid
  const pixels = new Uint8Array(size * size * 3).fill(0)

  // Fill background
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3 + 0] = bg.r
    pixels[i * 3 + 1] = bg.g
    pixels[i * 3 + 2] = bg.b
  }

  // Draw letter "M" centered (relative coords 0..1)
  drawM(pixels, size, fg)

  // Scanlines: filter byte 0 + row data
  const scanlines = Buffer.alloc(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    scanlines[y * (1 + size * 3)] = 0 // filter None
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 3
      const dst = y * (1 + size * 3) + 1 + x * 3
      scanlines[dst] = pixels[src]
      scanlines[dst + 1] = pixels[src + 1]
      scanlines[dst + 2] = pixels[src + 2]
    }
  }

  const idat = deflateSync(scanlines)
  const iend = Buffer.alloc(0)

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", iend),
  ])
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16)
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}

function setPixel(pixels, size, x, y, color) {
  if (x < 0 || x >= size || y < 0 || y >= size) return
  const i = (y * size + x) * 3
  pixels[i] = color.r
  pixels[i + 1] = color.g
  pixels[i + 2] = color.b
}

function fillRect(pixels, size, x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      setPixel(pixels, size, x + dx, y + dy, color)
}

function drawM(pixels, size, color) {
  // Draw "M" as thick strokes, centered, occupying ~50% of the icon
  const unit = Math.floor(size / 16)
  const mW = unit * 8  // total M width
  const mH = unit * 10 // total M height
  const ox = Math.floor((size - mW) / 2)
  const oy = Math.floor((size - mH) / 2)
  const t = Math.max(1, unit)  // stroke thickness

  // Left leg
  fillRect(pixels, size, ox, oy, t, mH, color)
  // Right leg
  fillRect(pixels, size, ox + mW - t, oy, t, mH, color)
  // Left diagonal (top-left → center-bottom)
  for (let i = 0; i < mH / 2; i++) {
    const x = ox + t + Math.round(i * ((mW / 2 - t) / (mH / 2)))
    fillRect(pixels, size, x, oy + i, t, t, color)
  }
  // Right diagonal (top-right → center-bottom)
  for (let i = 0; i < mH / 2; i++) {
    const x = ox + mW - t - Math.round(i * ((mW / 2 - t) / (mH / 2)))
    fillRect(pixels, size, x, oy + i, t, t, color)
  }
}

// ── Generate ─────────────────────────────────────────────────────────────────

const sizes = [192, 512]

for (const size of sizes) {
  const png = buildPNG(size, "#0f0f14", "#a855f7")
  const path = join(outDir, `icon-${size}.png`)
  const ws = createWriteStream(path)
  ws.write(png)
  ws.end()
  console.log(`✓ ${path} (${size}x${size})`)
}
