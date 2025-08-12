"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStudentStore } from "@/stores/student-store";
import { useRouter } from "next/navigation";
type StudentFormData = {
  fullname: string;
  document_number: string;
  document_type: string;
};

export default function StudentForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudentFormData>();

  const router = useRouter();
  const token = useStudentStore((state) => state.access_token);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: StudentFormData) => {
    setLoading(true);
    setSuccess(false);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Error al registrar");
        return;
      }
      setSuccess(true);
      reset();

      setTimeout(() => {
        router.push("/sign-in");
      }, 500);
    } catch (error) {
      console.error("Error al registrar estudiante:", error);
      setErrorMessage("Hubo un problema al registrar el estudiante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-8 p-6 md:p-10 overflow-hidden">
      {/* Fondo base ultra oscuro */}
      <div className="absolute inset-0 bg-black" />

      {/* Capa de gradiente animado */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-violet-950/50 animate-pulse"
        style={{ animationDuration: "8s" }}
      />

      {/* Efectos dinámicos */}
      <div className="absolute inset-0">
        {/* Luces principales con movimiento más visible */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-900/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-800/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-700/12 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "4s" }}
        />

        {/* Elementos flotantes más visibles */}
        <div
          className="absolute top-20 left-20 w-2 h-24 bg-gradient-to-b from-violet-400/40 to-transparent rotate-12 animate-pulse transform-gpu"
          style={{ animationDuration: "5s" }}
        />
        <div
          className="absolute top-32 right-32 w-2 h-20 bg-gradient-to-b from-violet-300/35 to-transparent -rotate-12 animate-pulse transform-gpu"
          style={{ animationDuration: "6s", animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-32 left-40 w-24 h-2 bg-gradient-to-r from-violet-400/30 to-transparent animate-pulse transform-gpu"
          style={{ animationDuration: "7s", animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-20 right-20 w-20 h-2 bg-gradient-to-r from-violet-300/25 to-transparent animate-pulse transform-gpu"
          style={{ animationDuration: "8s", animationDelay: "3s" }}
        />

        {/* Partículas más grandes y brillantes */}
        <div
          className="absolute top-1/3 right-10 w-2 h-2 bg-violet-400/50 rounded-full animate-pulse shadow-lg shadow-violet-400/30"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="absolute bottom-1/3 left-10 w-2 h-2 bg-violet-300/45 rounded-full animate-pulse shadow-lg shadow-violet-300/25"
          style={{ animationDuration: "4s", animationDelay: "1s" }}
        />
        <div
          className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-violet-200/60 rounded-full animate-pulse shadow-md shadow-violet-200/40"
          style={{ animationDuration: "5s", animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/4 left-3/4 w-1.5 h-1.5 bg-violet-400/40 rounded-full animate-pulse shadow-md shadow-violet-400/20"
          style={{ animationDuration: "6s", animationDelay: "0.5s" }}
        />
        <div
          className="absolute top-10 right-1/2 w-1 h-1 bg-violet-500/55 rounded-full animate-pulse shadow-sm shadow-violet-500/35"
          style={{ animationDuration: "4s", animationDelay: "2.5s" }}
        />
        <div
          className="absolute bottom-10 left-1/2 w-1 h-1 bg-violet-300/50 rounded-full animate-pulse shadow-sm shadow-violet-300/30"
          style={{ animationDuration: "5s", animationDelay: "1.5s" }}
        />

        {/* Ondas de energía más visibles */}
        <div
          className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-600/30 to-transparent animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent animate-pulse"
          style={{ animationDuration: "8s", animationDelay: "2s" }}
        />
        <div
          className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "4s" }}
        />

        {/* Líneas diagonales dinámicas */}
        <div
          className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-violet-500/15 to-transparent animate-pulse transform rotate-12"
          style={{ animationDuration: "12s" }}
        />
        <div
          className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-violet-400/12 to-transparent animate-pulse transform -rotate-12"
          style={{ animationDuration: "14s", animationDelay: "3s" }}
        />

        {/* Efectos de respiración más perceptibles */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25 animate-pulse"
          style={{ animationDuration: "15s" }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10 animate-pulse"
          style={{ animationDuration: "18s", animationDelay: "5s" }}
        />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex w-full max-w-md flex-col gap-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-xl" />
            <Image
              src="/sm-full-color.png"
              alt="T-cert logo"
              width={90}
              height={90}
              className="relative z-10"
            />
          </div>
        </div>

        {/* Formulario con efecto de vidrio premium */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/12 to-white/6 rounded-2xl blur-md" />
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-800/10 to-orange-700/8 rounded-2xl" />

          <Card className="relative z-10 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl shadow-black/25 rounded-2xl">
            <CardHeader className="text-center space-y-3 pb-6">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-800 via-violet-700 to-violet-900 bg-clip-text text-transparent drop-shadow-sm">
                Registro de Estudiante
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm leading-relaxed">
                Completa los siguientes datos para continuar
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="fullname"
                    className="text-sm font-semibold text-violet-900 flex items-center"
                  >
                    <div className="w-4 h-4 mr-2 text-violet-700">👤</div>
                    Nombre Completo
                  </Label>
                  <div className="relative group">
                    <Input
                      id="fullname"
                      type="text"
                      placeholder="Ingresa tu nombre completo"
                      className={`h-12 text-sm transition-all duration-300 border-2 rounded-xl pl-4 pr-12 border-violet-200 focus:border-violet-950 focus:ring-4 focus:ring-violet-100/50 bg-gradient-to-r from-white to-violet-50/30 hover:to-violet-50/50 shadow-sm focus:shadow-md group-hover:shadow-sm ${
                        errors.fullname &&
                        "border-red-300 focus:border-red-500 focus:ring-red-100/50"
                      }`}
                      {...register("fullname", {
                        required: "El nombre completo es obligatorio",
                      })}
                      disabled={loading}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-orange-400 animate-pulse"></div>
                    </div>
                  </div>
                  {errors.fullname && (
                    <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50/80 p-2 rounded-lg border border-red-200/50 animate-in slide-in-from-top-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="font-medium">
                        {errors.fullname.message}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="document_type"
                    className="text-sm font-semibold text-violet-900 flex items-center"
                  >
                    <div className="w-4 h-4 mr-2 text-violet-700">📄</div>
                    Tipo de Documento
                  </Label>
                  <div className="relative group">
                    <select
                      id="document_type"
                      {...register("document_type", {
                        required: "Selecciona el tipo de documento",
                      })}
                      className={`h-12 text-sm transition-all duration-300 border-2 rounded-xl pl-4 pr-12 w-full border-violet-200 focus:border-violet-950 focus:ring-4 focus:ring-violet-100/50 bg-gradient-to-r from-white to-violet-50/30 hover:to-violet-50/50 shadow-sm focus:shadow-md group-hover:shadow-sm outline-none ${
                        errors.document_type &&
                        "border-red-300 focus:border-red-500 focus:ring-red-100/50"
                      }`}
                      disabled={loading}
                    >
                      <option value="">Selecciona un tipo de documento</option>
                      <option value="DNI">
                        Documento Nacional de Identidad
                      </option>
                      <option value="PAS">Pasaporte</option>
                      <option value="DL">Licencia de Conducir</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-orange-400 animate-pulse"></div>
                    </div>
                  </div>
                  {errors.document_type && (
                    <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50/80 p-2 rounded-lg border border-red-200/50 animate-in slide-in-from-top-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="font-medium">
                        {errors.document_type.message}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="document_number"
                    className="text-sm font-semibold text-violet-900 flex items-center"
                  >
                    <div className="w-4 h-4 mr-2 text-violet-700">🔢</div>
                    Número de Documento
                  </Label>
                  <div className="relative group">
                    <Input
                      id="document_number"
                      type="text"
                      placeholder="Ingresa tu número de documento"
                      className={`h-12 text-sm transition-all duration-300 border-2 rounded-xl pl-4 pr-12 border-violet-200 focus:border-violet-950 focus:ring-4 focus:ring-violet-100/50 bg-gradient-to-r from-white to-violet-50/30 hover:to-violet-50/50 shadow-sm focus:shadow-md group-hover:shadow-sm ${
                        errors.document_number &&
                        "border-red-300 focus:border-red-500 focus:ring-red-100/50"
                      }`}
                      {...register("document_number", {
                        required: "El número de documento es obligatorio",
                      })}
                      disabled={loading}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-orange-400 animate-pulse"></div>
                    </div>
                  </div>
                  {errors.document_number && (
                    <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50/80 p-2 rounded-lg border border-red-200/50 animate-in slide-in-from-top-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="font-medium">
                        {errors.document_number.message}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className={`w-full h-12 text-sm font-semibold rounded-xl relative overflow-hidden group bg-gradient-to-r from-violet-950 to-violet-900 hover:from-violet-900 hover:to-violet-800 shadow-lg shadow-violet-950/25 hover:shadow-xl hover:shadow-violet-950/30 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-violet-800 ${
                    loading && "opacity-80"
                  }`}
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {loading ? (
                    <div className="flex items-center space-x-2 relative z-10">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registrando estudiante...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 relative z-10">
                      <div className="w-4 h-4">👤</div>
                      <span>Registrar Estudiante</span>
                      <div className="w-4 h-4 text-orange-300">✨</div>
                    </div>
                  )}
                </Button>

                {success && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="border-l-4 border-green-400 bg-green-50/80 rounded-r-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                        <p className="text-green-600 text-sm font-medium">
                          ✓ Registro exitoso - Redirigiendo...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="border-l-4 border-red-400 bg-red-50/80 rounded-r-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                        <p className="text-red-600 text-sm font-medium">
                          ✗ {errorMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overlay final para profundidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/15 pointer-events-none" />
    </div>
  );
}
