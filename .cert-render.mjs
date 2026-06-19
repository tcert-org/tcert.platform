import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { createCanvas } from '@napi-rs/canvas';
import sharp from 'sharp';

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
const sfd = pathToFileURL(path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/')).href + '/';
const b = 'C:/Users/Admin/Downloads/cert-compress-test/';

const data = new Uint8Array(fs.readFileSync(b + 'RESULTADO-' + process.argv[2] + '.pdf'));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true, standardFontDataUrl: sfd }).promise;
const page = await doc.getPage(1);
const scale = 3;
const vp = page.getViewport({ scale });
const W = Math.ceil(vp.width), H = Math.ceil(vp.height);
const canvas = createCanvas(W, H);
await page.render({
  canvasContext: canvas.getContext('2d'), viewport: vp,
  canvasFactory: {
    create: (w, h) => { const c = createCanvas(w, h); return { canvas: c, context: c.getContext('2d') }; },
    reset: (o, w, h) => { o.canvas.width = w; o.canvas.height = h; },
    destroy: (o) => { o.canvas.width = 0; o.canvas.height = 0; },
  },
}).promise;
const png = canvas.toBuffer('image/png');
const toRow = (y) => Math.round((842.25 - y) * scale), toCol = (x) => Math.round(x * scale);
// crop lower area: date box + signature, x 200..520, y 85..235
await sharp(png).extract({ left: toCol(200), top: toRow(235), width: toCol(520) - toCol(200), height: toRow(85) - toRow(235) }).toFile(b + 'v7-fecha-firma.png');
console.log('crop ok');
