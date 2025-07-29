export async function autosaveAttempt(
  questions: { id: number }[],
  partialAnswers: Record<number, number>
) {
  try {
    const attemptRes = await fetch("/api/attempts/current", {
      method: "GET",
      credentials: "include",
    });
    const attemptResult = await attemptRes.json();
    const attemptId = attemptResult?.data?.id;
    if (!attemptId) return;

    const payload = questions.map((q) => ({
      exam_attempt_id: Number(attemptId),
      question_id: q.id,
      selected_option_id: partialAnswers[q.id] ?? null,
    }));

    await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: payload }),
    });

    await fetch("/api/attempts/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ attempt_id: attemptId }),
    });
  } catch (err) {
    console.error("❌ Error en autosave:", err);
  }
}
