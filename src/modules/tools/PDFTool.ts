import fs from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"; // Usamos la fuente estándar de pdf-lib
import path from "path";

// Función de formato de fecha
function formatDateToMonthFirst(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short", // Abreviación del mes (en inglés)
    day: "2-digit", // Día con 2 dígitos
    year: "numeric", // Año completo
  };

  const date = new Date(dateString);

  // Formateamos la fecha y removemos la coma entre el día y el año
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate.replace(",", ""); // Eliminamos la coma
}

export default class PDFTool {
  public static async CreateCertificate(
    nameStudent: string,
    nameCourse: string,
    expeditionDate: string,
    codeVocher: string,
    URL_logo: string,
    titleDiploma: string = "Professional Certification"
  ): Promise<{ status: boolean; pdfBytes: Uint8Array }> {
    try {
      const date = new Date().toISOString();
      const nameCertificate = `${nameStudent}-${date}`; // Nombre del archivo PDF

      // Usamos process.cwd() que es más confiable en Next.js
      const templatePath = path.join(
        process.cwd(),
        "public/assets/certificates/Modelo_definitivo-SIN_INSIGNIA.pdf"
      );

      // Cargar el template PDF
      const existingPdfBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Usamos una fuente estándar de pdf-lib (Helvetica)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica); // Usamos la fuente estándar
      const fontSize = 20;

      // Cargar el logo usando process.cwd()
      const logoPath = path.join(
        process.cwd(),
        `public/assets/certificates/logos/${URL_logo}`
      );
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);

      // Obtener la primera página del PDF
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Insertar el logo en la parte superior derecha
      const logoWidth = 120; // Ajusta el tamaño del logo
      const logoHeight = 120; // Ajusta el tamaño del logo
      firstPage.drawImage(logoImage, {
        x: width - logoWidth - 80, // 10px de margen derecho
        y: height - logoHeight - 35, // 10px de margen superior
        width: logoWidth,
        height: logoHeight,
      });

      // Insertar la información sobre el estudiante, curso, etc.
      const studentNameWidth = font.widthOfTextAtSize(nameStudent, fontSize);
      const studentNameX = (width - studentNameWidth) / 2; // Centrado
      firstPage.drawText(nameStudent, {
        x: studentNameX,
        y: height - 250,
        size: fontSize,
        font,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      const courseNameWidth = font.widthOfTextAtSize(nameCourse, fontSize);
      const courseNameX = (width - courseNameWidth) / 2; // Centrado
      firstPage.drawText(nameCourse, {
        x: courseNameX,
        y: height - 370,
        size: fontSize,
        font,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      const titleWidth = font.widthOfTextAtSize(titleDiploma, fontSize);
      const titleX = (width - titleWidth) / 2; // Centrado
      firstPage.drawText(titleDiploma, {
        x: titleX,
        y: height - 430,
        size: fontSize,
        font,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      const codeWidth = font.widthOfTextAtSize(codeVocher, fontSize);
      const codeX = (width - codeWidth + 75) / 2; // Centrado
      firstPage.drawText(codeVocher, {
        x: codeX,
        y: height - 508.5,
        size: 12,
        font,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      // Formatear la fecha y agregarla
      const formattedDate = formatDateToMonthFirst(expeditionDate); // Obtener la fecha formateada
      firstPage.drawText(formattedDate, {
        x: 80,
        y: height - 536,
        size: 18,
        font,
        color: rgb(1, 1, 1), // Color blanco
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
