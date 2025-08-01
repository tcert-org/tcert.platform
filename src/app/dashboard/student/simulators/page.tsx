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

type SimulatorStatus = "completed" | "not_started";

type SimulatorCard = {
  id: number;
  name: string;
  status: SimulatorStatus;
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

export default function StudentSimulatorsPage() {
  const [simulators, setSimulators] = useState<SimulatorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examDetails, setExamDetails] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSimulators() {
      setLoading(true);

      try {
        const session = JSON.parse(
          sessionStorage.getItem("student-data") || "{}"
        );
        const voucherId = session?.state?.decryptedStudent?.voucher_id;

        if (!voucherId) {
          console.warn("voucher_id no disponible en la sesión");
          setSimulators([]);
          return;
        }

        // Primero obtenemos el student_id
        const studentResponse = await fetch(
          `/api/students/by-voucher?voucher_id=${voucherId}`
        );
        const studentData = await studentResponse.json();

        if (!studentResponse.ok || !studentData?.data?.id) {
          console.warn("No se pudo obtener el ID del estudiante");
          setSimulators([]);
          return;
        }

        const studentId = studentData.data.id;

        // Luego obtenemos los simuladores
        const res = await fetch(
          `/api/students/simulator?voucher_id=${voucherId}`
        );
        const result = await res.json();

        if (!res.ok || !Array.isArray(result.data)) {
          setSimulators([]);
        } else {
          // Para cada simulador, verificamos si tiene calificaciones
          const simulatorsWithStatus = await Promise.all(
            result.data.map(async (exam: any) => {
              try {
                // Verificamos si existen resultados para este simulador
                const resultsResponse = await fetch(
                  `/api/results?exam_id=${exam.id}&student_id=${studentId}`
                );
                const hasResults = resultsResponse.ok;

                return {
                  id: exam.id,
                  name: exam.name_exam || "Sin nombre",
                  status: hasResults
                    ? "completed"
                    : ("not_started" as SimulatorStatus),
                };
              } catch (error) {
                console.error(
                  `Error verificando resultados para simulador ${exam.id}:`,
                  error
                );
                return {
                  id: exam.id,
                  name: exam.name_exam || "Sin nombre",
                  status: "not_started" as SimulatorStatus,
                };
              }
            })
          );

          setSimulators(simulatorsWithStatus);
        }
      } catch (err) {
        console.error("Error al obtener simuladores:", err);
        setSimulators([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSimulators();
  }, []);

  async function handleStartSimulator(simId: number) {
    const session = JSON.parse(sessionStorage.getItem("student-data") || "{}");
    const voucherId = session?.state?.decryptedStudent?.voucher_id;

    if (!voucherId) {
      console.warn("voucher_id no disponible en la sesión", session);
      alert("No se pudo obtener tu voucher.");
      return;
    }

    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_id: simId,
          voucher_id: voucherId,
        }),
      });

      const result = await response.json();
      console.log("Resultado del intento:", result);

      if (!response.ok) {
        alert(result?.error || "Error al crear intento.");
        return;
      }

      // Redirige usando Next.js router
      router.push(`/dashboard/student/simulators/form?simulatorId=${simId}`);
    } catch (err) {
      console.error("Error al crear intento:", err);
      alert("Error inesperado.");
    }
  }

  const handleViewResults = async (simulatorId: number) => {
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

      const studentId = studentData.data.id; // Usamos el student_id obtenido

      console.log("Este es el ID del simulador:", simulatorId);
      console.log("Este es el ID del estudiante:", studentId);

      // Ahora hacemos la solicitud para obtener los resultados del simulador
      const res = await fetch(
        `/api/results?exam_id=${simulatorId}&student_id=${studentId}`
      );

      if (res.ok) {
        const result = await res.json();

        console.log("Data de los resultados del simulador result:", result);
        console.log(
          "Data de los resultados del simulador result.data:",
          result.data
        );

        if (result && result.data) {
          setExamDetails(result.data); // Guardamos los detalles de la calificación
          setIsModalOpen(true); // Abrimos el modal para mostrar los resultados

          // Actualizamos el estado del simulador a "completed" si no lo estaba ya
          setSimulators((prev) =>
            prev.map((sim) =>
              sim.id === simulatorId
                ? { ...sim, status: "completed" as SimulatorStatus }
                : sim
            )
          );
        } else {
          // Si no hay datos en la respuesta
          alert(
            "No se encontraron resultados para este simulador. Asegúrate de haber completado el examen primero."
          );
        }
      } else {
        // Manejar diferentes códigos de estado HTTP
        if (res.status === 404) {
          alert(
            "No has presentado este simulador aún. Completa el examen primero para ver tus resultados."
          );
        } else if (res.status === 403) {
          alert("No tienes permisos para ver estos resultados.");
        } else if (res.status === 500) {
          alert("Error del servidor. Por favor, intenta más tarde.");
        } else {
          alert(
            "No se pudieron obtener los resultados. Por favor, intenta más tarde."
          );
        }
        console.error(
          "Error al obtener los resultados del simulador. Status:",
          res.status
        );
      }
    } catch (err) {
      console.error("Error al obtener los resultados del simulador", err);
      alert(
        "Error de conexión. Verifica tu conexión a internet e intenta nuevamente."
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Simuladores de Examen
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Practica con nuestros simuladores para prepararte mejor para tus
          certificaciones
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-500">Cargando simuladores...</p>
        </div>
      ) : simulators.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Lightbulb className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay simuladores disponibles
          </h3>
          <p className="text-gray-500">
            Contacta con tu administrador para obtener acceso a simuladores
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulators.map((sim) => {
            const config = statusConfig[sim.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={sim.id}
                className={`group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 ${config.borderColor} overflow-hidden transform hover:-translate-y-1`}
              >
                {/* Header con gradiente */}
                <div
                  className={`${config.bgColor} px-6 py-4 border-b ${config.borderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                        <Lightbulb className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                          {sim.name}
                        </h3>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${config.badgeColor} flex items-center gap-1`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Simulador de práctica</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BarChart3 className="w-4 h-4" />
                      <span>Incluye retroalimentación detallada</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="mt-6 space-y-3">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 group"
                      onClick={() => handleStartSimulator(sim.id)}
                    >
                      <Play className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      {sim.status === "completed"
                        ? "Repetir Simulador"
                        : "Iniciar Simulador"}
                    </Button>

                    <Button
                      variant={
                        sim.status === "completed" ? "default" : "outline"
                      }
                      className={`w-full border-2 group transition-all duration-200 ${
                        sim.status === "completed"
                          ? "bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                          : "hover:bg-gray-50 text-gray-400 border-gray-300 cursor-not-allowed"
                      }`}
                      onClick={() => handleViewResults(sim.id)}
                      disabled={sim.status === "not_started"}
                    >
                      <BarChart3
                        className={`w-4 h-4 mr-2 transition-transform ${
                          sim.status === "completed"
                            ? "group-hover:scale-110"
                            : ""
                        }`}
                      />
                      {sim.status === "completed"
                        ? "Ver Resultados"
                        : "Sin Resultados"}
                    </Button>
                  </div>
                </div>

                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            );
          })}
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
