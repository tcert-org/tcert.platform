// C:\code\tcert.platform\src\app\dashboard\student\exam\page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { Modal } from "@/modules/tools/ModalScore"; // Modal de calificación

// Tipo de estado de intento
type ExamStatus = "completed" | "in_progress" | "not_started";

// Representación visual del examen
type ExamCard = {
  id: number;
  name: string;
  status: ExamStatus;
};

const statusColor = {
  completed: "text-green-500",
  in_progress: "text-blue-500",
  not_started: "text-red-500",
};

const statusLabel = {
  completed: "Realizado",
  in_progress: "En proceso",
  not_started: "No realizado",
};

export default function StudentExamPage() {
  const [exams, setExams] = useState<ExamCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examDetails, setExamDetails] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchExams() {
      setLoading(true);
      try {
        const session = JSON.parse(
          sessionStorage.getItem("student-data") || "{}"
        );
        const voucherId = session?.state?.decryptedStudent?.voucher_id;

        if (!voucherId) {
          console.warn("voucher_id no disponible en la sesión");
          setExams([]);
          return;
        }

        const res = await fetch(`/api/students/exam?voucher_id=${voucherId}`);
        const result = await res.json();

        if (!res.ok || !Array.isArray(result.data)) {
          setExams([]);
        } else {
          const mapped = result.data.map((exam: any) => ({
            id: exam.id,
            name: exam.name_exam || "Sin nombre",
            status: "not_started" as ExamStatus,
          }));
          setExams(mapped);
        }
      } catch (err) {
        console.error("Error al obtener examen:", err);
        setExams([]);
      } finally {
        setLoading(false);
      }
    }

    fetchExams();
  }, []);

  const handleStartExam = async (examId: number) => {
    const session = JSON.parse(sessionStorage.getItem("student-data") || "{}");
    const voucherId = session?.state?.decryptedStudent?.voucher_id;

    if (!voucherId) {
      console.warn("voucher_id no disponible en la sesión");
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

      if (!voucherRes.ok || !voucherData?.data?.status_id) {
        console.error("Error al obtener el estado del voucher", voucherData);
        alert("No se pudo obtener el estado del voucher.");
        return;
      }

      let newStatusId = 0;

      if (voucherData.data.status_id === 3) {
        newStatusId = 6; // "re-take-1"
      } else if (voucherData.data.status_id === 6) {
        newStatusId = 7; // "re-take-2"
      } else if (voucherData.data.status_id === 7) {
        newStatusId = 4; // "reprobado"
      }

      const res = await fetch("/api/voucher-state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucher_id: voucherId,
          new_status_id: newStatusId,
          is_used: false,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error al actualizar el estado del voucher", error);
        alert("Error al actualizar el estado del voucher");
        return;
      }

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
    } catch (err) {
      console.error("Error al iniciar examen:", err);
      alert("Error inesperado.");
    }
  };

  const handleViewResults = async (examId: number) => {
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

      console.log("Este es el ID del examen:", examId);
      console.log("Este es el ID del estudiante:", studentId);

      // Ahora hacemos la solicitud para obtener los resultados del examen
      const res = await fetch(
        `/api/results?exam_id=${examId}&student_id=${studentId}`
      );
      const result = await res.json();

      console.log("Data de los resultados del examen result:", result);
      console.log(
        "Data de los resultados del examen result.data:",
        result.data
      );
      console.log("Datos de examDatails:", examDetails);
      if (res.ok && result) {
        setExamDetails(result.data); // Guardamos los detalles de la calificación
        setIsModalOpen(true); // Abrimos el modal para mostrar los resultados
      } else {
        console.error("Error al obtener los resultados del examen", result);
        alert("No has presentado este examen aún.");
      }
    } catch (err) {
      console.error("Error al obtener los resultados del examen", err);
      alert("Error inesperado al obtener los resultados");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">
        Tu examen
      </h1>

      {loading ? (
        <div className="text-center text-lg text-gray-500 py-16">
          Cargando examen...
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center text-lg text-gray-500 py-16">
          No tienes examen disponible.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="flex flex-col justify-between bg-white shadow-md border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all min-h-[12rem]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className={`w-6 h-6 ${statusColor[exam.status]}`} />
                <div>
                  <div className="text-sm sm:text-base text-[#213763] font-bold">
                    {exam.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Estado:{" "}
                    <span className={statusColor[exam.status]}>
                      {statusLabel[exam.status]}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <Button
                  className="w-full"
                  onClick={() => handleStartExam(exam.id)}
                >
                  Ir
                </Button>
                <Button
                  className="w-full mt-3"
                  onClick={() => handleViewResults(exam.id)}
                >
                  Ver Calificación
                </Button>
              </div>
            </div>
          ))}
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
