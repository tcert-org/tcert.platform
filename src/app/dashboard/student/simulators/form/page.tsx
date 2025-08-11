"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ConfirmModal from "@/modules/tools/Modal_Confirmacion_Simulador";
import QuestionSidebar from "@/modules/tools/QuestionSidebar";
import { getShuffledQuestionOrder } from "@/modules/tools/examUtils";
import { getShuffledOptions } from "@/modules/tools/optionUtils";
import { autosaveAttempt } from "@/modules/tools/autosaveUtils";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  HelpCircle,
} from "lucide-react";

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
  const [showWarning, setShowWarning] = useState(false);

  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const currentQuestion = questions[currentIndex];
  const unansweredCount = questions.filter(
    (q) => !(q.id in selectedOptions)
  ).length;

  const hasSubmittedRef = useRef(false);

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

        const shuffledQuestions = getShuffledQuestionOrder(
          examId,
          parsedQuestions
        );

        setQuestions(shuffledQuestions);
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
        const rawOptions: Option[] = data.data ?? [];
        const shuffled = getShuffledOptions(
          examId ?? "",
          current.id,
          rawOptions
        );
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

    // Prevenir copiar y pegar
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevenir Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X
      if (
        e.ctrlKey &&
        (e.key === "c" || e.key === "v" || e.key === "a" || e.key === "x")
      ) {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        return false;
      }
      // Prevenir F12, Ctrl+Shift+I (DevTools)
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        return false;
      }
      // Prevenir Ctrl+U (ver código fuente)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        return false;
      }
      // Prevenir Ctrl+S (guardar página)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        return false;
      }
    };

    // Prevenir menú contextual (click derecho)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return false;
    };

    // Prevenir arrastrar elementos
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevenir selección de texto
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("selectstart", handleSelectStart);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("selectstart", handleSelectStart);
    };
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

  const handleConfirm = async () => {
    hasSubmittedRef.current = true;
    window.onbeforeunload = null;
    try {
      setModalOpen(false);
      const attemptRes = await fetch("/api/attempts/current", {
        method: "GET",
        credentials: "include",
      });
      const attemptResult = await attemptRes.json();
      const attemptId = attemptResult?.data?.id;
      if (!attemptId) return alert("No se encontró el intento activo.");
      if (Object.keys(selectedOptions).length === 0)
        return alert("No seleccionaste ninguna respuesta.");

      const payload = questions.map((q) => ({
        exam_attempt_id: Number(attemptId),
        question_id: q.id,
        selected_option_id: selectedOptions[q.id] ?? null,
      }));

      const response = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });

      if (!response.ok) {
        const error = await response.json();
        return alert(error?.error || "Error al guardar respuestas.");
      }

      const gradeRes = await fetch("/api/attempts/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ attempt_id: attemptId, final_submit: true }),
      });

      if (gradeRes.ok) {
        // Limpiar los datos locales solo si la calificación fue exitosa
        localStorage.removeItem(`simulator_${examId}_question_order`);
        questions.forEach((q) =>
          localStorage.removeItem(
            `simulator_${examId}_q${q.id}_option_order`
          )
        );
      } else {
        console.error("Error al calificar simulador");
      }

      window.location.href = "/dashboard/student/simulators";
    } catch (err) {
      console.error("❌ Error al enviar respuestas:", err);
      alert("Hubo un error inesperado.");
    }
  };

  if (!questions.length)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {examName}
            </h2>
            <p className="text-gray-600">No hay preguntas para mostrar.</p>
          </div>
        </div>
      </div>
    );

  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div
      className="min-h-screen bg-white select-none"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{examName}</h1>
                <p className="text-sm text-gray-600">
                  Pregunta {currentIndex + 1} de {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Progreso: {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full bg-gray-200 h-1">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Advertencia de seguridad */}
      {showWarning && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <p className="text-sm font-medium">
            ⚠️ Acción no permitida durante el simulador
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 min-h-[600px]">
          {/* Question Sidebar */}
          <div className="w-80 flex-shrink-0">
            <QuestionSidebar
              questions={questions}
              currentIndex={currentIndex}
              selectedOptions={selectedOptions}
              onSelect={setCurrentIndex}
              itemRefs={itemRefs}
            />
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">
                        {currentIndex + 1}
                      </span>
                    </div>
                    <span className="text-white/90 font-medium">Pregunta</span>
                  </div>
                  <div className="text-white/90 text-sm">
                    {questions.length - Object.keys(selectedOptions).length} sin
                    responder
                  </div>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-8 leading-relaxed">
                  {currentQuestion.text}
                </h3>

                <div className="space-y-4">
                  {loadingOptions ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">
                        Cargando opciones...
                      </span>
                    </div>
                  ) : options.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        No hay opciones para esta pregunta.
                      </p>
                    </div>
                  ) : (
                    options.map((opt, i) => {
                      const isSelected =
                        selectedOptions[currentQuestion.id] === opt.id;
                      const optionLetter = String.fromCharCode(65 + i); // A, B, C, D...

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionSelect(i)}
                          className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 group hover:shadow-md ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500/20"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                              }`}
                            >
                              {optionLetter}
                            </div>
                            <span className="text-gray-800 leading-relaxed pt-0.5">
                              {opt.content}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <button
                    onClick={goBack}
                    disabled={currentIndex === 0}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      currentIndex === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  {isLast ? (
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Examen</span>
                    </button>
                  ) : (
                    <button
                      onClick={goNext}
                      className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
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
