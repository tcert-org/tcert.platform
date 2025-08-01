import fs from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"; // Usamos la fuente estándar de pdf-lib
import path from "path";

export default class PDFTool {
  public static async CreateCertificate(
    nameStudent: string,
    nameCourse: string,
    expeditionDate: string
  ): Promise<{ status: boolean; pdfBytes: Uint8Array }> {
    try {
      const date = new Date().toISOString();
      const nameCertificate = `${nameStudent}-${date}`; // Nombre del archivo PDF

      // Usamos la nueva ruta para el archivo template
      const templatePath = path.resolve(
        __dirname,
        "../../../../../public/assets/certificates/Modelo_definitivo-SIN_INSIGNIA.pdf"
      );

      // Cargar el template PDF
      const existingPdfBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Usamos una fuente estándar de pdf-lib (Helvetica)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica); // Usamos la fuente estándar
      const fontSize = 12;

      // Cargar el logo
      const logoPath = path.resolve(
        __dirname,
        "../../../../../public/assets/certificates/logos/Insignia-08.png"
      );
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);

      // Obtener la primera página del PDF
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Insertar el logo en la parte superior derecha
      const logoWidth = 100; // Ajusta el tamaño del logo
      const logoHeight = 40; // Ajusta el tamaño del logo
      firstPage.drawImage(logoImage, {
        x: width - logoWidth - 10, // 10px de margen derecho
        y: height - logoHeight - 10, // 10px de margen superior
        width: logoWidth,
        height: logoHeight,
      });

      // Insertar la información sobre el estudiante, curso, etc.
      firstPage.drawText(`Certificado otorgado a: ${nameStudent}`, {
        x: 50,
        y: height - 150,
        size: 20,
        font,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`Curso: ${nameCourse}`, {
        x: 50,
        y: height - 180,
        size: 18,
        font,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`Fecha de expedición: ${expeditionDate}`, {
        x: 50,
        y: height - 240,
        size: 18,
        font,
        color: rgb(0, 0, 0),
      });

      // Guardar el PDF como bytes en memoria
      const pdfBytes = await pdfDoc.save();

      // Devolver los bytes del PDF
      return { status: true, pdfBytes };
    } catch (error) {
      console.error("Error al generar el certificado:", error);
      return { status: false, pdfBytes: new Uint8Array() };
    }
  }
}
