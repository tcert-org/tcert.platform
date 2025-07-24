// Versión refactorizada de FormSimulador con TailwindCSS, lógica organizada y autoSubmit al cerrar pestaña
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  useEffect(() => {
    async function fetchExamData() {
      if (!examId) return setExamName("ID del examen no proporcionado");
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
          (q: any) => ({ id: q.id, text: q.content })
        );

        setQuestions(parsedQuestions);
        setCurrentIndex(0);
        setSelectedOptions({});
      } catch (error) {
        console.error(error);
        setExamName("Error al cargar el examen");
        setQuestions([]);
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

  const autoSubmit = useCallback(async () => {
    try {
      const attemptRes = await fetch("/api/attempts/current", {
        method: "GET",
        credentials: "include",
      });
      const attemptResult = await attemptRes.json();
      const attemptId = attemptResult?.data?.id;
      if (!attemptId) return;

      const payload = questions.map((q) => {
        const selectedIndex = selectedOptions[q.id];
        const selectedOption =
          selectedIndex !== undefined ? options[selectedIndex] : null;
        return {
          exam_attempt_id: Number(attemptId),
          question_id: q.id,
          selected_option_id: selectedOption?.id ?? null,
        };
      });

      await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });
    } catch (err) {
      console.error("❌ Error en autoSubmit al cerrar examen:", err);
    }
  }, [questions, selectedOptions, options]);

  useEffect(() => {
    const handleUnload = (event: BeforeUnloadEvent) => {
      if (!showConfirmModal) {
        event.preventDefault();
        event.returnValue = "";
        autoSubmit();
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [autoSubmit, showConfirmModal]);

  const handleOptionSelect = (optionIndex: number) => {
    if (!currentQuestion) return;
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1)
      setCurrentIndex((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const confirmAndSubmit = () => {
    const unanswered = questions.length - Object.keys(selectedOptions).length;
    if (unanswered > 0) {
      const confirmIncomplete = confirm(
        `Aún tienes ${unanswered} preguntas sin responder. ¿Deseas enviar el examen?`
      );
      if (!confirmIncomplete) return;
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setShowConfirmModal(true);
    try {
      const attemptRes = await fetch("/api/attempts/current", {
        method: "GET",
        credentials: "include",
      });
      const attemptResult = await attemptRes.json();
      const attemptId = attemptResult?.data?.id;

      if (!attemptId) return alert("No se encontró el intento activo.");

      const payload = questions.map((q) => {
        const selectedIndex = selectedOptions[q.id];
        const selectedOption =
          selectedIndex !== undefined ? options[selectedIndex] : null;
        return {
          exam_attempt_id: Number(attemptId),
          question_id: q.id,
          selected_option_id: selectedOption?.id ?? null,
        };
      });

      const response = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Respuesta no válida:", errorText);
        return alert("Error al guardar respuestas.");
      }

      await response.json();
      alert("¡Examen enviado con éxito!");
      window.location.href = "/dashboard/student/simulators";
    } catch (err) {
      console.error("❌ Error al enviar respuestas:", err);
      alert("Hubo un error inesperado.");
    } finally {
      setShowConfirmModal(false);
    }
  };

  if (!questions.length) {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center">
        <h2 className="text-2xl font-bold">{examName}</h2>
        <p className="mt-6 text-gray-600">No hay preguntas para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 flex flex-col gap-6 font-sans">
      <h2 className="text-center text-2xl font-bold text-gray-800">
        {examName}
      </h2>
      <div className="flex gap-6 h-[450px]">
        <div className="w-56 rounded-lg shadow-md bg-white overflow-y-auto border border-gray-300 p-4 flex flex-col gap-2">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = selectedOptions.hasOwnProperty(q.id);
            const bg =
              isCurrent || isAnswered
                ? "bg-[#213763] text-white"
                : "bg-blue-100 text-blue-900";
            return (
              <div
                key={q.id}
                ref={(el: HTMLDivElement | null) => {
                  itemRefs.current[idx] = el;
                }}
                onClick={() => setCurrentIndex(idx)}
                className={`text-center font-bold text-sm py-2 px-4 rounded cursor-pointer ${bg}`}
              >
                Pregunta {idx + 1}
              </div>
            );
          })}
        </div>

        <div className="flex-1 min-w-[480px] rounded-lg shadow-md border border-gray-300 p-6 flex flex-col min-h-[350px]">
          <h3 className="text-lg font-semibold mb-4">{currentQuestion.text}</h3>
          <div className="flex flex-col gap-4 flex-1">
            {loadingOptions ? (
              <p>Cargando opciones...</p>
            ) : options.length === 0 ? (
              <p>No hay opciones para esta pregunta.</p>
            ) : (
              options.map((opt, i) => {
                const isSelected = selectedOptions[currentQuestion.id] === i;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(i)}
                    className={`text-left px-5 py-3 rounded border font-medium text-sm transition-all
                      ${
                        isSelected
                          ? "border-[#213763] bg-[#e1e8f7] shadow-md"
                          : "border-gray-300 bg-white"
                      }`}
                  >
                    {opt.content}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              className={`px-6 py-2 rounded text-white font-bold transition-all
                ${
                  currentIndex === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#213763] hover:opacity-90"
                }`}
            >
              Atrás
            </button>

            {isLast ? (
              <button
                onClick={confirmAndSubmit}
                className="px-6 py-2 rounded bg-red-600 text-white font-bold hover:opacity-90"
              >
                Enviar examen
              </button>
            ) : (
              <button
                onClick={goNext}
                className="px-6 py-2 rounded bg-[#213763] text-white font-bold hover:opacity-90"
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
