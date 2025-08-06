"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Partner {
  id: number;
  company_name: string;
  email: string;
}

export default function EditPartnerPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
  });

  // Cargar datos del partner
  useEffect(() => {
    async function fetchPartner() {
      try {
        const response = await fetch(`/api/partners/${partnerId}`);
        if (!response.ok) throw new Error("Error al cargar partner");

        const data = await response.json();
        setPartner(data);
        setFormData({
          company_name: data.company_name || "",
          email: data.email || "",
        });
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error al cargar los datos del partner");
      } finally {
        setLoading(false);
      }
    }

    if (partnerId) {
      fetchPartner();
    }
  }, [partnerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/partners/${partnerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar partner");
      }

      toast.success("Partner actualizado exitosamente");
      setTimeout(() => {
        router.push("/dashboard/admin/partners");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar el partner"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 p-6">
        <ToastContainer position="top-center" theme="colored" />
        <div className="max-w-7xl mx-auto">
          <Card className="transition-all duration-300 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2 rounded-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <div className="text-purple-700 font-medium">
                    Cargando datos del partner...
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 p-6">
        <ToastContainer position="top-center" theme="colored" />
        <div className="max-w-7xl mx-auto">
          <Card className="transition-all duration-300 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2 rounded-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-center py-8">
                <div className="text-red-600 font-medium">
                  Partner no encontrado
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 p-6">
      <ToastContainer position="top-center" theme="colored" />
      <div className="max-w-7xl mx-auto">
        {/* Resto del contenido... */}
        <div className="space-y-6">
          {/* Header del formulario */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-xl shadow-lg shadow-purple-500/30 border border-purple-400/20">
              <svg
                className="h-6 w-6 text-white drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent drop-shadow-sm">
                Editar Partner
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Modifica la información del partner
              </p>
            </div>
          </div>

          {/* Botón de regreso */}
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/admin/partners")}
            className="bg-white/50 hover:bg-white/80 border border-purple-200/50 text-purple-700 hover:text-purple-800 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Partners
          </Button>

          <Card className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2 rounded-xl max-w-4xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent">
                Información del Partner
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {/* Continuación del contenido... */}
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <Label
                    className="text-purple-700 font-semibold text-sm"
                    htmlFor="company_name"
                  >
                    Nombre de la Empresa *
                  </Label>
                  <Input
                    id="company_name"
                    type="text"
                    value={formData.company_name}
                    onChange={(e) =>
                      handleInputChange("company_name", e.target.value)
                    }
                    placeholder="Ingrese el nombre de la empresa"
                    className="border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    className="text-purple-700 font-semibold text-sm"
                    htmlFor="email"
                  >
                    Correo Electrónico *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="correo@empresa.com"
                    className="border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="md:col-span-2 flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-600/40 border border-purple-400/20 transition-all duration-300 transform hover:scale-105"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/admin/partners")}
                    disabled={saving}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300 transition-all duration-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
