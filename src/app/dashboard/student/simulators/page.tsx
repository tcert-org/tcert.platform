"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

type SimulatorStatus = "completed" | "in_progress" | "not_started";

type SimulatorCard = {
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
  const [simulators, setSimulators] = useState<SimulatorCard[]>([]);
  const [loading, setLoading] = useState(true);
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

        const res = await fetch(
          `/api/students/simulator?voucher_id=${voucherId}`
        );
        const result = await res.json();

        if (!res.ok || !Array.isArray(result.data)) {
          setSimulators([]);
        } else {
          const mapped = result.data.map((exam: any) => ({
            id: exam.id,
            name: exam.name_exam || "Sin nombre",
            status: "not_started" as SimulatorStatus,
          }));
          setSimulators(mapped);
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

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">
        Tus Simuladores
      </h1>

      {loading ? (
        <div className="text-center text-lg text-gray-500 py-16">
          Cargando simuladores...
        </div>
      ) : simulators.length === 0 ? (
        <div className="text-center text-lg text-gray-500 py-16">
          No tienes simuladores disponibles.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {simulators.map((sim) => (
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
                <Button
                  className="w-full"
                  onClick={() => handleStartSimulator(sim.id)}
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
