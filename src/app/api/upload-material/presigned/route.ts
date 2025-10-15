import { NextRequest, NextResponse } from "next/server";

// Endpoint para obtener URL de upload directo (bypass de Next.js)
export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and contentType required" },
        { status: 400 }
      );
    }

    // Generar URL presignada para upload directo a Vercel Blob
    const timestamp = Date.now();
    const safeName = `${timestamp}_${filename.replace(/\s+/g, "_")}`;

    // Retornar URL para upload directo del cliente
    return NextResponse.json({
      uploadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/upload-material`,
      filename: safeName,
      maxSize: "15MB",
      instructions: "Use this for direct upload from client",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate upload URL", details: error.message },
      { status: 500 }
    );
  }
}
