"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import Link from "next/link";

type SimulatorStatus = "completed" | "in_progress" | "not_started";

type SimulatorCard = {
  id: number;
  name: string;
  certification: string;
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

export default function StudentExamPage() {
  const [simulators, setSimulators] = useState<SimulatorCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimulators() {
      setLoading(true);
      try {
        const res = await fetch("/api/exam");
        const data = await res.json();

        // Filtra solo examenes usando el campo booleano
        const simulatorsOnly = Array.isArray(data)
          ? data.filter((exam: any) => exam.simulator === true)
          : [];

        // Mapea a tu estructura visual, esperando mostrar el nombre del examen
        const mapped = simulatorsOnly.map((exam: any) => ({
          id: exam.id,
          name: exam.name_exam,
          certification: exam.certification_name || "Sin certificar",
          status: "not_started" as SimulatorStatus,
        }));

        setSimulators(mapped);
      } catch (err) {
        setSimulators([]);
      }
      setLoading(false);
    }
    fetchSimulators();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">
        Tus Examenes
      </h1>
      {loading ? (
        <div className="text-center text-lg text-gray-500 py-16">
          Cargando Examenes...
        </div>
      ) : simulators.length === 0 ? (
        <div className="text-center text-lg text-gray-500 py-16">
          No tienes examenes disponibles.
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
                  <div className="text-xs sm:text-sm text-[#4b607b] font-semibold">
                    Certificación: {sim.certification}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">
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
