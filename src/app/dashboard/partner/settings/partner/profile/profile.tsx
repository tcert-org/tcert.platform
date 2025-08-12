"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Save,
  Building2,
  Phone,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useUserStore } from "@/stores/user-store";

interface PartnerData {
  id: number;
  company_name: string;
  email: string;
  contact_number: string;
  logo_url?: string;
  page_url?: string;
}

export default function ProfileForm() {
  const { getUser } = useUserStore();

  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_number: "",
    logo_url: "",
    page_url: "",
  });

  // Cargar datos del partner autenticado
  useEffect(() => {
    async function fetchPartnerData() {
      try {
        const user = await getUser();
        if (!user?.id) {
          toast.error("No se pudo obtener la información del usuario");
          return;
        }

        const response = await fetch(`/api/partners/${user.id}`);
        if (!response.ok) throw new Error("Error al cargar datos");

        const data = await response.json();
        setPartnerData(data);
        setFormData({
          company_name: data.company_name || "",
          contact_number: data.contact_number || "",
          logo_url: data.logo_url || "",
          page_url: data.page_url || "",
        });
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error al cargar los datos del perfil");
      } finally {
        setLoading(false);
      }
    }

    fetchPartnerData();
  }, [getUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const user = await getUser();
      if (!user?.id) {
        throw new Error("No se pudo obtener la información del usuario");
      }

      const response = await fetch(`/api/partners/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar perfil");
      }

      toast.success("Perfil actualizado exitosamente");

      // Actualizar los datos locales
      setPartnerData({ ...partnerData!, ...formData });
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar el perfil"
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
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin h-6 w-6 text-purple-600" />
          <div className="text-purple-700 font-medium">
            Cargando información del perfil...
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre de la empresa */}
      <div className="space-y-2">
        <Label htmlFor="company_name" className="text-purple-700 font-medium">
          Nombre de la Empresa *
        </Label>
        <div className="relative group">
          <Building2 className="absolute left-3 top-3 w-4 h-4 text-purple-500 group-focus-within:text-orange-500 transition-colors duration-300" />
          <Input
            id="company_name"
            type="text"
            value={formData.company_name}
            onChange={(e) => handleInputChange("company_name", e.target.value)}
            placeholder="Ingrese el nombre de la empresa"
            className="pl-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
            required
            disabled={saving}
          />
        </div>
      </div>

      {/* Contacto */}
      <div className="space-y-2">
        <Label htmlFor="contact_number" className="text-purple-700 font-medium">
          Número de Contacto *
        </Label>
        <div className="relative group">
          <Phone className="absolute left-3 top-3 w-4 h-4 text-purple-500 group-focus-within:text-orange-500 transition-colors duration-300" />
          <Input
            id="contact_number"
            type="tel"
            value={formData.contact_number}
            onChange={(e) =>
              handleInputChange("contact_number", e.target.value)
            }
            placeholder="300 123 4567"
            className="pl-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
            required
            disabled={saving}
          />
        </div>
      </div>

      {/* URL del Logo */}
      <div className="space-y-2">
        <Label htmlFor="logo_url" className="text-purple-700 font-medium">
          URL del Logo (Opcional)
        </Label>
        <div className="relative group">
          <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-purple-500 group-focus-within:text-orange-500 transition-colors duration-300" />
          <Input
            id="logo_url"
            type="url"
            value={formData.logo_url}
            onChange={(e) => handleInputChange("logo_url", e.target.value)}
            placeholder="https://ejemplo.com/logo.png"
            className="pl-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
            disabled={saving}
          />
        </div>
      </div>

      {/* URL de la Página Web */}
      <div className="space-y-2">
        <Label htmlFor="page_url" className="text-purple-700 font-medium">
          URL de la Página Web (Opcional)
        </Label>
        <div className="relative group">
          <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-purple-500 group-focus-within:text-orange-500 transition-colors duration-300" />
          <Input
            id="page_url"
            type="url"
            value={formData.page_url}
            onChange={(e) => handleInputChange("page_url", e.target.value)}
            placeholder="https://ejemplo.com"
            className="pl-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
            disabled={saving}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-6">
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-600/40 border border-orange-400/20 transition-all duration-300 transform hover:scale-105 font-medium"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Cambios
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (partnerData) {
              setFormData({
                company_name: partnerData.company_name || "",
                contact_number: partnerData.contact_number || "",
                logo_url: partnerData.logo_url || "",
                page_url: partnerData.page_url || "",
              });
              toast.info("Cambios descartados");
            }
          }}
          disabled={saving}
          className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 font-medium"
        >
          Descartar Cambios
        </Button>
      </div>
    </form>
  );
}
