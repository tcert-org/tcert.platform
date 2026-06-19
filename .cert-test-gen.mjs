import fs from 'fs';
import path from 'path';
import http from 'http';

const ROOT = process.cwd();
const TMP = path.join(ROOT, '.cert-build-tmp');
const OUT = 'C:/Users/Admin/Downloads/cert-compress-test';

const badgeBuf = fs.readFileSync('C:/Users/Admin/Downloads/1774370143287_ISO_20001_IA.png');
const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'image/png'); res.end(badgeBuf); });
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const logoUrl = 'http://127.0.0.1:' + port + '/insignia.png';

const modUrl = 'file:///' + path.join(TMP, 'PDFTool.mjs').replace(/\\/g, '/');
const { default: PDFTool } = await import(modUrl);

const { status, pdfBytes } = await PDFTool.CreateCertificate(
  'Juan Perez Gomez', 'ISO/IEC 20001-1 Internal Auditor', '2027-08-22', 'xxxx xxxx xxxx', logoUrl, 'xxxx xxxx xxxx'
);
if (status) {
  fs.writeFileSync(path.join(OUT, 'RESULTADO-fecha-firma.pdf'), Buffer.from(pdfBytes));
  console.log('RESULTADO-fecha-firma =>', (pdfBytes.length / 1024).toFixed(0) + 'KB');
} else console.error('FALLO');
server.close();
