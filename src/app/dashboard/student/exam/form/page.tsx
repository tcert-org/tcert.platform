"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ConfirmModal from "@/modules/tools/Modal_Confirmacion_Simulador";
import QuestionSidebar from "@/modules/tools/QuestionSidebar";
import { getShuffledQuestionOrder } from "@/modules/tools/examUtils";
import { getShuffledOptions } from "@/modules/tools/optionUtils";
import { autosaveAttempt } from "@/modules/tools/autosaveUtils";

interface Question {
  id: number;
  text: string;
}
interface Option {
  id: number;
  content: string;
}

export default function FormExam() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("id") ?? "";

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
  const hasSubmittedRef = useRef(false);

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

        if (!examRes.ok) throw new Error("Error al obtener el examen");
        const examData = await examRes.json();
        setExamName(examData.name_exam || "Examen sin nombre");

        if (!questionRes.ok) throw new Error("Error al obtener preguntas");
        const questionData = await questionRes.json();

        const parsedQuestions: Question[] = (questionData.data ?? []).map(
          (q: any) => ({
            id: q.id,
            text: q.content,
          })
        );

        const shuffledQuestions = getShuffledQuestionOrder(
          examId,
          parsedQuestions
        );
        setQuestions(shuffledQuestions);
        setCurrentIndex(0);
        setSelectedOptions({});
      } catch (err) {
        console.error(err);
        setExamName("Error al cargar el examen");
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
        const rawOptions: Option[] = data.data ?? [];

        const shuffled = getShuffledOptions(examId, current.id, rawOptions);
        setOptions(shuffled);
      } catch (err) {
        console.error("Error al obtener opciones:", err);
        setOptions([]);
      }
      setLoadingOptions(false);
    }

    fetchOptions();
  }, [questions, currentIndex, examId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasSubmittedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleOptionSelect = (optionIndex: number) => {
    if (!currentQuestion) return;
    const optionId = options[optionIndex]?.id;
    if (!optionId) return;

    setSelectedOptions((prev) => {
      const updated = { ...prev, [currentQuestion.id]: optionId };
      autosaveAttempt(questions, updated);
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

  const handleSubmit = async () => {
    hasSubmittedRef.current = true;
    window.onbeforeunload = null;

    try {
      const attemptRes = await fetch("/api/attempts/current", {
        method: "GET",
        credentials: "include",
      });

      if (!attemptRes.ok) {
        console.error("Error al obtener intento activo", attemptRes);
        alert("Error al obtener el intento activo");
        return;
      }

      const attemptResult = await attemptRes.json();
      const attemptId = attemptResult?.data?.id;

      if (!attemptId) {
        alert("No se encontró intento activo");
        return;
      }

      // Paso 1: Obtener las respuestas
      const payload = questions.map((q) => ({
        exam_attempt_id: Number(attemptId),
        question_id: q.id,
        selected_option_id: selectedOptions[q.id] ?? null,
      }));

      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error al guardar respuestas:", error);
        alert(error?.error || "Error al guardar respuestas");
        return;
      }

      // Paso 2: Calificar el examen
      const gradeRes = await fetch("/api/attempts/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ attempt_id: attemptId, final_submit: true }),
      });

      if (!gradeRes.ok) {
        const error = await gradeRes.json();
        console.error("Error al calificar examen:", error);
        alert("Error al calificar examen");
        return;
      }

      const gradeData = await gradeRes.json();

      // Verifica qué datos estamos recibiendo
      console.log("gradeRes data:", gradeData); // Esto nos da la respuesta completa

      // Ahora verificamos si 'passed' está presente
      const passed = gradeData?.passed;
      console.log("passed value:", passed); // Verificar si 'passed' es verdadero o falso

      // Si passed es true, actualizamos el estado del voucher
      if (passed) {
        const session = JSON.parse(
          sessionStorage.getItem("student-data") || "{}"
        );
        const voucherId = session?.state?.decryptedStudent?.voucher_id;

        if (voucherId) {
          const updateVoucherRes = await fetch("/api/voucher-state", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              voucher_id: voucherId,
              new_status_id: 5, // Aprobado (ID para Aprobado)
              is_used: true,
            }),
          });

          if (!updateVoucherRes.ok) {
            const error = await updateVoucherRes.json();
            console.error("Error al actualizar el estado del voucher", error);
          }
        }
      }

      // Limpiar los datos locales después de enviar el examen
      localStorage.removeItem(`simulator_${examId}_question_order`);
      questions.forEach((q) => {
        localStorage.removeItem(
          `simulator_${examId}_question_${q.id}_option_order`
        );
      });
      alert("freno");
      window.location.href = "/dashboard/student/exam";
    } catch (err) {
      console.error("Error al enviar examen:", err);
      alert("Error inesperado al finalizar el examen");
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
        <QuestionSidebar
          questions={questions}
          currentIndex={currentIndex}
          selectedOptions={selectedOptions}
          onSelect={setCurrentIndex}
          itemRefs={itemRefs}
        />

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
        onConfirm={handleSubmit}
      />
    </div>
  );
}
