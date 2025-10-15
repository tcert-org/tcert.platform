import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Cambiar a nodejs runtime para manejar archivos más grandes
export const runtime = "nodejs";
// Configurar límite específico para este endpoint
export const maxDuration = 30; // 30 segundos para uploads

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("material");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Validar tamaño del archivo (10MB = 10 * 1024 * 1024 bytes)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json(
      {
        error: "File too large",
        message: `File size (${(file.size / 1024 / 1024).toFixed(
          2
        )}MB) exceeds limit of ${maxSize / 1024 / 1024}MB`,
      },
      { status: 413 }
    );
  }

  try {
    // Agregar timestamp al nombre del archivo para evitar colisiones
    const timestamp = Date.now();
    const originalName = file.name || "material";
    const filename = `${timestamp}_${originalName.replace(/\s+/g, "_")}`;

    // Guardar en carpeta específica para materiales de certificaciones
    await put(`materials/${filename}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Solo devolver el nombre del archivo para guardar en la base de datos
    return NextResponse.json({ filename });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Upload failed", details: e.message },
      { status: 500 }
    );
  }
}
