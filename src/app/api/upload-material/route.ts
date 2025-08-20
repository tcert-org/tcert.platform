import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("material");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
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
