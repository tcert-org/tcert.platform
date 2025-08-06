"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FormVFOptions({ questionId }: { questionId: number }) {
  const [selected, setSelected] = useState<"true" | "false" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [lastVFOption, setLastVFOption] = useState<{
    content: string;
    selected: "true" | "false";
  } | null>(null);

  const handleSelect = (value: "true" | "false") => {
    setSelected(value);
    setErrorMessage(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selected) {
      setErrorMessage("Debes seleccionar la opción correcta");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/exam/question/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questionId,
          content: selected === "true" ? "Verdadero" : "Falso",
          is_correct: true,
          active: true,
        }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        setErrorMessage(result.error || "No se pudo crear la opción");
        setIsSubmitting(false);
        return;
      }
      setLastVFOption({
        content: selected === "true" ? "Verdadero" : "Falso",
        selected,
      });
      setShowForm(false); // Oculta el form, muestra banner
      setSelected(null);
    } catch (e: any) {
      setErrorMessage(e.message || "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  function BannerVFOptionCreada({
    content,
    selected,
  }: {
    content: string;
    selected: "true" | "false";
  }) {
    return (
      <div className="w-full flex items-center justify-center mb-4">
        <div className="w-full max-w-2xl mx-auto bg-gray-100 border border-gray-300 px-6 py-3 rounded-lg flex items-center gap-3 shadow-none">
          <span
            className={`inline-block rounded font-bold text-xs uppercase tracking-wide px-4 py-1
              ${
                selected === "true"
                  ? "bg-green-200 text-green-900 border-green-300"
                  : "bg-red-200 text-red-900 border-red-300"
              }`}
          >
            {content}
          </span>
          <span className="ml-3 text-gray-500 text-xs">
            Respuesta guardada correctamente
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Banner alineado horizontalmente */}
      {!showForm && lastVFOption && (
        <BannerVFOptionCreada
          content={lastVFOption.content}
          selected={lastVFOption.selected}
        />
      )}
      {showForm && (
        <div className="w-full max-w-2xl mx-auto mb-4">
          <Card className="w-full rounded-2xl shadow-2xl p-8 bg-card">
            <CardContent>
              <CardTitle className="mb-4 text-center">
                Seleccione la opción correcta
              </CardTitle>
              <form className="flex flex-col gap-8" onSubmit={onSubmit}>
                <div className="flex gap-8 justify-center">
                  <Button
                    type="button"
                    onClick={() => handleSelect("true")}
                    className={`
                      px-8 py-4 text-lg font-bold rounded-xl transition border-2
                      ${
                        selected === "true"
                          ? "bg-green-200 text-green-900 border-green-400 shadow"
                          : "bg-white text-green-700 border-green-200 hover:bg-green-50"
                      }
                    `}
                  >
                    Verdadero
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSelect("false")}
                    className={`
                      px-8 py-4 text-lg font-bold rounded-xl transition border-2
                      ${
                        selected === "false"
                          ? "bg-red-200 text-red-900 border-red-400 shadow"
                          : "bg-white text-red-700 border-red-200 hover:bg-red-50"
                      }
                    `}
                  >
                    Falso
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="w-full mt-6 py-4 text-lg"
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
