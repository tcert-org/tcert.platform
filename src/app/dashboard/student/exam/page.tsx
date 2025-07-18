"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import Link from "next/link";

type SimulatorStatus = "completed" | "in_progress" | "not_started";

type ExamCard = {
  id: number;
  name: string;
  status: SimulatorStatus;
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

export default function StudentSimulatorsPage() {
  const [exams, setExams] = useState<ExamCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimulators() {
      setLoading(true);

      try {
        // ✅ Obtener voucher_id desde la cookie de sesión del estudiante
        const session = JSON.parse(
          sessionStorage.getItem("student-data") || "{}"
        );
        const voucherId = session?.state?.decryptedStudent?.voucher_id;

        if (!voucherId) {
          console.warn("voucher_id no disponible en la sesión");
          setExams([]);
          setLoading(false);
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
            status: "not_started" as SimulatorStatus,
          }));
          setExams(mapped);
        }
      } catch (err) {
        console.error("Error al obtener simuladores:", err);
        setExams([]);
      }

      setLoading(false);
    }

    fetchSimulators();
  }, []);

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
          {exams.map((sim) => (
            <div
              key={sim.id}
              className="flex flex-col justify-between bg-white shadow-md border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all min-h-[12rem]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className={`w-6 h-6 ${statusColor[sim.status]}`} />
                <div>
                  <div className="text-sm sm:text-base text-[#213763] font-bold">
                    {sim.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Estado:{" "}
                    <span className={statusColor[sim.status]}>
                      {statusLabel[sim.status]}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <Link
                  href={`/dashboard/student/exam/form?simulatorId=${sim.id}`}
                >
                  <Button className="w-full">Ir</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
