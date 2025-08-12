const fs = require("fs");
const path = require("path");

// Directorio de fuentes
const fontsDir = path.join(__dirname, "../public/assets/certificates/fonts");
const outputDir = path.join(__dirname, "../src/lib/fonts");

// Crear directorio de salida si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Lista de fuentes
const fonts = [
  "bahnschrift.ttf",
  "ScheherazadeNew-Regular.ttf",
  "ScheherazadeNew-Medium.ttf",
  "ScheherazadeNew-SemiBold.ttf",
  "ScheherazadeNew-Bold.ttf",
];

console.log("🔄 Convirtiendo fuentes TTF a base64...");

let fontExports = "export const EMBEDDED_FONTS = {\n";

fonts.forEach((fontFile) => {
  const fontPath = path.join(fontsDir, fontFile);

  if (fs.existsSync(fontPath)) {
    const fontBuffer = fs.readFileSync(fontPath);
    const base64Font = fontBuffer.toString("base64");
    const fontName = fontFile.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();

    fontExports += `  ${fontName}: '${base64Font}',\n`;
    console.log(`✅ ${fontFile} → ${fontName}`);
  } else {
    console.warn(`⚠️  Fuente no encontrada: ${fontFile}`);
  }
});

fontExports += "} as const;\n\n";

// Agregar tipos TypeScript
fontExports += `export type FontName = keyof typeof EMBEDDED_FONTS;\n\n`;

// Agregar función helper
fontExports += `export function getFontBuffer(fontName: FontName): Uint8Array {
  const base64Data = EMBEDDED_FONTS[fontName];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}\n`;

// Escribir archivo de fuentes embebidas
const outputFile = path.join(outputDir, "embedded-fonts.ts");
fs.writeFileSync(outputFile, fontExports);

console.log(`🎉 Fuentes convertidas y guardadas en: ${outputFile}`);
