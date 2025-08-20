"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Edit,
  Save,
  X,
  Loader2,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface Certification {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  study_material_url?: string;
  active: boolean | null;
}

interface EditingCertification extends Certification {
  isEditing: boolean;
  originalData: Certification;
}

export default function CertificationManagementPage() {
  const router = useRouter();
  const [certifications, setCertifications] = useState<EditingCertification[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado para el formulario de creación
  const [newCert, setNewCert] = useState({
    name: "",
    description: "",
    logo_url: "",
    study_material_url: "",
    active: true,
  });
  const [creating, setCreating] = useState(false);
  // Crear nueva certificación
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);
    try {
      const response = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCert),
      });
      if (!response.ok) throw new Error("Error al crear la certificación");
      setSuccess("Certificación creada exitosamente");
      setNewCert({
        name: "",
        description: "",
        logo_url: "",
        study_material_url: "",
        active: true,
      });
      fetchCertifications();
    } catch (err) {
      setError("Error al crear la certificación");
    } finally {
      setCreating(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const fetchCertifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/certifications");
      if (!response.ok) throw new Error("Error al cargar certificaciones");

      const data = await response.json();
      const certificationsWithEdit = data.data.map((cert: Certification) => ({
        ...cert,
        isEditing: false,
        originalData: { ...cert },
      }));

      setCertifications(certificationsWithEdit);
    } catch (err) {
      setError("Error al cargar las certificaciones");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar certificaciones
  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]); // Activar/desactivar modo edición
  const toggleEdit = useCallback((id: number) => {
    setCertifications((prev) =>
      prev.map((cert) =>
        cert.id === id
          ? {
              ...cert,
              isEditing: !cert.isEditing,
              // Si cancela, restaurar datos originales
              ...(cert.isEditing ? cert.originalData : {}),
            }
          : cert
      )
    );
    setError(null);
    setSuccess(null);
  }, []);

  // Actualizar campo específico
  const updateField = useCallback(
    (id: number, field: keyof Certification, value: any) => {
      setCertifications((prev) =>
        prev.map((cert) =>
          cert.id === id ? { ...cert, [field]: value } : cert
        )
      );
    },
    []
  );

  // Guardar cambios
  const saveChanges = useCallback(
    async (id: number) => {
      const certification = certifications.find((cert) => cert.id === id);
      if (!certification) return;

      setSaving(id);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch(`/api/certifications/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: certification.name,
            description: certification.description,
            active: certification.active,
          }),
        });

        if (!response.ok) throw new Error("Error al guardar cambios");

        // Actualizar estado local
        setCertifications((prev) =>
          prev.map((cert) =>
            cert.id === id
              ? {
                  ...cert,
                  isEditing: false,
                  originalData: {
                    id: cert.id,
                    name: cert.name,
                    description: cert.description,
                    logo_url: cert.logo_url,
                    active: cert.active,
                  },
                }
              : cert
          )
        );

        setSuccess("Certificación actualizada exitosamente");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError("Error al guardar los cambios");
        console.error(err);
      } finally {
        setSaving(null);
      }
    },
    [certifications]
  );

  // Toggle activo/inactivo rápido
  const toggleActive = async (id: number) => {
    const certification = certifications.find((cert) => cert.id === id);
    if (!certification || certification.isEditing) return;

    setSaving(id);
    // Simplificar a solo dos estados: si es null o false → true, si es true → false
    const newActiveState = certification.active !== true;

    try {
      const response = await fetch(`/api/certifications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: certification.name,
          description: certification.description,
          active: newActiveState,
        }),
      });

      if (!response.ok) throw new Error("Error al cambiar estado");

      setCertifications((prev) =>
        prev.map((cert) =>
          cert.id === id
            ? {
                ...cert,
                active: newActiveState,
                originalData: { ...cert.originalData, active: newActiveState },
              }
            : cert
        )
      );

      setSuccess(
        `Certificación ${
          newActiveState ? "activada" : "desactivada"
        } exitosamente`
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error al cambiar el estado");
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 flex justify-center items-center relative overflow-hidden">
        {/* Elementos decorativos optimizados */}
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-purple-100/30 to-violet-200/20 rounded-full blur-2xl transform translate-x-32 md:translate-x-48 -translate-y-32 md:-translate-y-48 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 md:w-80 md:h-80 bg-gradient-to-tr from-orange-100/25 to-amber-200/20 rounded-full blur-2xl transform -translate-x-28 md:-translate-x-40 translate-y-28 md:translate-y-40 opacity-60"></div>

        <div className="text-center relative z-10 px-4">
          <div className="relative mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-2xl shadow-lg shadow-purple-500/25 mx-auto flex items-center justify-center">
              <Loader2 className="animate-spin w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full animate-pulse shadow-md mx-auto"></div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent mb-2">
            Cargando Certificaciones
          </h2>
          <p className="text-purple-600/80 font-medium text-sm md:text-base">
            Obteniendo la información más reciente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Elemento decorativo de fondo optimizado */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/8 via-violet-600/4 to-indigo-600/8 rounded-2xl blur-lg opacity-60"></div>

            <div className="relative flex items-center gap-3 md:gap-4">
              <div className="relative flex-shrink-0">
                <div className="p-3 md:p-4 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-2xl shadow-lg shadow-purple-500/25">
                  <Settings className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full animate-pulse shadow-md"></div>
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent break-words">
                  Gestión de Certificaciones
                </h1>
                <p className="text-purple-600/80 font-medium mt-1 text-sm md:text-base">
                  Administra nombre, descripción y estado de las certificaciones
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={fetchCertifications}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-violet-800 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none font-semibold text-sm md:text-base w-full sm:w-auto justify-center flex-shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 md:w-5 h-4 md:h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 md:w-5 h-4 md:h-5" />
                )}
                Actualizar
              </button>
            </div>
          </div>

          <Link href={"/dashboard/admin/certification-management/create"}>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 font-semibold text-sm md:text-base w-full sm:w-auto justify-center"
            >
              Crear
            </button>
          </Link>
          {/* Alertas */}
          {error && (
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-600/10 rounded-xl blur-sm"></div>
              <div className="relative p-4 bg-gradient-to-r from-red-50/90 via-rose-50/80 to-red-50/90 border-2 border-red-200/50 rounded-xl flex items-center gap-3 text-red-800 backdrop-blur-sm shadow-sm">
                <div className="p-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg shadow-sm">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-xl blur-sm"></div>
              <div className="relative p-4 bg-gradient-to-r from-green-50/90 via-emerald-50/80 to-green-50/90 border-2 border-green-200/50 rounded-xl flex items-center gap-3 text-green-800 backdrop-blur-sm shadow-sm">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-sm">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{success}</span>
              </div>
            </div>
          )}
        </div>

        {/* Lista de certificaciones */}
        <div className="space-y-6">
          {certifications.map((cert, index) => (
            <div
              key={cert.id}
              className="group bg-white border-2 border-purple-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 hover:-translate-y-0.5 will-change-transform"
            >
              <div className="p-6 md:p-8 relative overflow-hidden">
                {/* Elemento decorativo sutil */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-purple-100/40 to-violet-100/30 rounded-full blur-sm opacity-60"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Información de certificación */}
                  <div className="flex-1 space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="p-2.5 md:p-3 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-xl shadow-lg shadow-purple-500/25 transition-shadow duration-200">
                          <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        {cert.isEditing ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={cert.name}
                              onChange={(e) =>
                                updateField(cert.id, "name", e.target.value)
                              }
                              className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200 bg-white/90 shadow-sm text-base md:text-lg font-semibold"
                              placeholder="Nombre de la certificación"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full animate-pulse"></div>
                          </div>
                        ) : (
                          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-800 via-violet-700 to-purple-900 bg-clip-text text-transparent break-words">
                            {cert.name}
                          </h3>
                        )}
                      </div>
                    </div>

                    <div className="ml-0 md:ml-16">
                      {cert.isEditing ? (
                        <div className="relative">
                          <textarea
                            value={cert.description}
                            onChange={(e) =>
                              updateField(
                                cert.id,
                                "description",
                                e.target.value
                              )
                            }
                            rows={3}
                            className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200 bg-white/90 shadow-sm resize-none"
                            placeholder="Descripción de la certificación"
                          />
                          <div className="absolute right-3 bottom-3 w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full animate-pulse"></div>
                        </div>
                      ) : (
                        <div className="bg-purple-50/50 border-2 border-purple-200 rounded-xl p-3 md:p-4 shadow-sm">
                          <p className="text-gray-700 font-semibold leading-relaxed text-sm md:text-base break-words">
                            {cert.description}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-0 md:ml-16 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <span className="text-sm font-semibold text-purple-700 bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full w-fit">
                        Estado:
                      </span>
                      {cert.isEditing ? (
                        <select
                          value={cert.active === true ? "true" : "false"}
                          onChange={(e) => {
                            const value = e.target.value === "true";
                            updateField(cert.id, "active", value);
                          }}
                          className="px-3 md:px-4 py-2 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors duration-200 bg-white/90 shadow-sm font-medium w-fit"
                        >
                          <option value="true">Activa</option>
                          <option value="false">Inactiva</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => toggleActive(cert.id)}
                          disabled={saving === cert.id}
                          className={`inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] w-fit ${
                            cert.active === true
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-green-200"
                              : "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-red-200"
                          }`}
                        >
                          {saving === cert.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : cert.active === true ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                          {cert.active === true ? "Activa" : "Inactiva"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-row lg:flex-col gap-2 md:gap-3 lg:w-auto w-full lg:justify-start justify-end">
                    {cert.isEditing ? (
                      <>
                        <button
                          onClick={() => saveChanges(cert.id)}
                          disabled={saving === cert.id}
                          className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none font-semibold text-sm md:text-base flex-1 lg:flex-initial justify-center"
                        >
                          {saving === cert.id ? (
                            <Loader2 className="w-4 md:w-5 h-4 md:h-5 animate-spin" />
                          ) : (
                            <Save className="w-4 md:w-5 h-4 md:h-5" />
                          )}
                          <span className="hidden sm:inline">Guardar</span>
                        </button>
                        <button
                          onClick={() => toggleEdit(cert.id)}
                          className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-500 via-slate-600 to-gray-700 text-white rounded-xl hover:from-gray-600 hover:to-slate-800 transition-all duration-200 shadow-lg shadow-gray-500/25 hover:shadow-gray-500/40 transform hover:scale-[1.02] font-semibold text-sm md:text-base flex-1 lg:flex-initial justify-center"
                        >
                          <X className="w-4 md:w-5 h-4 md:h-5" />
                          <span className="hidden sm:inline">Cancelar</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => toggleEdit(cert.id)}
                        className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-violet-800 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-[1.02] font-semibold text-sm md:text-base w-full lg:w-auto justify-center"
                      >
                        <Edit className="w-4 md:w-5 h-4 md:h-5" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {certifications.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay certificaciones disponibles
            </h3>
            <p className="text-gray-600">
              No se encontraron certificaciones para gestionar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
