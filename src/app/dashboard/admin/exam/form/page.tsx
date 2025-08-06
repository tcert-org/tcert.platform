"use client";

import { useState } from "react";
import FormExam from "./FormExam";
import FormQuestion from "./FormQuestion";

export default function ExamWithQuestions() {
  const [examId, setExamId] = useState<number | null>(null);

  // Cuando el examen se crea, setea el id
  const handleExamCreated = (id: number) => setExamId(id);

  return (
    <div className="flex flex-col   min-h-[80vh] gap-5 m-20">
      <FormExam onExamCreated={handleExamCreated} />
      {examId && <FormQuestion examId={examId} />}
    </div>
  );
}
