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
  const [allOptions, setAllOptions] = useState<Record<number, Option[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number | null>
  >({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const currentQuestion = questions[currentIndex];
  const currentOptions = currentQuestion
    ? allOptions[currentQuestion.id] ?? []
    : [];
  const unansweredCount = questions.filter(
    (q) => !(q.id in selectedOptions)
  ).length;

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

        const optionsMap: Record<number, Option[]> = {};
        for (const question of parsedQuestions) {
          const res = await fetch(
            `/api/exam/question/elections?question_id=${question.id}`
          );
          const data = await res.json();
          optionsMap[question.id] = data.data ?? [];
        }
        setAllOptions(optionsMap);
      } catch (error) {
        setExamName("Error al cargar el examen");
        setQuestions([]);
        console.error(error);
      }
    }

    fetchExamData();
  }, [examId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Requerido por algunos navegadores
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleOptionSelect = (optionId: number) => {
    if (!currentQuestion) return;
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
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

      // ✅ Calificar intento ahora que las respuestas están insertadas
      const gradeRes = await fetch("/api/attempts/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempt_id: attemptId }),
      });

      if (!gradeRes.ok) {
        const error = await gradeRes.json();
        console.error("❌ Error al calificar intento:", error);
        alert("Respuestas enviadas, pero hubo un error al calificar.");
        return;
      }

      const gradeData = await gradeRes.json();
      console.log("✅ Intento calificado:", gradeData);

      window.onbeforeunload = null;
      alert("¡Examen enviado y calificado con éxito!");
      window.location.href = "/dashboard/student/simulators";
    } catch (err) {
      console.error("❌ Error en handleConfirm:", err);
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
            const isAnswered = selectedOptions[q.id] !== undefined;
            const bgColor =
              isCurrent || isAnswered
                ? "bg-blue-900 text-white"
                : "bg-blue-100 text-blue-900";
            return (
              <div
                key={q.id}
                ref={(el) => (itemRefs.current[idx] = el)}
                onClick={() => setCurrentIndex(idx)}
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
            ) : currentOptions.length === 0 ? (
              <p>No hay opciones para esta pregunta.</p>
            ) : (
              currentOptions.map((opt) => {
                const isSelected =
                  selectedOptions[currentQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
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
