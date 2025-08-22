"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

export default function FormExam() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("id") ?? "";

  const [examName, setExamName] = useState("Cargando título...");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number>
  >({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
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

        // Establecer el tiempo límite del examen
        if (examData.time_limit && examData.time_limit > 0) {
          const timeLimitInSeconds = examData.time_limit * 60; // Convertir minutos a segundos
          setTimeRemaining(timeLimitInSeconds);
        }

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

  // Función para formatear el tiempo
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = useCallback(async () => {
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

      // Solo calificar, no enviar unanswered
      const gradeRes = await fetch("/api/attempts/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          attempt_id: attemptId,
          final_submit: true,
          total_questions: questions.length,
          answered_questions: Object.keys(selectedOptions).length,
        }),
      });

      if (!gradeRes.ok) {
        const error = await gradeRes.json();
        console.error("Error al calificar examen:", error);
        alert("Error al calificar examen");
        return;
      }

      const gradeData = await gradeRes.json();

      // Limpiar los datos locales inmediatamente después de calificar exitosamente
      localStorage.removeItem(`simulator_${examId}_question_order`);
      questions.forEach((q) => {
        localStorage.removeItem(`simulator_${examId}_q${q.id}_option_order`);
      });

      // Verificar múltiples posibles campos de respuesta
      const passed =
        gradeData?.passed || gradeData?.data?.passed || gradeData?.success;

      // Si passed es true, actualizamos el estado del voucher
      if (passed === true) {
        try {
          const sessionRaw = sessionStorage.getItem("student-data");
          const session = JSON.parse(sessionRaw || "{}");
          const voucherId = session?.state?.decryptedStudent?.voucher_id;

          if (voucherId) {
            const updatePayload = {
              voucher_id: voucherId,
              new_status_slug: "aprobado", // Usar slug en lugar de ID
              is_used: true,
            };

            const updateVoucherRes = await fetch("/api/voucher-state", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatePayload),
            });

            if (!updateVoucherRes.ok) {
              console.error("Error al actualizar el estado del voucher");
            }
          }
        } catch (voucherError) {
          console.error("Error al procesar voucher:", voucherError);
        }
      }

      // Redirigir a la lista de exámenes
      window.location.href = "/dashboard/student/exam";
    } catch (err) {
      console.error("Error al enviar examen:", err);
      alert("Error inesperado al finalizar el examen");
    }
  }, [examId, questions, selectedOptions]);

  // Función para manejar cuando se acaba el tiempo
  const handleTimeUp = useCallback(async () => {
    if (hasSubmittedRef.current) return;

    alert("⏰ TIEMPO AGOTADO: El examen se enviará automáticamente.");

    // Enviar el examen automáticamente
    await handleSubmit();
  }, [handleSubmit]);

  // useEffect para el temporizador
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Tiempo agotado - auto enviar examen
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }

        // Mostrar advertencia cuando quedan exactamente 5 minutos (300 segundos)
        if (prev === 301) {
          setShowTimeWarning(true);
          // Ocultar la advertencia después de 10 segundos
          setTimeout(() => {
            setShowTimeWarning(false);
          }, 10000);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, handleTimeUp]);

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

    // Detectar cambio de pestaña o pérdida de enfoque
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 5000);

        // Después de 2 cambios de pestaña, redirigir automáticamente
        if (newCount >= 2) {
          // Marcar como enviado para evitar el modal de confirmación
          hasSubmittedRef.current = true;
          window.onbeforeunload = null;

          alert(
            "🚨 EXAMEN CANCELADO: Has cambiado de pestaña 2 veces. Por seguridad, serás redirigido a la lista de exámenes."
          );

          // Limpiar datos locales antes de redirigir
          localStorage.removeItem(`simulator_${examId}_question_order`);
          questions.forEach((q) => {
            localStorage.removeItem(
              `simulator_${examId}_q${q.id}_option_order`
            );
          });

          // Redirigir inmediatamente
          setTimeout(() => {
            window.location.href = "/dashboard/student/exam";
          }, 2000);
        }
      }
    };

    const handleBlur = () => {
      const newCount = tabSwitchCount + 1;
      setTabSwitchCount(newCount);
      setShowTabWarning(true);
      setTimeout(() => setShowTabWarning(false), 5000);

      // Después de 2 cambios de pestaña, redirigir automáticamente
      if (newCount >= 2) {
        // Marcar como enviado para evitar el modal de confirmación
        hasSubmittedRef.current = true;
        window.onbeforeunload = null;

        alert(
          "🚨 EXAMEN CANCELADO: Has perdido el enfoque de la ventana 2 veces. Por seguridad, serás redirigido a la lista de exámenes."
        );

        // Limpiar datos locales antes de redirigir
        localStorage.removeItem(`simulator_${examId}_question_order`);
        questions.forEach((q) => {
          localStorage.removeItem(`simulator_${examId}_q${q.id}_option_order`);
        });

        // Redirigir inmediatamente
        setTimeout(() => {
          window.location.href = "/dashboard/student/exam";
        }, 2000);
      }
    };

    const handleFocus = () => {
      // Cuando regresa al examen, mostrar mensaje
      if (tabSwitchCount > 0) {
        setShowTabWarning(true);
        setTimeout(() => setShowTabWarning(false), 3000);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [tabSwitchCount, examId, questions]);

  const handleOptionSelect = (optionIndex: number) => {
    if (!currentQuestion) return;
    const optionId = options[optionIndex]?.id;
    if (!optionId) return;

    setSelectedOptions((prev) => {
      const updated = { ...prev, [currentQuestion.id]: optionId };
      // Usar autosaveAttempt igual que en simulador
      autosaveAttempt(
        currentQuestion.id,
        optionId,
        questions.length,
        Object.keys({ ...prev, [currentQuestion.id]: optionId }).length
      );
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

  if (!questions.length)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {examName}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              No hay preguntas para mostrar.
            </p>
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
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-xl font-bold text-gray-900 truncate">
                  {examName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Pregunta {currentIndex + 1} de {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                Progreso: {Math.round(progressPercentage)}%
              </span>
              <span className="text-xs text-gray-600 sm:hidden">
                {Math.round(progressPercentage)}%
              </span>
              {timeRemaining !== null && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      timeRemaining <= 300
                        ? "text-red-600"
                        : timeRemaining <= 900
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              {tabSwitchCount > 0 && (
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                    tabSwitchCount === 1 ? "bg-red-100" : "bg-gray-100"
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${
                      tabSwitchCount === 1 ? "text-red-600" : "text-gray-600"
                    }`}
                  >
                    ⚠️ {tabSwitchCount}/2
                  </span>
                </div>
              )}
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
        <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg animate-pulse mx-4 max-w-[calc(100vw-2rem)]">
          <p className="text-xs sm:text-sm font-medium text-center">
            ⚠️ Acción no permitida durante el examen
          </p>
        </div>
      )}

      {/* Advertencia de tiempo */}
      {showTimeWarning && timeRemaining !== null && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg max-w-[calc(100vw-2rem)] text-center animate-pulse">
          <p className="text-xs sm:text-sm font-bold">
            ⏰ ADVERTENCIA DE TIEMPO
          </p>
          <p className="text-xs mt-1">
            Quedan menos de 5 minutos: {formatTime(timeRemaining)}
          </p>
          <p className="text-xs mt-1">
            El examen se enviará automáticamente cuando se acabe el tiempo
          </p>
        </div>
      )}

      {/* Advertencia de cambio de pestaña */}
      {showTabWarning && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg max-w-[calc(100vw-2rem)] text-center">
          <p className="text-xs sm:text-sm font-bold">
            🚨 ADVERTENCIA DE SEGURIDAD
          </p>
          <p className="text-xs mt-1">
            Cambio de pestaña detectado ({tabSwitchCount}{" "}
            {tabSwitchCount === 1 ? "vez" : "veces"})
          </p>
          {tabSwitchCount === 1 ? (
            <p className="text-xs mt-1 font-semibold">
              ⚠️ ÚLTIMA OPORTUNIDAD: Un cambio más cancelará el examen
            </p>
          ) : (
            <p className="text-xs mt-1">
              Mantente en esta pestaña durante todo el examen
            </p>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex gap-4 lg:gap-8 min-h-[calc(100vh-180px)] sm:min-h-[600px]">
          {/* Desktop Question Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <QuestionSidebar
              questions={questions}
              currentIndex={currentIndex}
              selectedOptions={selectedOptions}
              onSelect={setCurrentIndex}
              itemRefs={itemRefs}
            />
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-8 py-4 sm:py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm sm:text-base">
                        {currentIndex + 1}
                      </span>
                    </div>
                    <span className="text-white/90 font-medium text-sm sm:text-base">
                      Pregunta
                    </span>
                  </div>
                  <div className="text-white/90 text-xs sm:text-sm">
                    <span className="hidden sm:inline">
                      {questions.length - Object.keys(selectedOptions).length}{" "}
                      sin responder
                    </span>
                    <span className="sm:hidden">
                      {questions.length - Object.keys(selectedOptions).length}{" "}
                      sin resp.
                    </span>
                  </div>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-4 sm:p-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6 sm:mb-8 leading-relaxed">
                  {currentQuestion.text}
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  {loadingOptions ? (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600 text-sm sm:text-base">
                        Cargando opciones...
                      </span>
                    </div>
                  ) : options.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <p className="text-gray-500 text-sm sm:text-base">
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
                          className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all duration-200 border-2 group hover:shadow-md ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500/20"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <div className="flex items-start space-x-3 sm:space-x-4">
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                              }`}
                            >
                              {optionLetter}
                            </div>
                            <span className="text-gray-800 leading-relaxed pt-0.5 text-sm sm:text-base">
                              {opt.content}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Mobile Question Navigation */}
                <div className="block lg:hidden mt-8 pt-6 border-t border-gray-100">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Navegación de Preguntas
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                        <span>Respondida</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                        <span>Actual</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
                        <span>Pendiente</span>
                      </div>
                    </div>
                  </div>

                  {/* Question Grid */}
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mb-4">
                    {questions.map((q, idx) => {
                      const isCurrent = idx === currentIndex;
                      const isAnswered = selectedOptions.hasOwnProperty(q.id);

                      let buttonClasses =
                        "w-full aspect-square rounded-lg text-xs font-semibold transition-all duration-200 border-2 flex items-center justify-center ";

                      if (isCurrent) {
                        buttonClasses +=
                          "bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-500/30";
                      } else if (isAnswered) {
                        buttonClasses +=
                          "bg-blue-200 text-blue-800 border-blue-300 hover:bg-blue-300 hover:border-blue-400";
                      } else {
                        buttonClasses +=
                          "bg-gray-100 text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600";
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentIndex(idx);
                          }}
                          className={buttonClasses}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Progress Summary */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold text-blue-600">
                        {Object.keys(selectedOptions).length}
                      </span>{" "}
                      de{" "}
                      <span className="font-semibold">{questions.length}</span>{" "}
                      respondidas
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (Object.keys(selectedOptions).length /
                              questions.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="bg-gray-50 px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-100">
                <div className="flex justify-between items-center gap-4">
                  <button
                    onClick={goBack}
                    disabled={currentIndex === 0}
                    className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                      currentIndex === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow"
                    }`}
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Anterior</span>
                    <span className="sm:hidden">Ant.</span>
                  </button>

                  {isLast ? (
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-sm sm:text-base"
                    >
                      <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Enviar Examen</span>
                      <span className="sm:hidden">Enviar</span>
                    </button>
                  ) : (
                    <button
                      onClick={goNext}
                      className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-sm sm:text-base"
                    >
                      <span className="hidden sm:inline">Siguiente</span>
                      <span className="sm:hidden">Sig.</span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
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
        onConfirm={handleSubmit}
      />
    </div>
  );
}
