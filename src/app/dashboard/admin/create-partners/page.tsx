"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Building2,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

const partnerSchema = z.object({
  company_name: z
    .string()
    .min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
  email: z.string().email("Ingrese un email válido"),
  contact: z
    .string()
    .min(10, "El número de contacto debe tener al menos 10 dígitos"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(
      /[!@#$%^&*]/,
      "La contraseña debe contener al menos un carácter especial (!@#$%^&*)"
    ),
  logo_url: z
    .string()
    .url("Ingrese una URL válida para el logo")
    .optional()
    .or(z.literal("")),
  page_url: z
    .string()
    .url("Ingrese una URL válida para la página web")
    .optional()
    .or(z.literal("")),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

function CreatePartnerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
  });

  const onSubmit = async (data: PartnerFormData) => {
    setIsLoading(true);
    try {
      // Primero obtener el role_id del rol "partner"
      const roleResponse = await fetch("/api/roles");
      if (!roleResponse.ok) {
        throw new Error("Error al obtener roles");
      }

      const roleData = await roleResponse.json();
      const partnerRole = roleData.data?.find(
        (role: any) => role.name === "partner"
      );

      if (!partnerRole) {
        throw new Error("No se encontró el rol de partner");
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          role_id: partnerRole.id,
          contact_number: data.contact, // Mapear contact a contact_number
          logo_url: data.logo_url || "",
          page_url: data.page_url || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "Email already exists") {
          setError("email", { message: "Este email ya está registrado" });
        } else {
          throw new Error(errorData.error || "Error al registrar partner");
        }
        return;
      }

      // Éxito - redirigir a la página de partners
      router.push("/dashboard/admin/partners");
      router.refresh();
    } catch (error) {
      console.error("Error registrando partner:", error);
      setError("root", {
        message: "Error interno del servidor. Intente nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-2xl min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30">
      <div className="mb-4">
        <Link
          href="/dashboard/admin/partners"
          className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 transition-all duration-300 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Partners
        </Link>
      </div>

      <Card className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 border-purple-200/50 shadow-lg shadow-purple-100/40 backdrop-blur-sm border-2">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 text-white rounded-t-lg shadow-lg shadow-purple-500/30 border border-purple-400/20">
          <CardTitle className="flex items-center gap-3 text-lg font-bold">
            <div className="p-2 bg-gradient-to-br from-white/20 to-white/10 rounded-lg shadow-lg border border-white/30 backdrop-blur-sm">
              <Building2 className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
            Registrar Nuevo Partner
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre de la empresa */}
            <div className="space-y-2">
              <Label
                htmlFor="company_name"
                className="text-purple-700 font-medium"
              >
                Nombre de la Empresa *
              </Label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-purple-500 group-focus-within:text-orange-500 transition-colors duration-300" />
                <Input
                  id="company_name"
                  type="text"
                  placeholder="Ingrese el nombre de la empresa"
                  className="pl-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
                  {...register("company_name")}
                />
              </div>
              {errors.company_name && (
                <p className="text-sm text-destructive font-medium">
                  {errors.company_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-purple-700 font-medium">
                Email *
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-500 group-focus-within:text-orange-500 transition-colors duration-300" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@empresa.com"
                  className="pl-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Contacto */}
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-purple-700 font-medium">
                Número de Contacto *
              </Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-purple-500 group-focus-within:text-orange-500 transition-colors duration-300" />
                <Input
                  id="contact"
                  type="tel"
                  placeholder="300 123 4567"
                  className="pl-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
                  {...register("contact")}
                />
              </div>
              {errors.contact && (
                <p className="text-sm text-destructive font-medium">
                  {errors.contact.message}
                </p>
              )}
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
                  placeholder="https://ejemplo.com/logo.png"
                  className="pl-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
                  {...register("logo_url")}
                />
              </div>
              {errors.logo_url && (
                <p className="text-sm text-destructive font-medium">
                  {errors.logo_url.message}
                </p>
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
                  placeholder="https://ejemplo.com"
                  className="pl-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
                  {...register("page_url")}
                />
              </div>
              {errors.page_url && (
                <p className="text-sm text-destructive font-medium">
                  {errors.page_url.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-700 font-medium">
                Contraseña *
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-500 group-focus-within:text-orange-500 transition-colors duration-300" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mín 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 especial"
                  className="pl-10 pr-10 border-purple-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-purple-500 hover:text-orange-500 transition-colors duration-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive font-medium">
                  {errors.password.message}
                </p>
              )}
              <div className="text-xs text-gray-600 mt-1">
                La contraseña debe contener al menos 8 caracteres, una letra
                mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*)
              </div>
            </div>

            {/* Error general */}
            {errors.root && (
              <div className="p-4 bg-gradient-to-r from-red-50 via-red-50 to-red-100 border border-red-300/50 rounded-lg shadow-md backdrop-blur-sm">
                <p className="text-sm text-red-700 font-medium">
                  {errors.root.message}
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-600/40 border border-orange-400/20 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Partner"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreatePartnerPage;
