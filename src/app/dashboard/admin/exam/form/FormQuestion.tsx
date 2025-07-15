"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import FormOptions from "./formOptions";
import FormVFOptions from "./FormVOption";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type OptionType = { value: string; label: string };

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
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormData>({
    defaultValues: {
      exam_id: examId,
      type_question: "1",
      active: "activo", // Por defecto y oculto
    },
  });

  const [typeQuestions, setTypeQuestions] = useState<OptionType[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<number | null>(null);
  const [lastQuestionContent, setLastQuestionContent] = useState<string>("");
  const [showQuestionForm, setShowQuestionForm] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [lastTypeQuestion, setLastTypeQuestion] = useState<string>("1"); // Guarda tipo usado

  useEffect(() => {
    fetch("/api/type_question")
      .then((r) => r.json())
      .then((d) => {
        const options = (d.data || []).map((t: any) => ({
          value: t.id.toString(),
          label: t.type_option,
        }));
        setTypeQuestions(options);
      });
  }, []);

  useEffect(() => {
    setValue("exam_id", examId);
  }, [examId, setValue]);

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
      setLastTypeQuestion(data.type_question); // Guarda el tipo creado
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

  // Determinar si la última pregunta creada es Verdadero/Falso
  function isVerdaderoFalso() {
    return lastTypeQuestion === "3";
  }

  return (
    <div className="flex flex-col items-center w-full">
      <ToastContainer position="top-center" theme="colored" />
      {showQuestionForm && (
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl shadow-2xl p-8 bg-card">
            {/* Número de pregunta dentro del formulario */}
            <div className="mb-3 font-semibold text-sm text-right">
              Pregunta {questionNumber}
            </div>
            <div className="font-semibold text-xl mb-4">Crear pregunta</div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
              autoComplete="off"
            >
              <input
                type="hidden"
                {...register("exam_id", { valueAsNumber: true })}
              />
              {/* Campo oculto para activo */}
              <input
                type="hidden"
                {...register("active")}
                value="activo"
                readOnly
              />

              <div>
                <Label>Tipo de Pregunta</Label>
                <Controller
                  control={control}
                  name="type_question"
                  rules={{ required: "Seleccione el tipo de pregunta" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="type_question">
                        <SelectValue placeholder="Selecciona el tipo de pregunta" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeQuestions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type_question && (
                  <span className="text-red-500 text-xs">
                    {errors.type_question.message}
                  </span>
                )}
              </div>

              <div>
                <Label htmlFor="content">Contenido</Label>
                <Input
                  id="content"
                  {...register("content", { required: "Campo obligatorio" })}
                  placeholder="Escriba la pregunta aquí"
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

      {/* MINI-CARD y botón al lado, con mismo layout de examen */}
      {questionId && !showQuestionForm && (
        <div className="w-full flex items-center justify-center gap-4 mb-5">
          <div className="w-full max-w-2xl mx-auto bg-blue-100 border border-blue-300 px-6 py-3 rounded-lg flex items-center gap-3 shadow-none">
            {/* Número de pregunta en el banner */}
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
          {/* Botón alineado igual que "Terminado" */}
          <Button
            className="h-10 px-6 text-base font-semibold bg-blue-700 text-white hover:bg-blue-800 transition"
            onClick={handleNuevaPregunta}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Formulario de opciones dinámico */}
      {questionId &&
        !showQuestionForm &&
        (isVerdaderoFalso() ? (
          <FormVFOptions questionId={questionId} />
        ) : (
          <FormOptions questionId={questionId} />
        ))}
    </div>
  );
}
