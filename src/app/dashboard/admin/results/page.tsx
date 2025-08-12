"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  User,
  BookOpen,
  GraduationCap,
  Shield,
  Eye,
  Download,
} from "lucide-react";
import { Modal } from "@/modules/tools/ModalScore"; // Modal de calificación simple
import { DetailedAttemptModal } from "@/components/ui/detailed-attempt-modal"; // Modal detallado para admin

type SimulatorStatus = "completed" | "not_started";
type ExamStatus = "completed" | "not_started";

type SimulatorCard = {
  id: number;
  name: string;
  status: SimulatorStatus;
};

type ExamCard = {
  id: number;
  name: string;
  status: ExamStatus;
};

const statusConfig = {
  completed: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle2,
    label: "Completado",
    badgeColor: "bg-green-100 text-green-800",
  },
  not_started: {
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: AlertCircle,
    label: "Pendiente",
    badgeColor: "bg-orange-100 text-orange-800",
  },
};

export default function AdminResultsPage() {
  const searchParams = useSearchParams();
  const voucherId = searchParams.get("voucher_id");
  const studentId = searchParams.get("student_id");

  const [simulators, setSimulators] = useState<SimulatorCard[]>([]);
  const [exams, setExams] = useState<ExamCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examDetails, setExamDetails] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);

  // Estados para el modal detallado de admin
  const [isDetailedModalOpen, setIsDetailedModalOpen] = useState(false);
  const [detailedAttemptData, setDetailedAttemptData] = useState<any>(null);
  const [loadingDetailed, setLoadingDetailed] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!voucherId || !studentId) {
        setLoading(false);
        return;
      }

      try {
        // Obtener información del estudiante
        const studentRes = await fetch(
          `/api/students/by-voucher?voucher_id=${voucherId}`
        );
        const studentData = await studentRes.json();
        if (studentRes.ok) {
          setStudent(studentData.data);
        }

        // Simular el localStorage para las APIs del estudiante
        localStorage.setItem("voucher_id", voucherId);

        // Obtener simuladores
        const simulatorsRes = await fetch(
          `/api/students/simulator?voucher_id=${voucherId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (simulatorsRes.ok) {
          const simulatorsData = await simulatorsRes.json();
          console.log("Simulators data:", simulatorsData); // Debug
          if (simulatorsData.data && Array.isArray(simulatorsData.data)) {
            const simulatorCards: SimulatorCard[] = simulatorsData.data.map(
              (sim: any) => ({
                id: sim.id,
                name: sim.name_exam, // Usar name_exam que es lo que viene de la API
                status: sim.has_attempts ? "completed" : "not_started",
              })
            );
            setSimulators(simulatorCards);
          }
        }

        // Obtener exámenes
        const examsRes = await fetch(
          `/api/students/exam?voucher_id=${voucherId}`
        );

        if (examsRes.ok) {
          const examsData = await examsRes.json();
          console.log("Exams data:", examsData); // Debug
          if (examsData.data && Array.isArray(examsData.data)) {
            const examCards: ExamCard[] = examsData.data.map((exam: any) => ({
              id: exam.id,
              name: exam.name_exam,
              status: exam.has_attempts ? "completed" : "not_started",
            }));
            setExams(examCards);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Agregar notificación visual del error si es necesario
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [voucherId, studentId]);

  const handleViewResults = async (type: "simulator" | "exam", id: number) => {
    try {
      let url = "";
      if (type === "simulator") {
        url = `/api/attempts/best-last-simulator?simulator_id=${id}&voucher_id=${voucherId}`;
      } else {
        url = `/api/attempts/best-last-exam?exam_id=${id}&voucher_id=${voucherId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Results data:", data); // Debug
        setExamDetails(data.data);
        setIsModalOpen(true);
      } else {
        const errorData = await response.json();
        console.error("Error al obtener los resultados:", errorData);
      }
    } catch (error) {
      console.error("Error al cargar los resultados:", error);
    }
  };

  const handleViewDetailedResults = async (
    type: "simulator" | "exam",
    id: number
  ) => {
    try {
      setLoadingDetailed(true);
      console.log("🔍 Iniciando análisis detallado para:", {
        type,
        id,
        voucherId,
      });

      // Primero obtener el attempt_id
      let url = "";
      if (type === "simulator") {
        url = `/api/attempts/best-last-simulator?simulator_id=${id}&voucher_id=${voucherId}`;
      } else {
        url = `/api/attempts/best-last-exam?exam_id=${id}&voucher_id=${voucherId}`;
      }

      console.log("🔍 Obteniendo attempt ID desde:", url);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Datos del attempt:", data);

        const attemptId =
          data.data?.best_attempt?.id || data.data?.last_attempt?.id;
        console.log("🎯 Attempt ID encontrado:", attemptId);

        if (attemptId) {
          // Intentar primero la API detallada de admin
          let detailedData = null;

          try {
            const detailedUrl = `/api/admin/attempts/${attemptId}`;
            console.log("🔍 Consultando detalles en:", detailedUrl);

            const detailedResponse = await fetch(detailedUrl, {
              method: "GET",
              credentials: "include",
            });

            if (detailedResponse.ok) {
              const result = await detailedResponse.json();
              detailedData = result.data;
              console.log(
                "✅ Datos detallados obtenidos de admin API:",
                detailedData
              );
            } else {
              console.warn(
                "⚠️ Admin API no disponible, usando método alternativo"
              );
              throw new Error("Admin API not available");
            }
          } catch (adminError) {
            console.warn(
              "⚠️ Usando método alternativo para obtener datos detallados"
            );

            // Método alternativo: construir los datos usando APIs existentes
            detailedData = await getDetailedDataAlternative(
              attemptId,
              data.data,
              type,
              id
            );
          }

          if (detailedData) {
            setDetailedAttemptData(detailedData);
            setIsDetailedModalOpen(true);
          }
        } else {
          console.error("❌ No se encontró attempt ID en los datos:", data);
        }
      } else {
        const errorData = await response.json();
        console.error("❌ Error al obtener el attempt ID:", errorData);
      }
    } catch (error) {
      console.error(
        "❌ Error completo al cargar los resultados detallados:",
        error
      );
    } finally {
      setLoadingDetailed(false);
    }
  };

  // Método alternativo para obtener datos detallados usando APIs existentes
  const getDetailedDataAlternative = async (
    attemptId: number,
    attemptData: any,
    examType: string,
    examId: number
  ) => {
    try {
      console.log(
        "🔍 Método alternativo: Obteniendo datos detallados para attempt:",
        attemptId
      );

      // 1. Obtener información básica del intento
      const attempt = attemptData.best_attempt || attemptData.last_attempt;
      if (!attempt) {
        throw new Error("No se encontró información del intento");
      }

      // 2. Obtener todas las preguntas del examen
      console.log("🔍 Obteniendo preguntas del examen:", attempt.exam_id);
      const questionsResponse = await fetch(
        `/api/exam/question?exam_id=${attempt.exam_id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!questionsResponse.ok) {
        throw new Error("Error al obtener preguntas del examen");
      }

      const questionsData = await questionsResponse.json();
      console.log("📋 Preguntas obtenidas:", questionsData);

      // 3. Obtener las respuestas del estudiante para este intento específico
      console.log(
        "🔍 Obteniendo respuestas del estudiante para attempt:",
        attemptId
      );

      // Obtener respuestas del estudiante usando la API
      const answersResponse = await fetch(
        `/api/admin/student-answers?attempt_id=${attemptId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!answersResponse.ok) {
        throw new Error("Error al obtener respuestas del estudiante");
      }

      const answersData = await answersResponse.json();
      const studentAnswers = answersData.data;

      console.log("📝 Respuestas del estudiante:", studentAnswers);

      // 4. Combinar preguntas con respuestas del estudiante
      const detailedQuestions =
        questionsData.data?.map((question: any) => {
          const studentAnswer = studentAnswers?.find(
            (answer: any) => answer.question_id === question.id
          );

          const correctOption = question.options?.find(
            (opt: any) => opt.is_correct
          );
          const selectedOption = studentAnswer
            ? question.options?.find(
                (opt: any) => opt.id === studentAnswer.selected_option_id
              )
            : null;

          return {
            id: question.id,
            question_text: question.question_text,
            explanation: question.explanation,
            options: question.options || [],
            student_selected_option_id:
              studentAnswer?.selected_option_id || null,
            selected_option: selectedOption || null,
            correct_option: correctOption || null,
            is_correct: studentAnswer
              ? studentAnswer.selected_option_id === correctOption?.id
              : false,
            is_answered: !!studentAnswer,
            answered_at: studentAnswer?.created_at || null,
          };
        }) || [];

      // 5. Calcular estadísticas detalladas
      const totalQuestions = detailedQuestions.length;
      const answeredQuestions = detailedQuestions.filter(
        (q: any) => q.is_answered
      ).length;
      const correctAnswers = detailedQuestions.filter(
        (q: any) => q.is_correct
      ).length;
      const incorrectAnswers = detailedQuestions.filter(
        (q: any) => q.is_answered && !q.is_correct
      ).length;
      const unansweredQuestions = totalQuestions - answeredQuestions;
      const scorePercentage =
        totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      // 6. Construir el objeto de datos completo
      const detailedData = {
        attempt: {
          ...attempt,
          duration_minutes:
            attempt.start_time && attempt.end_time
              ? Math.round(
                  (new Date(attempt.end_time).getTime() -
                    new Date(attempt.start_time).getTime()) /
                    (1000 * 60)
                )
              : null,
        },
        student: student,
        exam: {
          id: attempt.exam_id,
          name_exam: `${
            examType.charAt(0).toUpperCase() + examType.slice(1)
          } #${examId}`,
          description: `Análisis detallado del ${examType}`,
        },
        statistics: {
          total_questions: totalQuestions,
          answered_questions: answeredQuestions,
          correct_answers: correctAnswers,
          incorrect_answers: incorrectAnswers,
          unanswered_questions: unansweredQuestions,
          score_percentage: Math.round(scorePercentage * 100) / 100,
          pass_percentage: 70,
          passed: scorePercentage >= 70,
        },
        questions: detailedQuestions,
      };

      console.log(
        "✅ Datos detallados construidos exitosamente:",
        detailedData
      );
      return detailedData;
    } catch (error) {
      console.error("❌ Error en método alternativo:", error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 mx-auto mb-4 rounded-full border-4 border-purple-200 border-t-purple-600"></div>
          <p className="text-lg text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (!voucherId || !studentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 flex justify-center items-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">
            Parámetros requeridos no encontrados
          </p>
          <p className="text-sm text-gray-500">
            Se requiere voucher_id y student_id
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-xl shadow-lg shadow-purple-500/30">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent">
                Resultados del Estudiante - Admin
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Panel administrativo - Visualización de simuladores y exámenes
                completados
              </p>
            </div>
          </div>

          {/* Información del estudiante */}
          {student && (
            <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-200/80 rounded-lg p-4 border border-blue-300/60 shadow-lg shadow-blue-200/40">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-700" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    <strong>Estudiante:</strong> {student.fullname}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Email:</strong> {student.email} |{" "}
                    <strong>Documento:</strong> {student.document_type}{" "}
                    {student.document_number}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Simuladores */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
                Simuladores
              </h2>
            </div>

            {simulators.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay simuladores disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {simulators.map((simulator) => {
                  const config = statusConfig[simulator.status];
                  const IconComponent = config.icon;

                  return (
                    <div
                      key={simulator.id}
                      className={`p-6 rounded-lg border-2 ${config.borderColor} ${config.bgColor} shadow-sm hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-3 rounded-full ${config.bgColor} border ${config.borderColor}`}
                          >
                            <Lightbulb className={`h-6 w-6 ${config.color}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {simulator.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badgeColor}`}
                            >
                              <IconComponent className="w-3 h-3 mr-1" />
                              {config.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {simulator.status === "completed" && (
                            <>
                              <Button
                                onClick={() =>
                                  handleViewResults("simulator", simulator.id)
                                }
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Resumen
                              </Button>
                              <Button
                                onClick={() =>
                                  handleViewDetailedResults(
                                    "simulator",
                                    simulator.id
                                  )
                                }
                                disabled={loadingDetailed}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                {loadingDetailed
                                  ? "Cargando..."
                                  : "Análisis Detallado"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Exámenes */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent">
                Exámenes
              </h2>
            </div>

            {exams.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay exámenes disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => {
                  const config = statusConfig[exam.status];
                  const IconComponent = config.icon;

                  return (
                    <div
                      key={exam.id}
                      className={`p-6 rounded-lg border-2 ${config.borderColor} ${config.bgColor} shadow-sm hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-3 rounded-full ${config.bgColor} border ${config.borderColor}`}
                          >
                            <GraduationCap
                              className={`h-6 w-6 ${config.color}`}
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {exam.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badgeColor}`}
                            >
                              <IconComponent className="w-3 h-3 mr-1" />
                              {config.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {exam.status === "completed" && (
                            <>
                              <Button
                                onClick={() =>
                                  handleViewResults("exam", exam.id)
                                }
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Resumen
                              </Button>
                              <Button
                                onClick={() =>
                                  handleViewDetailedResults("exam", exam.id)
                                }
                                disabled={loadingDetailed}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                {loadingDetailed
                                  ? "Cargando..."
                                  : "Análisis Detallado"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal de calificación simple */}
        {isModalOpen && examDetails && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            examDetails={examDetails}
          />
        )}

        {/* Modal detallado para admin */}
        {isDetailedModalOpen && detailedAttemptData && (
          <DetailedAttemptModal
            isOpen={isDetailedModalOpen}
            onClose={() => setIsDetailedModalOpen(false)}
            attemptData={detailedAttemptData}
          />
        )}
      </div>
    </div>
  );
}
