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
} from "lucide-react";
import { Modal } from "@/modules/tools/ModalScore"; // Modal de calificación

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
                            <Button
                              onClick={() =>
                                handleViewResults("simulator", simulator.id)
                              }
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Ver Resultados
                            </Button>
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
                            <Button
                              onClick={() => handleViewResults("exam", exam.id)}
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Ver Resultados
                            </Button>
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

        {/* Modal de calificación */}
        {isModalOpen && examDetails && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            examDetails={examDetails}
          />
        )}
      </div>
    </div>
  );
}
