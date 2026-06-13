// Utilidad para hacer wrap de texto en varias líneas según el ancho máximo
function wrapText(
  font: any,
  text: string,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? currentLine + " " + word : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
import fs from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import path from "path";
import { EMBEDDED_FONTS, getFontBuffer } from "@/lib/fonts/embedded-fonts";

// Función para normalizar texto removiendo tildes y ñ
function normalizeText(text: string): string {
  return text
    .normalize("NFD") // Descompone los caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remueve las marcas diacríticas (tildes)
    .replace(/ñ/g, "n") // Reemplaza ñ con n
    .replace(/Ñ/g, "N"); // Reemplaza Ñ con N
}

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
function formatDateToMonthFirst(dateString: string | undefined | null): string {
  console.log("[PDFTool] Fecha recibida:", dateString);
  if (!dateString || typeof dateString !== "string") return "";
  // Forzar formato YYYY-MM-DD
  const cleanDateString = dateString.split("T")[0];
  // Validar que sea un string tipo 2027-08-22
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDateString)) return "";
  const [year, month, day] = cleanDateString.split("-");
  // Formato: DD MMM YYYY (ej: 22 Aug 2027)
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  if (isNaN(dateObj.getTime())) return "";
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
    year: "numeric",
  };
  const formattedDate = dateObj
    .toLocaleDateString("en-US", options)
    .replace(",", "");
  console.log("[PDFTool] Fecha formateada:", formattedDate);
  return formattedDate;
}

export default class PDFTool {
  public static async CreateCertificate(
    nameStudent: string,
    nameCourse: string,
    expirationDate: string, // Ahora es fecha de expiración
    codeVocher: string,
    URL_logo: string,
    documentNumber: string,
    _titleDiploma: string = "Professional Certification",
    _primaryFont: CustomFonts = CustomFonts.BAHNSCHRIFT,
    _secondaryFont: CustomFonts = CustomFonts.BAHNSCHRIFT
  ): Promise<{ status: boolean; pdfBytes: Uint8Array }> {
    try {
      // Normalizar el nombre del estudiante removiendo tildes y ñ
      const normalizedNameStudent = normalizeText(nameStudent);

      // Usamos process.cwd() que es más confiable en Next.js
      const templatePath = path.join(
        process.cwd(),
        "public/assets/certificates/Modelo_definitivo-SIN_INSIGNIA.pdf"
      );

      // Cargar el template PDF
      const existingPdfBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      let boldFont;
      try {
        await ensureFontkitRegistered();
        if (
          fontkitInstance &&
          typeof (pdfDoc as any).registerFontkit === "function"
        ) {
          try {
            (pdfDoc as any).registerFontkit(fontkitInstance);
          } catch {
            /* ya registrado */
          }
        }
        const arialBoldPath = path.join(
          process.cwd(),
          "public/assets/certificates/fonts/arial-bold.ttf"
        );
        boldFont = await pdfDoc.embedFont(fs.readFileSync(arialBoldPath));
      } catch (e) {
        console.warn("⚠️ No se pudo embeber Arial Bold, usando HelveticaBold:", e);
        boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      }
      const mainFont = boldFont;
      const courseFont = boldFont;

      const fontSize = 26;
      const courseFontSize = 34;

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
      const { width } = firstPage.getSize();

      const centerX = width / 2;
      const black = rgb(0, 0, 0);

      const logoBox = 275;
      const logoDims = logoImage.scaleToFit(logoBox, logoBox);
      const logoCenterY = 648;
      firstPage.drawImage(logoImage, {
        x: centerX - logoDims.width / 2,
        y: logoCenterY - logoDims.height / 2,
        width: logoDims.width,
        height: logoDims.height,
      });

      const maxStudentNameWidth = width - 120;
      const studentNameLines = wrapText(
        mainFont,
        normalizedNameStudent,
        fontSize,
        maxStudentNameWidth
      );
      const lineSpacing = 1.1;
      const studentBlockCenterY = 490;
      const studentNameStartY =
        studentBlockCenterY +
        ((studentNameLines.length - 1) * fontSize * lineSpacing) / 2 -
        fontSize / 3;
      for (let i = 0; i < studentNameLines.length; i++) {
        const line = studentNameLines[i];
        const lineWidth = mainFont.widthOfTextAtSize(line, fontSize);
        firstPage.drawText(line, {
          x: (width - lineWidth) / 2,
          y: studentNameStartY - i * fontSize * lineSpacing,
          size: fontSize,
          font: mainFont,
          color: black,
        });
      }

      const maxCourseNameWidth = width * 0.62;
      const courseWords = nameCourse.trim().split(/\s+/);
      let courseNameLines: string[];
      if (courseWords.length === 2) {
        courseNameLines = courseWords;
      } else {
        courseNameLines = wrapText(
          courseFont,
          nameCourse,
          courseFontSize,
          maxCourseNameWidth
        );
      }
      const courseLineSpacing = 1.1;
      const courseBlockCenterY = 375;
      const courseNameStartY =
        courseBlockCenterY +
        ((courseNameLines.length - 1) * courseFontSize * courseLineSpacing) / 2 -
        courseFontSize / 3;
      for (let i = 0; i < courseNameLines.length; i++) {
        const line = courseNameLines[i];
        const lineWidth = courseFont.widthOfTextAtSize(line, courseFontSize);
        firstPage.drawText(line, {
          x: (width - lineWidth) / 2,
          y: courseNameStartY - i * courseFontSize * courseLineSpacing,
          size: courseFontSize,
          font: courseFont,
          color: black,
        });
      }

      const idValueSize = 16;
      firstPage.drawText(documentNumber, {
        x: 305,
        y: 302.5,
        size: idValueSize,
        font: mainFont,
        color: black,
      });

      firstPage.drawText(codeVocher, {
        x: 313,
        y: 275.4,
        size: idValueSize,
        font: mainFont,
        color: black,
      });

      const formattedDate = formatDateToMonthFirst(expirationDate);
      const dateSize = 16;
      const dateWidth = mainFont.widthOfTextAtSize(formattedDate, dateSize);
      const dateBoxCenterX = 303;
      firstPage.drawText(formattedDate, {
        x: dateBoxCenterX - dateWidth / 2,
        y: 200.5,
        size: dateSize,
        font: mainFont,
        color: black,
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
    expirationDate: string, // Ahora es fecha de expiración
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
      // Normalizar el nombre del estudiante removiendo tildes y ñ
      const normalizedNameStudent = normalizeText(nameStudent);
      
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
        normalizedNameStudent,
        20
      );
      firstPage.drawText(normalizedNameStudent, {
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

      // Fecha de expiración
      const formattedDate = formatDateToMonthFirst(expirationDate);
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
