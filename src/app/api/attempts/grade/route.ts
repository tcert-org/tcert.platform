import { NextRequest, NextResponse } from "next/server";
import AttemptsService from "@/modules/attempts/service";

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
    const updatedAttempt = await service.gradeExamAttempt(attempt_id);

    const response = NextResponse.json({
      message: "Intento calificado correctamente",
      data: updatedAttempt,
    });

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
