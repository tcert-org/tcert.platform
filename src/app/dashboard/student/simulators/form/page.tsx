"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ConfirmModal from "./Modal_Confirmacion_Simulador";

interface Question {
  id: number;
  text: string;
}
interface Option {
  id: number;
  content: string;
}

export default function FormSimulador() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("simulatorId");

  const [examName, setExamName] = useState("Cargando título...");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number>
  >({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const currentQuestion = questions[currentIndex];
  const unansweredCount = questions.filter(
    (q) => !(q.id in selectedOptions)
  ).length;

  // 🧠 Autosave al responder la primera pregunta
  const autosaveAttempt = async (partialAnswers: Record<number, number>) => {
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
    } catch (err) {
      console.error("Error en autosave:", err);
    }
  };

  useEffect(() => {
    async function fetchExamData() {
      if (!examId) {
        setExamName("ID del examen no proporcionado");
        return;
      }

      try {
        const [examRes, questionRes] = await Promise.all([
          fetch(`/api/exam/${examId}`),
          fetch(`/api/exam/question?exam_id=${examId}`),
        ]);

        if (!examRes.ok) throw new Error("Error al obtener el examen.");
        const examData = await examRes.json();
        setExamName(examData.name_exam || "Examen sin nombre");

        if (!questionRes.ok) throw new Error("Error al obtener preguntas.");
        const questionData = await questionRes.json();

        const parsedQuestions: Question[] = (questionData.data ?? []).map(
          (q: any) => ({
            id: q.id,
            text: q.content,
          })
        );

        setQuestions(parsedQuestions);
        setCurrentIndex(0);
        setSelectedOptions({});
      } catch (error) {
        setExamName("Error al cargar el examen");
        setQuestions([]);
        console.error(error);
      }
    }

    fetchExamData();
  }, [examId]);

  useEffect(() => {
    async function fetchOptions() {
      const current = questions[currentIndex];
      if (!current) return;

      setLoadingOptions(true);
      try {
        const res = await fetch(
          `/api/exam/question/elections?question_id=${current.id}`
        );
        const data = await res.json();
        setOptions(data.data ?? []);
      } catch (err) {
        console.error("Error al obtener opciones:", err);
        setOptions([]);
      }
      setLoadingOptions(false);
    }

    fetchOptions();
  }, [questions, currentIndex]);

  const handleOptionSelect = (optionIndex: number) => {
    if (!currentQuestion) return;
    const optionId = options[optionIndex]?.id;
    if (!optionId) return;

    setSelectedOptions((prev) => {
      const updated = { ...prev, [currentQuestion.id]: optionId };

      // 💾 Autosave cada vez que se responde una pregunta
      autosaveAttempt(updated);

      return updated;
    });
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1)
      setCurrentIndex((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const isLast = currentIndex === questions.length - 1;

  const handleConfirm = async () => {
    try {
      setModalOpen(false);

      const attemptRes = await fetch("/api/attempts/current", {
        method: "GET",
        credentials: "include",
      });
      const attemptResult = await attemptRes.json();
      const attemptId = attemptResult?.data?.id;

      if (!attemptId) {
        alert("No se encontró el intento activo.");
        return;
      }

      if (Object.keys(selectedOptions).length === 0) {
        alert("No seleccionaste ninguna respuesta.");
        return;
      }

      const payload = questions.map((question) => ({
        exam_attempt_id: Number(attemptId),
        question_id: question.id,
        selected_option_id: selectedOptions[question.id] ?? null,
      }));

      const response = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error?.error || "Error al guardar respuestas.");
        return;
      }

      // ✅ NUEVO: Calificar intento
      const gradeRes = await fetch("/api/attempts/grade", {
        method: "POST",
        credentials: "include",
      });
      const gradeData = await gradeRes.json();

      if (!gradeRes.ok) {
        console.error("❌ Error al calificar:", gradeData?.error);
      } else {
        console.log("✅ Intento calificado:", gradeData);
      }

      window.onbeforeunload = null;
      alert("¡Examen enviado con éxito!");
      window.location.href = "/dashboard/student/simulators";
    } catch (err) {
      console.error("❌ Error al enviar respuestas:", err);
      alert("Hubo un error inesperado.");
    }
  };

  if (!questions.length)
    return (
      <div className="max-w-3xl mx-auto mt-10 font-sans text-center">
        <h2>{examName}</h2>
        <p className="mt-8">No hay preguntas para mostrar.</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-10 font-sans flex flex-col gap-5">
      <h2 className="text-center mb-0">{examName}</h2>
      <div className="flex gap-5 min-h-[450px]">
        <div className="w-56 rounded-md shadow-md bg-white overflow-y-auto border border-gray-300 p-4 flex flex-col gap-3">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = selectedOptions.hasOwnProperty(q.id);
            const bgColor =
              isCurrent || isAnswered
                ? "bg-blue-900 text-white"
                : "bg-blue-100 text-blue-900";
            return (
              <div
                key={q.id}
                ref={(el) => {
                  if (el) itemRefs.current[idx] = el;
                }}
                className={`cursor-pointer px-4 py-3 rounded-md text-center font-bold text-base ${bgColor}`}
              >
                Pregunta {idx + 1}
              </div>
            );
          })}
        </div>

        <div className="flex-grow min-w-[480px] rounded-md shadow-md border border-gray-200 p-5 flex flex-col min-h-[350px]">
          <h3 className="mb-5">{currentQuestion.text}</h3>
          <div className="flex flex-col gap-4 flex-grow">
            {loadingOptions ? (
              <p>Cargando opciones...</p>
            ) : options.length === 0 ? (
              <p>No hay opciones para esta pregunta.</p>
            ) : (
              options.map((opt, i) => {
                const isSelected =
                  selectedOptions[currentQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(i)}
                    className={`px-5 py-3 rounded-md text-left text-base cursor-pointer transition-all border ${
                      isSelected
                        ? "border-blue-900 bg-blue-100 shadow-md"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {opt.content}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-5 flex justify-between">
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              className={`px-6 py-3 rounded-md font-bold text-white ${
                currentIndex === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 hover:bg-blue-950"
              }`}
            >
              Atrás
            </button>

            {isLast ? (
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-3 rounded-md bg-red-600 text-white font-bold hover:bg-red-700"
              >
                Enviar examen
              </button>
            ) : (
              <button
                onClick={goNext}
                className="px-6 py-3 rounded-md bg-blue-900 text-white font-bold hover:bg-blue-950"
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        unansweredCount={unansweredCount}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
