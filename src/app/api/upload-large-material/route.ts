import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    // Obtener el archivo directamente del request como stream
    const formData = await req.formData();
    const file = formData.get("material") as File;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validar tamaño máximo (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 413 }
      );
    }

    // Validar tipo de archivo
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Generar nombre único
    const timestamp = Date.now();
    const originalName = file.name || "material";
    const filename = `${timestamp}_${originalName.replace(/\s+/g, "_")}`;

    // Subir usando streaming (edge runtime maneja mejor archivos grandes)
    const blob = await put(`materials/${filename}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ 
      filename,
      url: blob.url,
      success: true 
    });

  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    );
  }
}