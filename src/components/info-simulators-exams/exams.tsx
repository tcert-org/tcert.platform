"use client";
import React, { useEffect, useState } from "react";

interface Exam {
  id: number;
  name_exam: string;
}

function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const voucherId = localStorage.getItem("voucher_id");
        if (!voucherId) {
          throw new Error("No se encontró el voucher_id");
        }

        const res = await fetch(`/api/students/exam?voucher_id=${voucherId}`);
        const data = await res.json();
        setExams(data || []);
      } catch (error) {
        console.error("Error al cargar exámenes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) return <p className="text-center py-8">Cargando exámenes...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">Exámenes asignados</h1>
      {exams.length === 0 ? (
        <p className="text-center text-gray-500">No hay exámenes disponibles.</p>
      ) : (
        <ul className="space-y-3">
          {exams.map((exam) => (
            <li
              key={exam.id}
              className="p-4 border rounded-md shadow-sm hover:shadow transition bg-gray-50"
            >
              {exam.name_exam}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Exams;
