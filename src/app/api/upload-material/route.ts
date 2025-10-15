import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Cambiar a nodejs runtime para manejar archivos más grandes
export const runtime = "nodejs";
// Configurar límite específico para este endpoint
export const maxDuration = 30; // 30 segundos para uploads

// Configurar para forzar dinámico
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Log del tamaño de la request para debugging
    const contentLength = req.headers.get("content-length");
    console.log(`[UPLOAD] Content-Length: ${contentLength} bytes`);

    const formData = await req.formData();
    const file = formData.get("material");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log(
      `[UPLOAD] File size: ${file.size} bytes (${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB)`
    );

    // Validar tamaño del archivo (15MB límite más bajo para Vercel)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File too large",
          message: `File size (${(file.size / 1024 / 1024).toFixed(
            2
          )}MB) exceeds limit of ${maxSize / 1024 / 1024}MB`,
          vercelLimit: "Vercel has strict upload limits in production",
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
  } catch (error: any) {
    // Error al procesar la request
    return NextResponse.json(
      {
        error: "Request processing failed",
        details: error.message,
        hint: "This might be a Vercel infrastructure limit",
      },
      { status: 500 }
    );
  }
}
