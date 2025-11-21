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
  Upload,
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
    page_url: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string>("");

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
          page_url: data.page_url || "",
        });
        setCurrentLogoUrl(data.logo_url || "");
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

      let logoUrl = currentLogoUrl; // Mantener la URL actual por defecto

      // Subir logo si se seleccionó un archivo nuevo
      if (logoFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("logo", logoFile);

        const uploadRes = await fetch("/api/upload-logo", {
          method: "POST",
          body: formDataUpload,
        });

        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadResult.error || "Error al subir logo");
        }

        // Guardar la URL completa del blob
        logoUrl = uploadResult.url;
      }

      const response = await fetch(`/api/partners/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          logo_url: logoUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar perfil");
      }

      toast.success("Perfil actualizado exitosamente");

      // Actualizar los datos locales
      setPartnerData({ ...partnerData!, ...formData, logo_url: logoUrl });
      setCurrentLogoUrl(logoUrl);
      setLogoFile(null); // Limpiar el archivo seleccionado
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

      {/* Logo del Partner */}
      <div className="space-y-2">
        <Label htmlFor="logo_file" className="text-purple-700 font-medium">
          Logo del Partner (Opcional)
        </Label>

        {/* Mostrar logo actual si existe */}
        {currentLogoUrl && (
          <div className="mb-3">
            <p className="text-sm text-purple-600 mb-2">Logo actual:</p>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentLogoUrl}
                alt="Logo actual"
                className="w-12 h-12 object-contain rounded-md border border-purple-200"
              />
              <span className="text-sm text-purple-700">
                {currentLogoUrl.split("/").pop()}
              </span>
            </div>
          </div>
        )}

        <div className="relative group">
          <Upload className="absolute left-3 top-3 w-4 h-4 text-purple-500 group-focus-within:text-orange-500 transition-colors duration-300" />
          <Input
            id="logo_file"
            type="file"
            accept=".png,.jpg,.jpeg,.svg,.webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setLogoFile(file);
                toast.info(`Logo seleccionado: ${file.name}`);
              }
            }}
            className="pl-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 py-2 h-auto file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-100 file:to-violet-100 file:text-purple-700 hover:file:from-purple-200 hover:file:to-violet-200 file:cursor-pointer cursor-pointer"
            disabled={saving}
          />
        </div>
        <p className="text-xs text-gray-600">
          Formatos soportados: PNG, JPG, JPEG, SVG, WebP
        </p>

        {/* Mostrar archivo seleccionado */}
        {logoFile && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              ✅ Nuevo logo seleccionado:{" "}
              <span className="font-medium">{logoFile.name}</span>
            </p>
          </div>
        )}
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
                page_url: partnerData.page_url || "",
              });
              setCurrentLogoUrl(partnerData.logo_url || "");
              setLogoFile(null);
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
