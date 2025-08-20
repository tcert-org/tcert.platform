"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  BookOpen,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateCertificationPage() {
  const router = useRouter();
  const DESCRIPTION_MAX = 600; // <- editable desde un solo lugar
  const [form, setForm] = useState({
    name: "",
    description: "",
    active: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- Auto-resize del textarea + contador de caracteres
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px"; // reset para calcular
    const next = Math.min(el.scrollHeight, 320); // máx 20rem aprox
    el.style.height = next + "px";
  };
  useEffect(() => autoResize(), []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;
    if (type === "file") {
      if (name === "logo_file" && files && files[0]) setLogoFile(files[0]);
      if (name === "material_file" && files && files[0])
        setMaterialFile(files[0]);
      return;
    }
    const nextValue = type === "checkbox" ? checked : value;
    setForm((f) => ({ ...f, [name]: nextValue }));
    if (name === "description") {
      if (typeof nextValue === "string" && nextValue.length > DESCRIPTION_MAX) {
        setForm((f) => ({
          ...f,
          description: nextValue.slice(0, DESCRIPTION_MAX),
        }));
      }
      requestAnimationFrame(autoResize);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);
    try {
      let logoUrl = "";
      let materialUrl = "";

      // Subir logo si hay archivo
      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        const uploadRes = await fetch("/api/upload-certification-logo", {
          method: "POST",
          body: formData,
        });
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadResult.error || "Error al subir logo");
        logoUrl = uploadResult.filename;
      }

      // Subir material si hay archivo
      if (materialFile) {
        const formData = new FormData();
        formData.append("material", materialFile);
        const uploadRes = await fetch("/api/upload-material", {
          method: "POST",
          body: formData,
        });
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadResult.error || "Error al subir material");
        materialUrl = uploadResult.filename;
      }

      const response = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          logo_url: logoUrl,
          study_material_url: materialUrl,
        }),
      });
      if (!response.ok) throw new Error("Error al crear la certificación");
      setSuccess("Certificación creada exitosamente");
      setTimeout(() => router.push("../certification-management"), 900);
    } catch (err) {
      setError("Error al crear la certificación");
    } finally {
      setCreating(false);
    }
  };

  const descCount = form.description.length;
  const remaining = Math.max(0, DESCRIPTION_MAX - descCount);

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl min-h-screen flex flex-col">
      <div className="mb-4">
        <Link
          href="/dashboard/admin/certification-management"
          className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 transition-all duration-300 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Certificaciones
        </Link>
      </div>

      <Card className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 bg-white/80 border border-purple-200/60 shadow-lg backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 text-white">
          <CardTitle className="flex items-center gap-3 text-lg font-bold">
            <div className="p-2 bg-white/15 rounded-lg border border-white/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            Crear Nueva Certificación
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid compacto de 2 columnas en desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-purple-700 font-medium">
                  Nombre de la Certificación *
                </Label>
                <div className="relative group">
                  <BookOpen className="absolute left-3 top-3.5 w-4 h-4 text-purple-500" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Ej: Scrum Master"
                    className="pl-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 bg-white"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Logo */}
              <div className="space-y-2">
                <Label
                  htmlFor="logo_file"
                  className="text-purple-700 font-medium"
                >
                  Logo (archivo) *
                </Label>
                <div className="relative group flex-1">
                  <ImageIcon className="absolute left-3 top-3.5 w-4 h-4 text-purple-500" />
                  <Input
                    type="file"
                    id="logo_file"
                    name="logo_file"
                    accept=".png,.jpg,.jpeg,.svg,.webp"
                    className="pl-10 border-purple-200 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-100 file:to-violet-100 file:text-purple-700 hover:file:from-purple-200 hover:file:to-violet-200 file:cursor-pointer cursor-pointer"
                    onChange={handleChange}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Puedes subir PNG, JPG, JPEG, SVG, WebP
                </p>
              </div>

              {/* Material */}
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="material_file"
                  className="text-purple-700 font-medium"
                >
                  Material de Estudio (archivo) *
                </Label>
                <div className="relative group flex-1">
                  <FileText className="absolute left-3 top-3.5 w-4 h-4 text-purple-500" />
                  <Input
                    type="file"
                    id="material_file"
                    name="material_file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
                    className="pl-10 border-purple-200 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-100 file:to-violet-100 file:text-purple-700 hover:file:from-purple-200 hover:file:to-violet-200 file:cursor-pointer cursor-pointer"
                    onChange={handleChange}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Puedes subir PDF, DOC, PPT, PNG, JPG, JPEG, WebP
                </p>
              </div>
            </div>

            {/* Descripción con mejor distribución */}
            <div className="space-y-2">
              <div className="flex items-end justify-between gap-3">
                <Label
                  htmlFor="description"
                  className="text-purple-700 font-medium"
                >
                  Descripción *
                </Label>
                <div className="text-xs tabular-nums text-purple-600/80">
                  {descCount}/{DESCRIPTION_MAX}
                </div>
              </div>

              <div className="relative">
                {/* Caja contenedora estilizada para un look tipo editor */}
                <div className="rounded-xl border-2 border-purple-200 bg-white focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-colors">
                  <textarea
                    ref={textareaRef}
                    id="description"
                    name="description"
                    required
                    placeholder="Describe brevemente el objetivo, alcance y público de la certificación."
                    className="w-full min-h-[120px] max-h-[320px] px-3 py-3 rounded-xl outline-none resize-none leading-relaxed"
                    value={form.description}
                    onChange={handleChange}
                    onInput={autoResize}
                    maxLength={DESCRIPTION_MAX}
                  />
                </div>

                {/* Ayuda/Guidelines al pie derecho */}
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span>
                    Sugerencia: usa 2–4 frases claras. Evita repetir el nombre.
                  </span>
                  <span className={remaining <= 40 ? "text-amber-600" : ""}>
                    Te quedan {remaining} caracteres
                  </span>
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-2 text-purple-700 font-semibold">
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={form.active}
                onChange={handleChange}
                className="accent-purple-600"
              />
              <Label htmlFor="active">Activa</Label>
            </div>

            {/* Mensajes */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium">
                <XCircle className="w-5 h-5" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
                <CheckCircle className="w-5 h-5" /> {success}
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("../certification-management")}
                disabled={creating}
                className="sm:flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="sm:flex-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Certificación"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
