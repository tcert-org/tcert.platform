import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import ExamAttempts from "@/modules/attempts/controller";

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log("📥 POST intento recibido:", data);

  const response = await ExamAttempts.insertAttempt(data);
  const json = await response.json();

  const attemptId = json?.data?.id;

  if (attemptId) {
    const cookieStore = await cookies(); // 👈 aquí va el await
    cookieStore.set("student_attempt_id", attemptId.toString(), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60, // 1 hora
    });
    console.log("✅ Cookie HTTP-only creada con attempt_id:", attemptId);
  } else {
    console.warn("⚠️ No se pudo establecer la cookie: attempt_id no presente");
  }

  return NextResponse.json(json);
}
