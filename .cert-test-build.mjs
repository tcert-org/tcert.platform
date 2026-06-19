import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const ts = require(path.join(ROOT, 'node_modules/typescript'));
const TMP = path.join(ROOT, '.cert-build-tmp');
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
function transpile(srcPath, outName, replacers = []) {
  let src = fs.readFileSync(srcPath, 'utf8');
  for (const [a, b] of replacers) src = src.split(a).join(b);
  const out = ts.transpileModule(src, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, esModuleInterop: true },
  }).outputText;
  fs.writeFileSync(path.join(TMP, outName), out);
}
transpile(path.join(ROOT, 'src/lib/fonts/embedded-fonts.ts'), 'embedded-fonts.mjs');
transpile(path.join(ROOT, 'src/modules/tools/PDFTool.ts'), 'PDFTool.mjs', [
  ['@/lib/fonts/embedded-fonts', './embedded-fonts.mjs'],
]);
console.log('transpiled OK');
