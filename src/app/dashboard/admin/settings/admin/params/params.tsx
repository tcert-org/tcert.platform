"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Settings, DollarSign, Hash, Clock, Save } from "lucide-react";

type ParamRecord = {
  id: number;
  name: string;
  value: number;
};

function ParamsPage() {
  const [params, setParams] = useState<ParamRecord[]>([]);
  const [formData, setFormData] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchParams = async () => {
      try {
        setInitialLoading(true);
        const res = await fetch("/api/params");
        const json = await res.json();
        const values = json.data;

        const data: Record<number, number> = {};
        values.forEach((item: ParamRecord) => {
          data[item.id] = item.value;
        });

        setParams(values);
        setFormData(data);
      } catch (error: any) {
        console.error("Error al cargar parámetros:", error);
        toast.error(
          `❌ Error al cargar parámetros del sistema: ${
            error.message || "Error desconocido"
          }`,
          {
            position: "top-center",
            theme: "colored",
            autoClose: 5000,
          }
        );
      } finally {
        setInitialLoading(false);
      }
    };

    fetchParams();
  }, []);

  const handleChange = (id: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const getParamIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("precio") || lowerName.includes("price")) {
      return <DollarSign className="h-4 w-4" />;
    }
    if (
      lowerName.includes("tiempo") ||
      lowerName.includes("días") ||
      lowerName.includes("mes")
    ) {
      return <Clock className="h-4 w-4" />;
    }
    return <Hash className="h-4 w-4" />;
  };

  const getParamDescription = (name: string) => {
    const lowerName = name.toLowerCase();

    // Expiración de voucher
    if (
      lowerName.includes("expiración") &&
      lowerName.includes("voucher") &&
      !lowerName.includes("estudiante")
    ) {
      return "Establece en (meses) el período de vigencia del voucher contado desde la fecha de compra.";
    }

    // Expiración de membresía
    if (lowerName.includes("expiración") && lowerName.includes("membresía")) {
      return "Tiempo en (meses) en el cual las membresías deben renovarse.";
    }

    // Tiempo de extensión
    if (lowerName.includes("tiempo") && lowerName.includes("extensión")) {
      return "Periodo restante en (meses) en el cual estará disponible la extensión del voucher.";
    }

    // Precio de extensión
    if (lowerName.includes("precio") && lowerName.includes("extensión")) {
      return "Valor del voucher en (USD) para extenderlo antes de su vencimiento.";
    }

    // Porcentaje de examen
    if (lowerName.includes("porcentaje") && lowerName.includes("examen")) {
      return "Define el porcentaje (%) mínimo requerido para aprobar simuladores y exámenes.";
    }

    // Expiración de voucher de estudiante
    if (
      lowerName.includes("expiración") &&
      lowerName.includes("voucher") &&
      lowerName.includes("estudiante")
    ) {
      return "Tiempo en (meses) que tendrá el estudiante para utilizar su voucher antes de su vencimiento.";
    }

    // Valor de Certificacion a estudiantes
    if (
      lowerName.includes("valor") &&
      lowerName.includes("certificación") &&
      lowerName.includes("estudiante")
    ) {
      return "Valor en (USD) que se le cobrará al estudiante por la certificación.";
    }
    // Porcentaje de descuento a estudiantes

    if (
      lowerName.includes("porcentaje") &&
      lowerName.includes("descuento") &&
      lowerName.includes("estudiantes")
    ) {
      return "Define el porcentaje (%) de descuento aplicado a los estudiantes.";
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Cargando parámetros...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Toast informativo al inicio del proceso
    toast.info("🔄 Guardando parámetros del sistema...", {
      position: "top-center",
      theme: "colored",
      autoClose: 2000,
    });

    try {
      for (const id in formData) {
        const response = await fetch("/api/params", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: Number(id),
            value: formData[Number(id)],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Error al guardar parámetro ${id}`
          );
        }
      }

      toast.success("✅ ¡Éxito! Parámetros guardados correctamente", {
        position: "top-center",
        theme: "colored",
        autoClose: 3000,
      });
    } catch (error: any) {
      console.error("Error al guardar parámetros:", error);
      toast.error(
        `❌ Error al guardar parámetros: ${
          error.message || "Error desconocido"
        }`,
        {
          position: "top-center",
          theme: "colored",
          autoClose: 5000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ToastContainer />

      <div className="max-w-6xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b border-gray-200">
            <CardTitle className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              Parámetros del Sistema
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Configura los valores principales que controlan el comportamiento
              del sistema
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {params.map((param) => (
                  <Card
                    key={param.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          {getParamIcon(param.name)}
                          <Label className="text-sm font-semibold text-gray-800">
                            {param.name}
                          </Label>
                        </div>

                        <Input
                          type="number"
                          min={
                            param.name.toLowerCase().includes("precio")
                              ? 0
                              : param.name.toLowerCase().includes("porcentaje") && param.name.toLowerCase().includes("descuento") && param.name.toLowerCase().includes("estudiantes")
                                ? 0
                                : 1
                          }
                          step={
                            param.name.toLowerCase().includes("precio")
                              ? 0.01
                              : 1
                          }
                          value={formData[param.id] ?? ""}
                          onChange={(e) =>
                            handleChange(param.id, e.target.value)
                          }
                          className="w-full"
                          required
                        />

                        <p className="text-xs text-gray-500 mt-1">
                          {getParamDescription(param.name)}
                        </p>

                        {formData[param.id] && (
                          <div className="text-xs text-blue-600 font-medium">
                            Valor actual: {formData[param.id]}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Guardando parámetros...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ParamsPage;
