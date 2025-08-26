// C:\code\tcert.platform\src\app\api\attempts\grade\route.ts
import { NextRequest, NextResponse } from "next/server";
import AttemptsService from "@/modules/attempts/service";
import VoucherStateController from "@/modules/voucher-state/controller"; // Asegúrate de tener la importación correcta

export async function POST(req: NextRequest) {
  try {
    const cookieStore = req.cookies;
    let attemptIdRaw = cookieStore.get("student_attempt_id")?.value;

    // Leer el body una vez si es necesario
    let body: any = null;
    if (
      !attemptIdRaw ||
      req.headers.get("content-type")?.includes("application/json")
    ) {
      try {
        body = await req.json();
      } catch (e) {
        console.warn("⚠️ No se pudo parsear JSON en el body:", e);
      }
    }

    // Si no viene en la cookie, usar el body
    if (!attemptIdRaw && body?.attempt_id) {
      attemptIdRaw = String(body.attempt_id);
    }

    if (!attemptIdRaw) {
      return NextResponse.json(
        { error: "No se encontró 'attempt_id' ni en cookie ni en el body" },
        { status: 400 }
      );
    }

    const attempt_id = parseInt(attemptIdRaw, 10);
    if (isNaN(attempt_id)) {
      return NextResponse.json(
        { error: "El valor de 'attempt_id' no es válido" },
        { status: 400 }
      );
    }

    const service = new AttemptsService();
    // Leer total_questions y unanswered del body si existen
    const totalQuestions =
      typeof body?.total_questions === "number"
        ? body.total_questions
        : undefined;
    const unanswered =
      typeof body?.unanswered === "number"
        ? body.unanswered
        : typeof totalQuestions === "number" &&
          body?.answered_questions !== undefined
        ? totalQuestions - Number(body.answered_questions)
        : undefined;
    const updatedAttempt = await service.gradeExamAttempt(attempt_id, {
      totalQuestions,
      unanswered,
    });

    const responseData = {
      message: "Intento calificado correctamente",
      data: updatedAttempt,
      passed: updatedAttempt?.passed,
    };

    const response = NextResponse.json(responseData);
    // 🔐 Eliminar cookie solo si viene `final_submit: true`
    const shouldClearCookie = body?.final_submit === true;
    if (shouldClearCookie && cookieStore.get("student_attempt_id")?.value) {
      response.cookies.set("student_attempt_id", "", {
        httpOnly: true,
        path: "/",
        expires: new Date(0),
      });
    }

    return response;
  } catch (err) {
    console.error("❌ Error en grading POST:", err);
    return NextResponse.json(
      { error: "Error interno al calificar intento" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Obtener voucher_id de los parámetros de la URL
    const voucherIdStr = req.nextUrl.searchParams.get("voucher_id");

    // Verificar si voucher_id está presente
    if (!voucherIdStr) {
      return NextResponse.json(
        { error: "Falta el voucher_id en la consulta." },
        { status: 400 }
      );
    }

    // Convertir voucherId a número
    const voucherId = parseInt(voucherIdStr, 10);

    // Verificar si la conversión fue exitosa
    if (isNaN(voucherId)) {
      return NextResponse.json(
        { error: "El voucher_id debe ser un número válido." },
        { status: 400 }
      );
    }

    // Llamar al método del controlador con voucherId como número
    const response = await VoucherStateController.getVoucherState(voucherId);

    return response;
  } catch (error) {
    console.error("Error al obtener el estado del voucher:", error);
    return NextResponse.json(
      { error: "Error al obtener el estado del voucher." },
      { status: 500 }
    );
  }
}
