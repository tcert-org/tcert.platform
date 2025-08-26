"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import FormOptions from "./formOptions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type QuestionFormData = {
  exam_id: number;
  type_question: string;
  content: string;
  active: string;
};

export default function FormQuestion({ examId }: { examId: number }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormData>({
    defaultValues: {
      exam_id: examId,
      type_question: "1", // Solo tipo "Única"
      active: "activo",
    },
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<number | null>(null);
  const [lastQuestionContent, setLastQuestionContent] = useState<string>("");
  const [showQuestionForm, setShowQuestionForm] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(1);

  const onSubmit = async (data: QuestionFormData) => {
    setErrorMessage(null);
    try {
      const dataToSend = {
        ...data,
        exam_id: Number(data.exam_id),
        type_question: Number(data.type_question),
        active: data.active === "activo",
      };
      const res = await fetch("/api/exam/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        setErrorMessage(result.error || "No se pudo crear la pregunta");
        return;
      }
      setQuestionId(result.data?.id);
      setLastQuestionContent(data.content);
      setShowQuestionForm(false);
      toast.success("Pregunta creada correctamente");
    } catch (e: any) {
      setErrorMessage(e.message || "Error desconocido");
    }
  };

  const handleNuevaPregunta = () => {
    setShowQuestionForm(true);
    setQuestionId(null);
    setLastQuestionContent("");
    setQuestionNumber((prev) => prev + 1);
    reset({ exam_id: examId, type_question: "1", active: "activo" });
  };

  return (
    <div className="flex flex-col items-center w-full">
      <ToastContainer position="top-center" theme="colored" />
      {showQuestionForm && (
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl shadow-2xl p-8 bg-card">
            <div className="mb-3 font-semibold text-sm text-right">
              Pregunta {questionNumber}
            </div>
            <div className="font-semibold text-xl mb-4">Crear pregunta</div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
              autoComplete="off"
            >
              {/* Campos ocultos */}
              <input
                type="hidden"
                {...register("exam_id", { valueAsNumber: true })}
              />
              <input
                type="hidden"
                {...register("type_question")}
                value="1"
                readOnly
              />
              <input
                type="hidden"
                {...register("active")}
                value="activo"
                readOnly
              />

              <div>
                <Label htmlFor="content">Contenido</Label>
                <textarea
                  id="content"
                  {...register("content", { required: "Campo obligatorio" })}
                  placeholder="Escriba la pregunta aquí"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y"
                />
                {errors.content && (
                  <span className="text-red-500 text-xs">
                    {errors.content.message}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm text-center mt-2">
                  <strong className="font-bold">Error:</strong> {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {questionId && !showQuestionForm && (
        <div className="w-full flex items-center justify-center gap-4 mb-5">
          <div className="w-full max-w-2xl mx-auto bg-blue-100 border border-blue-300 px-6 py-3 rounded-lg flex items-center gap-3 shadow-none">
            <span className="inline-block bg-blue-200 text-blue-700 px-2 py-1 rounded font-semibold text-xs uppercase tracking-wide mr-3">
              Pregunta {questionNumber}
            </span>
            <span className="font-bold text-base text-gray-800 flex-1 truncate">
              {lastQuestionContent}
            </span>
            <span className="text-gray-400 text-xs ml-auto">
              ID: {questionId}
            </span>
          </div>
          <Button
            className="h-10 px-6 text-base font-semibold bg-blue-700 text-white hover:bg-blue-800 transition"
            onClick={handleNuevaPregunta}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Opciones (solo tipo única) */}
      {questionId && !showQuestionForm && (
        <FormOptions questionId={questionId} />
      )}
    </div>
  );
}
