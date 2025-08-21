"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  RefreshCw,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const DESCRIPTION_MAX = 600;

  const [certifications, setCertifications] = useState<EditingCertification[]>(
    []
  );
  const [editFiles, setEditFiles] = useState<
    Record<number, { logoFile?: File; materialFile?: File }>
  >({});
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Refs para auto-resize
  const descRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const autoResize = (id: number) => {
    const el = descRefs.current[id];
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 320);
    el.style.height = next + "px";
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
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  const toggleEdit = useCallback((id: number) => {
    setCertifications((prev) =>
      prev.map((cert) =>
        cert.id === id
          ? {
              ...cert,
              isEditing: !cert.isEditing,
              ...(cert.isEditing ? cert.originalData : {}),
            }
          : cert
      )
    );
    setError(null);
    setSuccess(null);
    requestAnimationFrame(() => autoResize(id));
  }, []);

  const updateField = useCallback(
    (id: number, field: keyof Certification, value: any) => {
      setCertifications((prev) =>
        prev.map((cert) =>
          cert.id === id ? { ...cert, [field]: value } : cert
        )
      );
      if (field === "description") requestAnimationFrame(() => autoResize(id));
    },
    []
  );

  const updateEditFile = (
    id: number,
    type: "logoFile" | "materialFile",
    file?: File
  ) => {
    setEditFiles((prev) => ({ ...prev, [id]: { ...prev[id], [type]: file } }));
  };

  const saveChanges = useCallback(
    async (id: number) => {
      const certification = certifications.find((cert) => cert.id === id);
      if (!certification) return;

      setSaving(id);
      setError(null);
      setSuccess(null);

      try {
        let logo_url = certification.logo_url;
        let study_material_url = certification.study_material_url;

        const files = editFiles[id] || {};

        if (files.logoFile) {
          const formData = new FormData();
          formData.append("logo", files.logoFile);
          const uploadRes = await fetch("/api/upload-certification-logo", {
            method: "POST",
            body: formData,
          });
          const uploadResult = await uploadRes.json();
          if (!uploadRes.ok)
            throw new Error(uploadResult.error || "Error al subir logo");
          logo_url = uploadResult.filename;
        }

        if (files.materialFile) {
          const formData = new FormData();
          formData.append("material", files.materialFile);
          const uploadRes = await fetch("/api/upload-material", {
            method: "POST",
            body: formData,
          });
          const uploadResult = await uploadRes.json();
          if (!uploadRes.ok)
            throw new Error(uploadResult.error || "Error al subir material");
          study_material_url = uploadResult.filename;
        }

        const response = await fetch(`/api/certifications/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: certification.name,
            description:
              certification.description?.slice(0, DESCRIPTION_MAX) || "",
            active: certification.active,
            logo_url,
            study_material_url,
          }),
        });

        if (!response.ok) throw new Error("Error al guardar cambios");

        setCertifications((prev) =>
          prev.map((cert) =>
            cert.id === id
              ? {
                  ...cert,
                  isEditing: false,
                  logo_url,
                  study_material_url,
                  originalData: {
                    id: cert.id,
                    name: cert.name,
                    description: cert.description,
                    logo_url,
                    study_material_url,
                    active: cert.active,
                  },
                }
              : cert
          )
        );

        setEditFiles((p) => ({ ...p, [id]: {} }));
        setSuccess("Certificación actualizada exitosamente");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError("Error al guardar los cambios");
        console.error(err);
      } finally {
        setSaving(null);
      }
    },
    [certifications, editFiles]
  );

  const toggleActive = async (id: number) => {
    const certification = certifications.find((cert) => cert.id === id);
    if (!certification || certification.isEditing) return;

    setSaving(id);
    const newActiveState = certification.active !== true;

    try {
      const response = await fetch(`/api/certifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  if (loading && initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <div className="mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-2xl shadow-lg mx-auto flex items-center justify-center">
              <Loader2 className="animate-spin w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-purple-800/90">
            Cargando Certificaciones
          </h2>
          <p className="text-purple-700/70 font-medium text-sm md:text-base">
            Obteniendo la información más reciente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30">
      <div className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-purple-200/40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <div className="p-3 md:p-4 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-2xl shadow-md">
                <Settings className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-purple-900 truncate">
                  Gestión de Certificaciones
                </h1>
                <p className="text-purple-700/80 text-sm md:text-base truncate">
                  Edita nombre, archivos, descripción y estado
                </p>
              </div>
            </div>
            <div className="flex w-full sm:w-auto gap-2">
              <Button
                onClick={fetchCertifications}
                disabled={loading}
                variant="outline"
                className="w-full sm:w-auto min-w-[140px] border-purple-300 text-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Actualizando
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Actualizar
                  </>
                )}
              </Button>
              <Link
                href="/dashboard/admin/certification-management/create"
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto min-w-[140px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                  Crear
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
            <XCircle className="w-5 h-5" />{" "}
            <span className="font-medium">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800">
            <CheckCircle className="w-5 h-5" />{" "}
            <span className="font-medium">{success}</span>
          </div>
        )}

        <div
          className={
            loading ? "opacity-60 transition-opacity" : "transition-opacity"
          }
          aria-busy={loading}
        >
          <div className="space-y-6">
            {certifications.map((cert) => {
              const descCount = cert.description?.length || 0;
              const remaining = Math.max(0, DESCRIPTION_MAX - descCount);

              return (
                <div
                  key={cert.id}
                  className="bg-white border border-purple-200/80 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 items-start">
                    {/* Main content */}
                    <div className="lg:col-span-10 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 md:p-3 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 rounded-xl shadow-md">
                          <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {cert.isEditing ? (
                            <Input
                              value={cert.name}
                              onChange={(e) =>
                                updateField(cert.id, "name", e.target.value)
                              }
                              placeholder="Nombre de la certificación"
                              className="font-semibold"
                            />
                          ) : (
                            <h3 className="text-xl md:text-2xl font-bold text-purple-900 break-words">
                              {cert.name}
                            </h3>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Descripción - ocupa 2/3 en md+ */}
                        <div className="md:col-span-2">
                          {cert.isEditing ? (
                            <div>
                              <div className="flex items-end justify-between gap-3 mb-1">
                                <Label className="text-purple-700 font-medium">
                                  Descripción *
                                </Label>
                                <div className="text-xs tabular-nums text-purple-600/80">
                                  {descCount}/{DESCRIPTION_MAX}
                                </div>
                              </div>
                              <div className="rounded-xl border border-purple-200 bg-white focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500">
                                <textarea
                                  ref={(el) => {
                                    descRefs.current[cert.id] = el;
                                  }}
                                  value={cert.description}
                                  onChange={(e) =>
                                    updateField(
                                      cert.id,
                                      "description",
                                      e.target.value.slice(0, DESCRIPTION_MAX)
                                    )
                                  }
                                  onInput={() => autoResize(cert.id)}
                                  placeholder="Describe el objetivo, alcance y público de la certificación."
                                  className="w-full min-h-[120px] max-h-[320px] px-3 py-3 rounded-xl outline-none resize-none leading-relaxed"
                                />
                              </div>
                              <div className="mt-1.5 flex items-center justify-between text-xs text-slate-600">
                                <span>Sugerencia: usa 2–4 frases claras.</span>
                                <span
                                  className={
                                    remaining <= 40 ? "text-amber-600" : ""
                                  }
                                >
                                  Te quedan {remaining} caracteres
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-3 md:p-4">
                              <p className="text-gray-700 leading-relaxed text-sm md:text-base break-words">
                                {cert.description}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Files + status (lado derecho compacto) */}
                        <div className="space-y-4">
                          {cert.isEditing && (
                            <>
                              <div className="space-y-3">
                                <Label className="text-purple-700 font-medium">
                                  Logo (archivo)
                                </Label>
                                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-200 bg-white cursor-pointer text-sm shadow-sm">
                                  <ImageIcon className="w-4 h-4 text-purple-500" />
                                  <span className="truncate">
                                    {(editFiles[cert.id]?.logoFile &&
                                      editFiles[cert.id]!.logoFile!.name) ||
                                      "Seleccionar logo"}
                                  </span>
                                  <input
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.svg,.webp"
                                    className="hidden"
                                    onChange={(e) =>
                                      updateEditFile(
                                        cert.id,
                                        "logoFile",
                                        e.target.files?.[0]
                                      )
                                    }
                                  />
                                </label>
                                <p className="text-xs text-gray-600">
                                  PNG, JPG, JPEG, SVG, WebP
                                </p>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-purple-700 font-medium">
                                  Material (archivo)
                                </Label>
                                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-200 bg-white cursor-pointer text-sm shadow-sm">
                                  <FileText className="w-4 h-4 text-purple-500" />
                                  <span className="truncate">
                                    {(editFiles[cert.id]?.materialFile &&
                                      editFiles[cert.id]!.materialFile!.name) ||
                                      "Seleccionar material"}
                                  </span>
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
                                    className="hidden"
                                    onChange={(e) =>
                                      updateEditFile(
                                        cert.id,
                                        "materialFile",
                                        e.target.files?.[0]
                                      )
                                    }
                                  />
                                </label>
                                <p className="text-xs text-gray-600">
                                  PDF, DOC, PPT, PNG, JPG, JPEG, WebP
                                </p>
                              </div>
                            </>
                          )}

                          {/* Estado */}
                          <div>
                            <Label className="text-purple-700 font-medium">
                              Estado
                            </Label>
                            {cert.isEditing ? (
                              <select
                                value={cert.active === true ? "true" : "false"}
                                onChange={(e) =>
                                  updateField(
                                    cert.id,
                                    "active",
                                    e.target.value === "true"
                                  )
                                }
                                className="mt-2 px-3 md:px-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white/90 shadow-sm font-medium w-full text-sm"
                              >
                                <option value="true">Activa</option>
                                <option value="false">Inactiva</option>
                              </select>
                            ) : (
                              <button
                                onClick={() => toggleActive(cert.id)}
                                disabled={saving === cert.id}
                                className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all shadow-sm w-full ${
                                  cert.active === true
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                    : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                                }`}
                              >
                                {saving === cert.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : cert.active === true ? (
                                  <ToggleRight className="w-4 h-4" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4" />
                                )}
                                <span className="truncate">
                                  {cert.active === true ? "Activa" : "Inactiva"}
                                </span>
                              </button>
                            )}

                            {/* Visual de archivos vigentes (solo lectura) */}
                            {!cert.isEditing && (
                              <div className="mt-3 flex flex-col gap-2">
                                {cert.logo_url && (
                                  <span className="inline-flex items-center gap-2 text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 truncate">
                                    <ImageIcon className="w-3.5 h-3.5" />{" "}
                                    <span className="truncate max-w-[220px]">
                                      {cert.logo_url}
                                    </span>
                                  </span>
                                )}
                                {cert.study_material_url && (
                                  <span className="inline-flex items-center gap-2 text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 truncate">
                                    <FileText className="w-3.5 h-3.5" />{" "}
                                    <span className="truncate max-w-[220px]">
                                      {cert.study_material_url}
                                    </span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="lg:col-span-2 flex flex-row lg:flex-col gap-2 md:gap-3 w-auto lg:w-auto items-center lg:items-start justify-end">
                      {cert.isEditing ? (
                        <>
                          <Button
                            onClick={() => saveChanges(cert.id)}
                            disabled={saving === cert.id}
                            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm hover:from-green-600 hover:to-emerald-700"
                          >
                            {saving === cert.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Guardar</span>
                          </Button>

                          <Button
                            onClick={() => toggleEdit(cert.id)}
                            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-red-50 border border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400"
                          >
                            <X className="w-4 h-4" />{" "}
                            <span className="hidden sm:inline">Cancelar</span>
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => toggleEdit(cert.id)}
                          className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 text-white shadow-sm hover:opacity-95"
                        >
                          <Edit className="w-4 h-4" />{" "}
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
}
