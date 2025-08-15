import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("comprobante");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    // Agregar timestamp al inicio del nombre del archivo
    const timestamp = Date.now();
    const originalName = file.name || "file";
    const filename = `${timestamp}_${originalName}`;
    const blob = await put(`payments/${filename}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Upload failed", details: e.message },
      { status: 500 }
    );
  }
}
