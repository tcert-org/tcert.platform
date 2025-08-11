import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
  Target,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface DetailedAttemptModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptData: any;
}

export function DetailedAttemptModal({
  isOpen,
  onClose,
  attemptData,
}: DetailedAttemptModalProps) {
  if (!attemptData) return null;

  const { attempt, student, exam, statistics, questions = [] } = attemptData;

  const getOptionStatusIcon = (question: any, option: any) => {
    const isSelected =
      Number(question.student_selected_option_id) === Number(option.id);
    const isCorrect = option.is_correct;

    if (isSelected && isCorrect) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    } else if (isSelected && !isCorrect) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    } else if (!isSelected && isCorrect) {
      return <CheckCircle2 className="h-4 w-4 text-green-400 opacity-50" />;
    }
    return null;
  };

  const getOptionStatusClass = (question: any, option: any) => {
    const isSelected =
      Number(question.student_selected_option_id) === Number(option.id);
    const isCorrect = option.is_correct;

    if (isSelected && isCorrect) {
      return "bg-green-50 border-green-300 text-green-800";
    } else if (isSelected && !isCorrect) {
      return "bg-red-50 border-red-300 text-red-800";
    } else if (!isSelected && isCorrect) {
      return "bg-green-50 border-green-200 text-green-600 opacity-70";
    }
    return "bg-gray-50 border-gray-200 text-gray-700";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-purple-600" />
            Análisis Detallado del Examen
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del Estudiante */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Estudiante
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Nombre:</strong> {student?.fullname || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {student?.email || "N/A"}
                </p>
                <p>
                  <strong>Documento:</strong> {student?.document_type}{" "}
                  {student?.document_number}
                </p>
              </div>
            </div>

            {/* Información del Examen */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Información del Examen
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Examen:</strong> {exam?.name_exam || "N/A"}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {attempt.attempt_date
                    ? new Date(attempt.attempt_date).toLocaleString("es-CO")
                    : new Date(attempt.created_at).toLocaleString("es-CO")}
                </p>
                {attempt.duration_minutes && (
                  <p>
                    <strong>Duración:</strong> {attempt.duration_minutes}{" "}
                    minutos
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Estadísticas del Examen
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {statistics.total_questions}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Total Preguntas
                </div>
              </div>
              <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {statistics.correct_answers}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Correctas
                </div>
              </div>
              <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-red-100">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {statistics.incorrect_answers}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Incorrectas
                </div>
              </div>
              <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-orange-100">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {statistics.unanswered_questions}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Sin Responder
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <div
                className={`
                inline-flex items-center gap-3 px-6 py-4 rounded-xl border-2 shadow-lg
                ${
                  statistics.passed
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-900"
                    : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-900"
                }
              `}
              >
                <div
                  className={`
                  p-2 rounded-full
                  ${statistics.passed ? "bg-green-200" : "bg-red-200"}
                `}
                >
                  {statistics.passed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-700" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-700" />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {statistics.score_percentage}%
                  </div>
                  <div
                    className={`
                    text-sm font-semibold uppercase tracking-wide
                    ${statistics.passed ? "text-green-700" : "text-red-700"}
                  `}
                  >
                    {statistics.passed ? "APROBADO" : "REPROBADO"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preguntas Detalladas */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Análisis Detallado por Pregunta
            </h3>

            {questions.length > 0 ? (
              questions.map((question: any, index: number) => (
                <div
                  key={question.id}
                  className={`border-2 rounded-lg p-6 ${
                    question.is_answered
                      ? question.is_correct
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  {/* Header de la pregunta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-sm">
                          Pregunta {index + 1}
                        </Badge>
                        {question.is_answered ? (
                          question.is_correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        )}
                        <span className="text-sm font-medium">
                          {question.is_answered
                            ? question.is_correct
                              ? "Correcta"
                              : "Incorrecta"
                            : "Sin responder"}
                        </span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">
                        {question.question_text}
                      </h4>
                    </div>
                  </div>

                  {/* Opciones */}
                  <div className="space-y-3">
                    {question.options.map((option: any) => (
                      <div
                        key={option.id}
                        className={`p-3 rounded-lg border-2 flex items-center gap-3 ${getOptionStatusClass(
                          question,
                          option
                        )}`}
                      >
                        {getOptionStatusIcon(question, option)}
                        <span className="flex-1">
                          {option.content || option.option_text}
                        </span>
                        {Number(question.student_selected_option_id) ===
                          Number(option.id) && (
                          <Badge variant="secondary" className="text-xs">
                            Seleccionada
                          </Badge>
                        )}
                        {option.is_correct && (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-600"
                          >
                            Correcta
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explicación */}
                  {question.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Explicación:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  Análisis detallado no disponible
                </p>
                <p className="text-sm text-gray-400">
                  Los detalles de las preguntas individuales no están
                  disponibles en este momento.
                  <br />
                  Las estadísticas generales se muestran arriba.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
