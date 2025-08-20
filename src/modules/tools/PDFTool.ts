import fs from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import path from "path";
import { EMBEDDED_FONTS, getFontBuffer } from "@/lib/fonts/embedded-fonts";

// Variable global para fontkit
let fontkitInstance: any = null;
let fontkitInitialized = false;

// Función para inicializar fontkit de manera segura
async function initializeFontkit() {
  if (fontkitInitialized && fontkitInstance) return fontkitInstance;

  try {
    // Importar dinámicamente @pdf-lib/fontkit
    const fontkitModule = await import("@pdf-lib/fontkit");
    fontkitInstance = fontkitModule.default || fontkitModule;
    fontkitInitialized = true;
    console.log("✅ Fontkit inicializado correctamente");
    return fontkitInstance;
  } catch (error) {
    console.error("❌ Error inicializando fontkit:", error);
    throw new Error("No se pudo inicializar fontkit");
  }
}

// Función para registrar fontkit en PDFDocument
async function ensureFontkitRegistered() {
  try {
    if (!fontkitInstance) {
      await initializeFontkit();
    }

    // Intentar diferentes métodos de registro
    if (typeof (PDFDocument as any).registerFontkit === "function") {
      (PDFDocument as any).registerFontkit(fontkitInstance);
      console.log("✅ Fontkit registrado globalmente");
    } else {
      console.log(
        "⚠️ PDFDocument.registerFontkit no disponible, intentando método alternativo"
      );
    }
  } catch (error) {
    console.error("❌ Error registrando fontkit:", error);
    throw error;
  }
}

// Enum para las fuentes disponibles
export enum CustomFonts {
  BAHNSCHRIFT = "bahnschrift.ttf",
  BAHNSCHRIFT_CONDENSED = "bahnschrift-condensed.ttf", // Misma fuente, variante condensed
  SCHEHERAZADE_REGULAR = "ScheherazadeNew-Regular.ttf",
  SCHEHERAZADE_MEDIUM = "ScheherazadeNew-Medium.ttf",
  SCHEHERAZADE_SEMIBOLD = "ScheherazadeNew-SemiBold.ttf",
  SCHEHERAZADE_BOLD = "ScheherazadeNew-Bold.ttf",
}

// Mapeo de fuentes personalizadas a nombres de fuentes embebidas
const fontEmbeddedMapping: Record<CustomFonts, keyof typeof EMBEDDED_FONTS> = {
  [CustomFonts.BAHNSCHRIFT]: "BAHNSCHRIFT_TTF",
  [CustomFonts.BAHNSCHRIFT_CONDENSED]: "BAHNSCHRIFT_TTF", // Usa la misma fuente, variante condensed
  [CustomFonts.SCHEHERAZADE_REGULAR]: "SCHEHERAZADENEW_REGULAR_TTF",
  [CustomFonts.SCHEHERAZADE_MEDIUM]: "SCHEHERAZADENEW_MEDIUM_TTF",
  [CustomFonts.SCHEHERAZADE_SEMIBOLD]: "SCHEHERAZADENEW_SEMIBOLD_TTF",
  [CustomFonts.SCHEHERAZADE_BOLD]: "SCHEHERAZADENEW_BOLD_TTF",
};

// Función helper para cargar fuentes personalizadas embebidas
async function loadCustomFont(pdfDoc: PDFDocument, fontName: CustomFonts) {
  try {
    // Asegurar que fontkit esté registrado antes de usar fuentes personalizadas
    await ensureFontkitRegistered();

    const embeddedFontName = fontEmbeddedMapping[fontName];
    if (!embeddedFontName) {
      throw new Error(`Fuente no encontrada en el mapeo: ${fontName}`);
    }

    console.log(`🎨 Cargando fuente personalizada: ${fontName}`);
    const fontBuffer = getFontBuffer(embeddedFontName);

    // Intentar registrar fontkit en la instancia del documento también
    if (
      fontkitInstance &&
      typeof (pdfDoc as any).registerFontkit === "function"
    ) {
      try {
        (pdfDoc as any).registerFontkit(fontkitInstance);
        console.log("✅ Fontkit registrado en documento específico");
      } catch (regError) {
        console.log("⚠️ Ya estaba registrado en documento");
      }
    }

    // Para variantes de Bahnschrift, intentar especificar opciones de fuente
    let embedOptions: any = {};
    if (fontName === CustomFonts.BAHNSCHRIFT_CONDENSED) {
      console.log("🔧 Aplicando configuración para Bahnschrift Condensed");
      // Intentar especificar subset o propiedades para la variante condensed
      embedOptions = {
        subset: true,
        // Nota: pdf-lib puede no soportar completamente variable fonts
        // pero intentaremos cargar la fuente base
      };
    }

    // Cargar la fuente TTF desde el buffer embebido
    const customFont = await pdfDoc.embedFont(fontBuffer, embedOptions);
    console.log(`✅ Fuente personalizada cargada exitosamente: ${fontName}`);

    return customFont;
  } catch (error) {
    console.warn(
      `⚠️ Error loading custom font ${fontName}, falling back to Helvetica:`,
      error
    );
    return await pdfDoc.embedFont(StandardFonts.Helvetica);
  }
}

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
    documentNumber: string, // Nuevo parámetro para número de documento
    titleDiploma: string = "Professional Certification",
    primaryFont: CustomFonts = CustomFonts.BAHNSCHRIFT,
    secondaryFont: CustomFonts = CustomFonts.BAHNSCHRIFT
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

      // Cargar fuentes personalizadas - USAR BAHNSCHRIFT CONDENSED excepto curso
      const mainFont = await loadCustomFont(
        pdfDoc,
        CustomFonts.BAHNSCHRIFT_CONDENSED
      );
      const titleFont = await loadCustomFont(
        pdfDoc,
        CustomFonts.BAHNSCHRIFT_CONDENSED
      );
      const courseFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold); // HelveticaBold para el curso

      const fontSize = 24;
      const courseFontSize = 24; // Tamaño más grande para el curso
      const titleFontSize = 22;

      // Cargar el logo desde URL remota o ruta local
      let logoBytes: Buffer | Uint8Array;
      let ext = "";
      if (/^https?:\/\//.test(URL_logo)) {
        const response = await fetch(URL_logo);
        if (!response.ok) throw new Error("No se pudo descargar el logo");
        logoBytes = new Uint8Array(await response.arrayBuffer());
        const urlParts = URL_logo.split("?")[0].split(".");
        ext = urlParts[urlParts.length - 1].toLowerCase();
      } else {
        const logoUrl = `https://e48bssyezdxaxnzg.public.blob.vercel-storage.com/logos_insignias/${URL_logo}`;
        const response = await fetch(logoUrl);
        if (!response.ok) throw new Error("No se pudo descargar el logo");
        logoBytes = new Uint8Array(await response.arrayBuffer());
        const urlParts = URL_logo.split("?")[0].split(".");
        ext = urlParts[urlParts.length - 1].toLowerCase();
      }
      let logoImage;
      if (["jpg", "jpeg"].includes(ext)) {
        logoImage = await pdfDoc.embedJpg(logoBytes);
      } else {
        logoImage = await pdfDoc.embedPng(logoBytes);
      }

      // Obtener la primera página del PDF
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Insertar el logo en la parte superior derecha
      const logoWidth = 120; // Ajusta el tamaño del logo
      const logoHeight = 120; // Ajusta el tamaño del logo
      firstPage.drawImage(logoImage, {
        x: width - logoWidth - 35, // 35px de margen derecho
        y: height - logoHeight - 50, // 50px de margen superior
        width: logoWidth,
        height: logoHeight,
      });

      // Insertar el nombre del estudiante con fuente personalizada
      const studentNameWidth = mainFont.widthOfTextAtSize(
        nameStudent,
        fontSize
      );
      const studentNameX = (width - studentNameWidth) / 2; // Centrado
      firstPage.drawText(nameStudent, {
        x: studentNameX,
        y: height - 315,
        size: fontSize,
        font: mainFont,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      // Insertar el nombre del curso en MAYÚSCULAS con HelveticaBold
      const courseNameUpperCase = nameCourse.toUpperCase();
      const courseNameWidth = courseFont.widthOfTextAtSize(
        courseNameUpperCase,
        courseFontSize
      );
      const courseNameX = (width - courseNameWidth) / 2; // Centrado
      firstPage.drawText(courseNameUpperCase, {
        x: courseNameX,
        y: height - 470,
        size: courseFontSize,
        font: courseFont,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      // Insertar el título del diploma con fuente diferente
      const titleWidth = titleFont.widthOfTextAtSize(
        titleDiploma,
        titleFontSize
      );
      const titleX = (width - titleWidth) / 2; // Centrado
      firstPage.drawText(titleDiploma, {
        x: titleX,
        y: height - 510,
        size: titleFontSize,
        font: titleFont,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      // Insertar el número de documento debajo del nombre del estudiante
      const documentText = documentNumber;
      const documentWidth = mainFont.widthOfTextAtSize(documentText, 14);
      const documentX = (width - documentWidth + 75) / 3.4; // Centrado
      firstPage.drawText(documentText, {
        x: documentX,
        y: height - 576, // 25px debajo del nombre
        size: 14,
        font: mainFont,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      // Código del voucher con fuente personalizada BAHNSCHRIFT
      const codeWidth = mainFont.widthOfTextAtSize(codeVocher, 12);
      const codeX = (width - codeWidth + 75) / 2.9; // Centrado
      firstPage.drawText(codeVocher, {
        x: codeX,
        y: height - 600.5,
        size: 14,
        font: mainFont,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      // Formatear la fecha y agregarla con fuente personalizada BAHNSCHRIFT
      const formattedDate = formatDateToMonthFirst(expeditionDate);
      firstPage.drawText(formattedDate, {
        x: 95,
        y: height - 689,
        size: 18,
        font: mainFont,
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

  // Método adicional para crear certificado con configuración de fuentes específica
  public static async CreateCertificateWithCustomFonts(
    nameStudent: string,
    nameCourse: string,
    expeditionDate: string,
    codeVocher: string,
    URL_logo: string,
    documentNumber: string, // Nuevo parámetro para número de documento
    titleDiploma: string = "Professional Certification",
    fontConfig: {
      studentName?: CustomFonts;
      courseName?: CustomFonts;
      title?: CustomFonts;
      code?: CustomFonts;
      date?: CustomFonts;
      document?: CustomFonts; // Nueva opción para fuente del documento
    } = {}
  ): Promise<{ status: boolean; pdfBytes: Uint8Array }> {
    try {
      const date = new Date().toISOString();
      const templatePath = path.join(
        process.cwd(),
        "public/assets/certificates/Modelo_definitivo-SIN_INSIGNIA.pdf"
      );

      const existingPdfBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Cargar fuentes específicas para cada elemento
      const studentNameFont = await loadCustomFont(
        pdfDoc,
        fontConfig.studentName || CustomFonts.BAHNSCHRIFT
      );
      const courseNameFont = await loadCustomFont(
        pdfDoc,
        fontConfig.courseName || CustomFonts.BAHNSCHRIFT
      );
      const titleFont = await loadCustomFont(
        pdfDoc,
        fontConfig.title || CustomFonts.BAHNSCHRIFT
      );
      const codeFont = await loadCustomFont(
        pdfDoc,
        fontConfig.code || CustomFonts.BAHNSCHRIFT
      );
      const dateFont = await loadCustomFont(
        pdfDoc,
        fontConfig.date || CustomFonts.BAHNSCHRIFT
      );
      const documentFont = await loadCustomFont(
        pdfDoc,
        fontConfig.document || CustomFonts.BAHNSCHRIFT
      );

      // Cargar el logo desde URL remota o ruta local
      let logoBytes: Buffer | Uint8Array;
      let ext = "";
      if (/^https?:\/\//.test(URL_logo)) {
        const response = await fetch(URL_logo);
        if (!response.ok) throw new Error("No se pudo descargar el logo");
        logoBytes = new Uint8Array(await response.arrayBuffer());
        const urlParts = URL_logo.split("?")[0].split(".");
        ext = urlParts[urlParts.length - 1].toLowerCase();
      } else {
        const logoUrl = `https://e48bssyezdxaxnzg.public.blob.vercel-storage.com/logos_insignias/${URL_logo}`;
        const response = await fetch(logoUrl);
        if (!response.ok) throw new Error("No se pudo descargar el logo");
        logoBytes = new Uint8Array(await response.arrayBuffer());
        const urlParts = URL_logo.split("?")[0].split(".");
        ext = urlParts[urlParts.length - 1].toLowerCase();
      }
      let logoImage;
      if (["jpg", "jpeg"].includes(ext)) {
        logoImage = await pdfDoc.embedJpg(logoBytes);
      } else {
        logoImage = await pdfDoc.embedPng(logoBytes);
      }

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Logo
      const logoWidth = 120;
      const logoHeight = 120;
      firstPage.drawImage(logoImage, {
        x: width - logoWidth - 35,
        y: height - logoHeight - 50,
        width: logoWidth,
        height: logoHeight,
      });

      // Nombre del estudiante
      const studentNameWidth = studentNameFont.widthOfTextAtSize(
        nameStudent,
        20
      );
      firstPage.drawText(nameStudent, {
        x: (width - studentNameWidth) / 2,
        y: height - 315,
        size: 20,
        font: studentNameFont,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      // Número de documento del estudiante
      const documentText = documentNumber;
      const documentWidth = documentFont.widthOfTextAtSize(documentText, 14);
      firstPage.drawText(documentText, {
        x: (width - documentWidth) / 2,
        y: height - 340,
        size: 14,
        font: documentFont,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      // Nombre del curso
      const courseNameWidth = courseNameFont.widthOfTextAtSize(nameCourse, 20);
      firstPage.drawText(nameCourse, {
        x: (width - courseNameWidth) / 2,
        y: height - 470,
        size: 20,
        font: courseNameFont,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      // Título del diploma
      const titleWidth = titleFont.widthOfTextAtSize(titleDiploma, 22);
      firstPage.drawText(titleDiploma, {
        x: (width - titleWidth) / 2,
        y: height - 510,
        size: 22,
        font: titleFont,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      // Código del voucher
      const codeWidth = codeFont.widthOfTextAtSize(codeVocher, 12);
      firstPage.drawText(codeVocher, {
        x: (width - codeWidth + 75) / 2.65,
        y: height - 575.5,
        size: 12,
        font: codeFont,
        color: rgb(45 / 255, 25 / 255, 87 / 255),
      });

      // Fecha
      const formattedDate = formatDateToMonthFirst(expeditionDate);
      firstPage.drawText(formattedDate, {
        x: 95,
        y: height - 689,
        size: 18,
        font: dateFont,
        color: rgb(1, 1, 1),
      });

      const pdfBytes = await pdfDoc.save();
      return { status: true, pdfBytes };
    } catch (error) {
      console.error(
        "Error al generar el certificado con fuentes personalizadas:",
        error
      );
      return { status: false, pdfBytes: new Uint8Array() };
    }
  }
}
