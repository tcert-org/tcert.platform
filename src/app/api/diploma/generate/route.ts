import { NextRequest, NextResponse } from "next/server";
import PDFTool from "@/modules/tools/PDFTool";

export async function POST(req: NextRequest) {
  try {
    const { studentName, certificationName, expeditionDate } = await req.json();

    // Llamamos al método que genera el PDF
    const { status, pdfBytes } = await PDFTool.CreateCertificate(
      studentName,
      certificationName,
      expeditionDate
    );

    if (status) {
      // Enviar el archivo PDF como una respuesta de descarga
      return new NextResponse(pdfBytes, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${studentName}-certificado.pdf"`,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Error al generar el certificado." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en la generación del certificado", error);
    return NextResponse.json(
      { error: "Error al generar el certificado." },
      { status: 500 }
    );
  }
}
