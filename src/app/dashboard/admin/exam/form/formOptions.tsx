"use client";

import { useForm, Controller } from "react-hook-form";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type OptionFormData = {
  question_id: number;
  content: string;
  is_correct: string;
  active: string;
};

const correctOptions = [
  { value: "true", label: "Correcta" },
  { value: "false", label: "Incorrecta" },
];

export default function FormOptions({ questionId }: { questionId: number }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OptionFormData>({
    defaultValues: {
      question_id: questionId,
      content: "",
      is_correct: "",
      active: "activo",
    },
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastOption, setLastOption] = useState<{
    content: string;
    is_correct: string;
    optionNumber: number;
  } | null>(null);

  const [showForm, setShowForm] = useState(true);
  const [optionNumber, setOptionNumber] = useState(1);

  // Submit y muestra solo el banner
  const onSubmit = async (data: OptionFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const dataToSend = {
        ...data,
        question_id: Number(questionId),
        is_correct: data.is_correct === "true",
        active: data.active === "activo",
      };
      const res = await fetch("/api/exam/question/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        setErrorMessage(result.error || "No se pudo crear la opción");
        return;
      }
      setSuccessMessage("Opción creada correctamente");
      setLastOption({
        content: data.content,
        is_correct: data.is_correct,
        optionNumber: optionNumber,
      });
      setShowForm(false); // Oculta el form
      reset({
        question_id: questionId,
        content: "",
        is_correct: "",
        active: "activo",
      });
    } catch (e: any) {
      setErrorMessage(e.message || "Error desconocido");
    }
  };

  // Banner para mostrar la última opción creada (idéntico a pregunta/examen)
  function BannerOpcionCreada({
    content,
    is_correct,
    optionNumber,
    onNuevaOpcion,
  }: {
    content: string;
    is_correct: string;
    optionNumber: number;
    onNuevaOpcion: () => void;
  }) {
    const isCorrecta = is_correct === "true";
    return (
      <div className="w-full flex items-center justify-center gap-4 mb-4 ">
        <div className="w-full max-w-2xl mx-auto bg-gray-100 border border-gray-300 px-6 py-3 rounded-lg flex items-center gap-3 shadow-none">
          {/* Número de opción */}
          <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded font-semibold text-xs uppercase tracking-wide mr-3">
            Opción {optionNumber}
          </span>
          <span
            className={`inline-block rounded font-bold text-xs uppercase tracking-wide mr-3 px-4 py-1
              ${
                isCorrecta
                  ? "bg-green-500 text-white"
                  : "bg-yellow-400 text-yellow-900"
              }`}
          >
            {isCorrecta ? "Correcta" : "Incorrecta"}
          </span>
          <span className="font-bold text-base text-gray-800 flex-1 truncate">
            {content}
          </span>
          <span className="text-green-700 text-xs ml-4 font-semibold">
            Opción creada correctamente
          </span>
        </div>
        <Button
          className="h-10 px-6 text-base font-semibold bg-gray-700 text-white hover:bg-gray-800 transition"
          onClick={() => {
            setShowForm(true);
            setOptionNumber((prev) => prev + 1);
            setSuccessMessage(null);
          }}
          type="button"
        >
          Siguiente
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Banner y botón alineados horizontalmente */}
      {!showForm && lastOption && (
        <BannerOpcionCreada
          content={lastOption.content}
          is_correct={lastOption.is_correct}
          optionNumber={lastOption.optionNumber}
          onNuevaOpcion={() => {
            setShowForm(true);
            setOptionNumber((prev) => prev + 1);
            setSuccessMessage(null);
          }}
        />
      )}
      {showForm && (
        <div className="w-full max-w-2xl mx-auto mb-4">
          <Card className="w-full rounded-2xl shadow-2xl p-8 bg-card">
            <CardContent>
              {/* Número de opción arriba del form */}
              <div className="mb-2 text-right  font-semibold text-sm">
                Opción {optionNumber}
              </div>
              <CardTitle className="mb-4">Agregar opción</CardTitle>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
                autoComplete="off"
              >
                <input
                  type="hidden"
                  {...register("question_id", { valueAsNumber: true })}
                />
                <div>
                  <Label htmlFor="content">Opción</Label>
                  <Input
                    id="content"
                    {...register("content", { required: "Campo obligatorio" })}
                    placeholder="Texto de la opción"
                    autoComplete="off"
                  />
                  {errors.content && (
                    <span className="text-red-500 text-xs">
                      {errors.content.message}
                    </span>
                  )}
                </div>
                <div>
                  <Label>¿Es correcta?</Label>
                  <Controller
                    control={control}
                    name="is_correct"
                    rules={{ required: "Seleccione si es correcta" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full p-2 rounded border border-gray-300"
                      >
                        <option value="">Selecciona una opción</option>
                        {correctOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.is_correct && (
                    <span className="text-red-500 text-xs">
                      {errors.is_correct.message}
                    </span>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
                {errorMessage && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm text-center mt-2">
                    <strong className="font-bold">Error:</strong> {errorMessage}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
