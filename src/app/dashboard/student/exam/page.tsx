// C:\code\tcert.platform\src\app\dashboard\student\exam\page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Play,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Modal } from "@/modules/tools/ModalScore"; // Modal de calificación

// Tipo de estado de intento
type ExamStatus = "completed" | "not_started";

// Representación visual del examen
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

export default function StudentExamPage() {
  const [exam, setExam] = useState<ExamCard | null>(null); // Solo un examen
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examDetails, setExamDetails] = useState<any>(null);
  const [voucherStatusSlug, setVoucherStatusSlug] = useState<string | null>(
    null
  );
  const router = useRouter();

  // Función para obtener el número de intento basado en el slug
  const getAttemptNumber = (slug: string | null): number => {
    switch (slug) {
      case "sin-presentar":
        return 0;
      case "re-take-1":
        return 1;
      case "re-take-2":
        return 2;
      case "perdido":
        return 3; // Todos los intentos agotados
      case "aprobado":
        return -1; // Aprobado, no aplica
      default:
        return 0;
    }
  };

  // Función para obtener los intentos restantes
  const getRemainingAttempts = (slug: string | null): number => {
    const attemptNumber = getAttemptNumber(slug);
    return attemptNumber >= 3 ? 0 : 3 - attemptNumber;
  };

  // Función auxiliar para mapear IDs a slugs (temporal para migración)
  const mapStatusIdToSlug = (statusId: number): string | null => {
    const statusMap = {
      1: "sin-presentar",
      2: "perdido",
      3: "perdido",
      4: "perdido",
      5: "aprobado",
      6: "re-take-1",
      7: "re-take-2",
    };
    return statusMap[statusId as keyof typeof statusMap] || null;
  };

  // Función auxiliar para verificar si el voucher está en estado final
  const isVoucherInFinalState = (): boolean => {
    return voucherStatusSlug === "perdido" || voucherStatusSlug === "aprobado";
  };

  // Función auxiliar para verificar si está aprobado
  const isVoucherApproved = (): boolean => {
    return voucherStatusSlug === "aprobado";
  };

  // Función auxiliar para verificar si está reprobado/perdido
  const isVoucherFailed = (): boolean => {
    return voucherStatusSlug === "perdido";
  };

  useEffect(() => {
    async function fetchExam() {
      setLoading(true);
      try {
        const session = JSON.parse(
          sessionStorage.getItem("student-data") || "{}"
        );
        const voucherId = session?.state?.decryptedStudent?.voucher_id;

        if (!voucherId) {
          setExam(null);
          return;
        }

        // Obtener el estado del voucher
        try {
          const voucherResponse = await fetch(
            `/api/voucher-state?voucher_id=${voucherId}`
          );
          if (voucherResponse.ok) {
            const voucherData = await voucherResponse.json();
            const statusSlug = voucherData?.data?.voucher_statuses?.slug;
            setVoucherStatusSlug(statusSlug);
          }
        } catch {
          // Fallback al método anterior
          try {
            const voucherResponse = await fetch(
              `/api/attempts/grade?voucher_id=${voucherId}`
            );
            if (voucherResponse.ok) {
              const voucherData = await voucherResponse.json();
              const statusId = voucherData?.data?.status_id;
              const mappedSlug = mapStatusIdToSlug(statusId);
              setVoucherStatusSlug(mappedSlug);
            }
          } catch {
            // Continúa sin estado de voucher
          }
        }

        // Primero obtenemos el student_id
        const studentResponse = await fetch(
          `/api/students/by-voucher?voucher_id=${voucherId}`
        );
        const studentData = await studentResponse.json();

        if (!studentResponse.ok || !studentData?.data?.id) {
          setExam(null);
          return;
        }

        const studentId = studentData.data.id;

        // Verificamos si el estudiante ya tiene algún resultado/intento
        const res = await fetch(`/api/students/exam?voucher_id=${voucherId}`);
        const result = await res.json();

        if (
          !res.ok ||
          !Array.isArray(result.data) ||
          result.data.length === 0
        ) {
          setExam(null);
        } else {
          // Verificamos si existe algún resultado para cualquiera de los exámenes
          let hasAnyResult = false;
          for (const examData of result.data) {
            try {
              const resultsResponse = await fetch(
                `/api/results?exam_id=${examData.id}&student_id=${studentId}`
              );

              if (resultsResponse.ok) {
                const resultsData = await resultsResponse.json();
                if (resultsData.data !== null) {
                  hasAnyResult = true;
                  break;
                }
              }
            } catch {
              // Continúa verificando otros exámenes
            }
          }

          // Creamos un único examen representativo
          const singleExam: ExamCard = {
            id: 0, // ID ficticio que será reemplazado por uno aleatorio al iniciar
            name: "Examen Final",
            status: hasAnyResult ? "completed" : "not_started",
          };

          setExam(singleExam);
        }
      } catch {
        setExam(null);
      } finally {
        setLoading(false);
      }
    }

    fetchExam();
  }, []);

  const handleStartExam = async () => {
    // Verificar si el voucher ya está en estado final usando la función auxiliar
    if (isVoucherInFinalState()) {
      const statusText = isVoucherApproved() ? "aprobado" : "perdido";
      alert(
        `No puedes iniciar el examen porque ya tienes un resultado ${statusText}.`
      );
      return;
    }

    const session = JSON.parse(sessionStorage.getItem("student-data") || "{}");
    const voucherId = session?.state?.decryptedStudent?.voucher_id;

    if (!voucherId) {
      alert("No se pudo obtener tu voucher.");
      return;
    }

    try {
      const voucherRes = await fetch(
        `/api/voucher-state?voucher_id=${voucherId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const voucherData = await voucherRes.json();

      if (!voucherRes.ok || !voucherData?.data) {
        alert("No se pudo obtener el estado del voucher.");
        return;
      }

      // Obtener el slug actual, puede venir directo o mediante el mapeo de ID
      let currentSlug = voucherData.data.voucher_statuses?.slug;
      if (!currentSlug && voucherData.data.status_id) {
        currentSlug = mapStatusIdToSlug(voucherData.data.status_id);
      }

      if (!currentSlug) {
        alert("No se pudo determinar el estado del voucher.");
        return;
      }

      console.log("Estado actual del voucher:", currentSlug);

      let newStatusSlug = "";

      // Flujo correcto: sin-presentar -> re-take-1 -> re-take-2 -> perdido
      switch (currentSlug) {
        case "sin-presentar":
          newStatusSlug = "re-take-1";
          break;
        case "re-take-1":
          newStatusSlug = "re-take-2";
          break;
        case "re-take-2":
          newStatusSlug = "perdido";
          break;
        default:
          alert("No puedes iniciar el examen en este momento.");
          return;
      }

      const res = await fetch("/api/voucher-state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucher_id: voucherId,
          new_status_slug: newStatusSlug,
          is_used: false,
        }),
      });

      if (!res.ok) {
        alert("Error al actualizar el estado del voucher");
        return;
      }

      // Obtener un examen aleatorio
      const randomExamRes = await fetch(
        `/api/students/exam/random?voucher_id=${voucherId}`
      );
      const randomExamData = await randomExamRes.json();

      if (!randomExamRes.ok) {
        alert(randomExamData?.error || "No se encontró un examen disponible.");
        return;
      }

      const examId = randomExamData.data.id;

      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_id: examId,
          voucher_id: voucherId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result?.error || "Error al crear intento.");
        return;
      }

      router.push(`/dashboard/student/exam/form?id=${examId}`);
    } catch {
      alert("Error inesperado.");
    }
  };

  const handleViewResults = async () => {
    // Obtener el voucher_id desde sessionStorage
    const session = JSON.parse(sessionStorage.getItem("student-data") || "{}");
    const voucherId = session?.state?.decryptedStudent?.voucher_id;

    if (!voucherId) {
      alert("No se pudo obtener el voucher ID.");
      return;
    }

    try {
      // Llamamos al endpoint para obtener el student_id basado en el voucher_id
      const response = await fetch(
        `/api/students/by-voucher?voucher_id=${voucherId}`
      );
      const studentData = await response.json();

      if (!response.ok || !studentData?.data?.id) {
        alert("No se pudo obtener el ID del estudiante.");
        return;
      }

      const studentId = studentData.data.id;

      // Obtener todos los exámenes de la certificación para verificar cuáles son exámenes (no simuladores)
      const examsRes = await fetch(
        `/api/students/exam?voucher_id=${voucherId}`
      );
      const examsData = await examsRes.json();

      if (
        !examsRes.ok ||
        !Array.isArray(examsData.data) ||
        examsData.data.length === 0
      ) {
        alert("No se encontraron exámenes disponibles.");
        return;
      }

      // Obtener todos los resultados de todos los exámenes que el estudiante haya presentado
      const allResults = [];
      for (const examData of examsData.data) {
        try {
          const resultsResponse = await fetch(
            `/api/results?exam_id=${examData.id}&student_id=${studentId}`
          );

          if (resultsResponse.ok) {
            const resultsData = await resultsResponse.json();
            if (resultsData.data !== null) {
              // Los resultados ya vienen con best_attempt y last_attempt del examen específico
              // Necesitamos extraer los intentos individuales
              const examResults = resultsData.data;

              // Agregar both attempts to our collection with additional info
              if (examResults.best_attempt) {
                allResults.push({
                  ...examResults.best_attempt,
                  exam_name: examData.name_exam || "Examen",
                  exam_id: examData.id,
                  student_name: examResults.student_name,
                });
              }

              // Only add last_attempt if it's different from best_attempt
              if (
                examResults.last_attempt &&
                examResults.last_attempt.attempt_date !==
                  examResults.best_attempt?.attempt_date
              ) {
                allResults.push({
                  ...examResults.last_attempt,
                  exam_name: examData.name_exam || "Examen",
                  exam_id: examData.id,
                  student_name: examResults.student_name,
                });
              }
            }
          }
        } catch {
          // Continúa con el siguiente examen
        }
      }

      if (allResults.length > 0) {
        // Ordenar todos los resultados por fecha
        allResults.sort(
          (a, b) =>
            new Date(a.attempt_date).getTime() -
            new Date(b.attempt_date).getTime()
        );

        // Encontrar el mejor intento (mayor puntaje) de todos los exámenes
        const bestAttempt = allResults.reduce((best, current) =>
          current.score > best.score ? current : best
        );

        // El último intento es el más reciente
        const lastAttempt = allResults[allResults.length - 1];

        // Construir el objeto en el formato que espera el modal original
        const consolidatedResults = {
          best_attempt: bestAttempt,
          last_attempt: lastAttempt,
          student_name: allResults[0].student_name,
          total_attempts: allResults.length,
        };

        setExamDetails(consolidatedResults);
        setIsModalOpen(true);

        // Actualizamos el estado del examen a "completed" si no lo estaba ya
        setExam((prev) =>
          prev ? { ...prev, status: "completed" as ExamStatus } : prev
        );
      } else {
        alert(
          "No se encontraron resultados. Asegúrate de haber completado el examen primero."
        );
      }
    } catch {
      alert(
        "Error de conexión. Verifica tu conexión a internet e intenta nuevamente."
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Exámenes de Certificación
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Presenta tus exámenes oficiales de certificación para obtener tu
          credencial
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-500">Cargando examen...</p>
        </div>
      ) : !exam ? (
        <div className="text-center py-20">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Lightbulb className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay exámenes disponibles
          </h3>
          <p className="text-gray-500">
            Contacta con tu administrador para obtener acceso a exámenes
          </p>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            {(() => {
              const config = statusConfig[exam.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={exam.id}
                  className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${config.borderColor} overflow-hidden transform hover:-translate-y-2`}
                >
                  {/* Header con gradiente más grande */}
                  <div
                    className={`${config.bgColor} px-8 py-6 border-b ${config.borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-white rounded-xl shadow-md`}>
                          <Lightbulb className={`w-8 h-8 ${config.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-xl group-hover:text-blue-600 transition-colors">
                            {exam.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Examen Oficial de Certificación
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-medium ${config.badgeColor} flex items-center gap-2`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </div>
                  </div>

                  {/* Contenido más espacioso */}
                  <div className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium">
                            Examen oficial de certificación
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600">
                        <BarChart3 className="w-5 h-5" />
                        <span className="font-medium">
                          Resultado final para certificación
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Información del Examen:
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Examen cronometrado</li>
                          <li>• Una sola oportunidad por intento</li>
                          <li>• Resultado inmediato</li>
                          <li>• Certificado oficial al aprobar</li>
                          <li>• Se selecciona aleatoriamente al iniciar</li>
                          {voucherStatusSlug && !isVoucherInFinalState() && (
                            <li className="font-medium text-blue-600">
                              • Intentos restantes:{" "}
                              {getRemainingAttempts(voucherStatusSlug)}
                            </li>
                          )}
                          {voucherStatusSlug === "sin-presentar" && (
                            <li className="font-medium text-green-600">
                              • Este es tu primer intento
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Botones de acción más grandes */}
                    <div className="mt-8 space-y-4">
                      {/* Mensaje de estado del voucher */}
                      {isVoucherFailed() && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                            <div>
                              <p className="font-semibold text-red-800">
                                Examen Perdido
                              </p>
                              <p className="text-sm text-red-600">
                                Has agotado todos tus intentos disponibles. No
                                puedes volver a tomar este examen.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {isVoucherApproved() && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mr-3" />
                            <div>
                              <p className="font-semibold text-green-800">
                                Examen Aprobado
                              </p>
                              <p className="text-sm text-green-600">
                                ¡Felicitaciones! Has aprobado este examen.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        className={`w-full font-bold text-lg py-4 shadow-lg transition-all duration-200 group border-0 rounded-xl ${
                          isVoucherInFinalState()
                            ? "bg-gray-400 cursor-not-allowed text-gray-600"
                            : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl"
                        }`}
                        onClick={handleStartExam}
                        disabled={isVoucherInFinalState()}
                      >
                        <Play
                          className={`w-5 h-5 mr-3 transition-transform ${
                            isVoucherInFinalState()
                              ? ""
                              : "group-hover:translate-x-1"
                          }`}
                        />
                        {isVoucherFailed()
                          ? "Examen Perdido"
                          : isVoucherApproved()
                          ? "Examen Aprobado"
                          : exam.status === "completed"
                          ? "Repetir Examen"
                          : "Iniciar Examen"}
                      </Button>

                      <Button
                        variant={
                          exam.status === "completed" || isVoucherInFinalState()
                            ? "default"
                            : "outline"
                        }
                        className={`w-full border-2 group transition-all duration-200 font-bold text-lg py-4 rounded-xl ${
                          exam.status === "completed" || isVoucherInFinalState()
                            ? isVoucherApproved()
                              ? "bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 shadow-lg hover:shadow-xl"
                              : isVoucherFailed()
                              ? "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-lg hover:shadow-xl"
                              : "bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 shadow-lg hover:shadow-xl"
                            : "hover:bg-gray-50 text-gray-400 border-gray-300 cursor-not-allowed"
                        }`}
                        onClick={handleViewResults}
                        disabled={
                          exam.status === "not_started" &&
                          !isVoucherInFinalState()
                        }
                      >
                        <BarChart3
                          className={`w-5 h-5 mr-3 transition-transform ${
                            exam.status === "completed" ||
                            isVoucherInFinalState()
                              ? "group-hover:scale-110"
                              : ""
                          }`}
                        />
                        {isVoucherApproved()
                          ? "Ver Resultado: Aprobado"
                          : isVoucherFailed()
                          ? "Ver Resultado: Perdido"
                          : exam.status === "completed"
                          ? "Ver Resultados"
                          : "Sin Resultados"}
                      </Button>
                    </div>
                  </div>

                  {/* Efecto de brillo en hover más sutil */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal de calificación */}
      {isModalOpen && examDetails && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          examDetails={examDetails}
        />
      )}
    </div>
  );
}
