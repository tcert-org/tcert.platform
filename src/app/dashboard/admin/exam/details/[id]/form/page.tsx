"use client";

import { useParams, useRouter } from "next/navigation";
import FormQuestion from "@/app/dashboard/admin/exam/form/FormQuestion";

export default function CreateQuestionPage() {
  const params = useParams();
  const examId = Number(params.id); // Extrae el id del examen
  const router = useRouter();

  const handleDone = () => {
    // Regresa a la vista de preguntas de ese examen
    router.push(`/dashboard/admin/exam/details/${examId}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <FormQuestion examId={examId} />
      <div className="flex justify-end mt-8">
        <button
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded transition"
          onClick={handleDone}
        >
          Terminado
        </button>
      </div>
    </div>
  );
}
