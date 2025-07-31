"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

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
    // Obtener voucher_id desde sessionStorage
    const session = JSON.parse(sessionStorage.getItem("student-data") || "{}");
    const voucherId = session?.state?.decryptedStudent?.voucher_id;

    if (!voucherId) {
      console.warn("voucher_id no disponible en la sesión");
      alert("No se pudo obtener tu voucher.");
      return;
    }

    try {
      // Primero, obtener el estado actual del voucher usando GET
      const voucherRes = await fetch(
        `/api/voucher-state?voucher_id=${voucherId}`,
        {
          method: "GET", // Usamos GET para consultar el estado
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const voucherData = await voucherRes.json();

      // Verificamos si la respuesta tiene status_id
      if (!voucherRes.ok || !voucherData?.data?.status_id) {
        console.error("Error al obtener el estado del voucher", voucherData);
        alert("No se pudo obtener el estado del voucher.");
        return;
      }

      let newStatusId = 0; // Estado por defecto

      // Determinar el estado a asignar según el número de intentos
      if (voucherData.data.status_id === 3) {
        // Si está en "Sin Presentar"
        newStatusId = 6; // Cambiar a "re-take-1"
      } else if (voucherData.data.status_id === 6) {
        // Si está en "re-take-1"
        newStatusId = 7; // Cambiar a "re-take-2"
      } else if (voucherData.data.status_id === 7) {
        // Si está en "re-take-2"
        newStatusId = 4; // Cambiar a "reprobado"
      }

      // Llamamos al API para cambiar el estado del voucher según los intentos
      const res = await fetch("/api/voucher-state", {
        method: "PATCH", // Mantener PATCH para actualizar el estado
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucher_id: voucherId,
          new_status_id: newStatusId, // Cambiar según el flujo
          is_used: false, // Marcamos como no usado en ese momento
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error al actualizar el estado del voucher", error);
        alert("Error al actualizar el estado del voucher");
        return;
      }

      // Llamamos al API para crear un nuevo intento del examen
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

      // Redirige al formulario de examen con el ID del examen
      router.push(`/dashboard/student/exam/form?id=${examId}`);
    } catch (err) {
      console.error("Error al iniciar examen:", err);
      alert("Error inesperado.");
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
