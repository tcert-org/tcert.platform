import { NextRequest, NextResponse } from "next/server";
import PDFTool from "@/modules/tools/PDFTool";

// Función para normalizar texto removiendo tildes y ñ para headers HTTP
function normalizeForFilename(text: string): string {
  return text
    .normalize("NFD") // Descompone los caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remueve las marcas diacríticas (tildes)
    .replace(/ñ/g, "n") // Reemplaza ñ con n
    .replace(/Ñ/g, "N") // Reemplaza Ñ con N
    .replace(/\s+/g, "-") // Reemplaza espacios con guiones
    .replace(/[^a-zA-Z0-9\-_.]/g, ""); // Remueve caracteres especiales
}

// Asegurar que Next.js reconozca este endpoint como dinámico
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log("[DIPLOMA_GENERATE] Endpoint POST llamado");
  
  try {
    const {
      studentName,
      certificationName,
      expeditionDate,
      codigoVoucher,
      URL_logo,
      documentNumber, // Nuevo parámetro agregado
    } = await req.json();

    console.log("[DIPLOMA_GENERATE] Datos recibidos:", {
      studentName,
      certificationName,
      expeditionDate,
      codigoVoucher,
      URL_logo,
      documentNumber
    });

    // Llamamos al método que genera el PDF
    const { status, pdfBytes } = await PDFTool.CreateCertificate(
      studentName,
      certificationName,
      expeditionDate,
      codigoVoucher,
      URL_logo,
      documentNumber // Pasamos el número de documento
    );

    if (status) {
      console.log("[DIPLOMA_GENERATE] PDF generado exitosamente");
      
      // Normalizar el nombre del estudiante para el filename del header
      const normalizedFilename = normalizeForFilename(studentName);
      
      // Enviar el archivo PDF como una respuesta de descarga
      return new NextResponse(pdfBytes as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${normalizedFilename}-certificado.pdf"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
      });
    } else {
      console.error("[DIPLOMA_GENERATE] Error al generar PDF");
      return NextResponse.json(
        { error: "Error al generar el certificado." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[DIPLOMA_GENERATE] Error en la generación del certificado:", error);
    return NextResponse.json(
      { error: "Error al generar el certificado.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Agregar un método OPTIONS para CORS si es necesario
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Método GET para verificar que el endpoint existe
export async function GET(req: NextRequest) {
  console.log("[DIPLOMA_GENERATE] GET request received - endpoint is working");
  return NextResponse.json({
    status: "ok",
    message: "Diploma generate endpoint is working",
    timestamp: new Date().toISOString()
  });
}
