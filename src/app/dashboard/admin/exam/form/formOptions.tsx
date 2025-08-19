"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type OptionData = {
  content: string;
  is_correct: boolean;
};

type AllOptionsFormData = {
  options: OptionData[];
};

export default function FormOptions({ questionId }: { questionId: number }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AllOptionsFormData>({
    defaultValues: {
      options: [
        { content: "", is_correct: false },
        { content: "", is_correct: false },
        { content: "", is_correct: false },
        { content: "", is_correct: false },
      ],
    },
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);

  const watchedOptions = watch("options");

  // Submit todas las opciones de una vez
  const onSubmit = async (data: AllOptionsFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Filtrar solo las opciones que tienen contenido
    const validOptions = data.options.filter((option) => option.content.trim());

    // Validar que al menos una opción tenga contenido
    if (validOptions.length === 0) {
      setErrorMessage("Debe completar al menos una opción");
      return;
    }

    // Validar que al menos una opción sea correcta (solo entre las que tienen contenido)
    const hasCorrectOption = validOptions.some((option) => option.is_correct);
    if (!hasCorrectOption) {
      setErrorMessage("Debe marcar al menos una opción como correcta");
      return;
    }

    try {
      // Enviar solo las opciones que tienen contenido
      for (let i = 0; i < validOptions.length; i++) {
        const option = validOptions[i];
        const dataToSend = {
          question_id: Number(questionId),
          content: option.content.trim(),
          is_correct: option.is_correct,
          active: true,
        };

        const res = await fetch("/api/exam/question/elections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });

        const result = await res.json();
        if (!res.ok || result.error) {
          setErrorMessage(
            `Error en opción ${i + 1}: ${
              result.error || "No se pudo crear la opción"
            }`
          );
          return;
        }
      }

      setSuccessMessage(
        `${validOptions.length} opciones creadas correctamente`
      );
      setShowForm(false);
    } catch (e: any) {
      setErrorMessage(e.message || "Error desconocido");
    }
  };

  // Banner para mostrar las opciones creadas
  function BannerOpcionesCreadas() {
    return (
      <div className="w-full flex justify-center mb-6">
        <div className="w-full max-w-4xl mx-auto bg-green-50 border border-green-300 px-6 py-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block bg-green-500 text-white px-3 py-1 rounded font-semibold text-sm">
              ✓ Opciones Creadas
            </span>
            <span className="text-green-700 text-sm font-semibold">
              Las opciones se crearon correctamente
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {watchedOptions
              .filter((option) => option.content.trim()) // Solo mostrar opciones con contenido
              .map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white p-3 rounded border"
                >
                  <span className="text-sm text-gray-600 font-medium">
                    {index + 1}.
                  </span>
                  <span
                    className={`inline-block rounded font-bold text-xs px-2 py-1 ${
                      option.is_correct
                        ? "bg-green-500 text-white"
                        : "bg-gray-400 text-white"
                    }`}
                  >
                    {option.is_correct ? "Correcta" : "Incorrecta"}
                  </span>
                  <span className="text-sm text-gray-800 flex-1 truncate">
                    {option.content}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Banner de opciones creadas */}
      {!showForm && successMessage && <BannerOpcionesCreadas />}

      {/* Formulario de opciones */}
      {showForm && (
        <Card className="w-full border-gray-300 shadow-md">
          <CardContent className="p-6">
            <CardTitle className="text-xl font-bold mb-6 text-gray-800">
              Opciones de la Pregunta
            </CardTitle>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="space-y-3">
                    <Label
                      htmlFor={`option-${index}`}
                      className="text-sm font-semibold text-gray-700"
                    >
                      Opción {index + 1}
                    </Label>
                    <div className="space-y-2">
                      <Input
                        id={`option-${index}`}
                        type="text"
                        {...register(`options.${index}.content`)} // Removida la validación required
                        placeholder={`Ingrese la opción ${
                          index + 1
                        } (opcional)`}
                        className="w-full"
                      />
                      {errors.options?.[index]?.content && (
                        <p className="text-red-500 text-xs">
                          {errors.options[index]?.content?.message}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <input
                          id={`correct-${index}`}
                          type="checkbox"
                          {...register(`options.${index}.is_correct`)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label
                          htmlFor={`correct-${index}`}
                          className="text-sm text-gray-600 cursor-pointer"
                        >
                          Esta es la respuesta correcta
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mensajes de error y éxito */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-300 rounded text-green-700 text-sm">
                  {successMessage}
                </div>
              )}

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Instrucciones:</strong>
                </p>
                <ul className="text-blue-700 text-sm mt-2 list-disc list-inside space-y-1">
                  <li>
                    Complete al menos una opción (las demás son opcionales)
                  </li>
                  <li>Marque al menos una opción como correcta</li>
                  <li>
                    Puede marcar múltiples opciones como correctas si es
                    necesario
                  </li>
                  <li>Solo se crearán las opciones que tengan contenido</li>
                </ul>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    reset({
                      options: [
                        { content: "", is_correct: false },
                        { content: "", is_correct: false },
                        { content: "", is_correct: false },
                        { content: "", is_correct: false },
                      ],
                    })
                  }
                  disabled={isSubmitting}
                >
                  Limpiar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Creando..." : "Crear Opciones"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
