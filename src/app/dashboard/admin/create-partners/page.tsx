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
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
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
      const partnerRole = roleData.data?.find((role: any) => role.name === "partner");
      
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/admin/partners"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Partners
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Registrar Nuevo Partner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre de la empresa */}
            <div className="space-y-2">
              <Label htmlFor="company_name">Nombre de la Empresa *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="company_name"
                  type="text"
                  placeholder="Ingrese el nombre de la empresa"
                  className="pl-10"
                  {...register("company_name")}
                />
              </div>
              {errors.company_name && (
                <p className="text-sm text-destructive">
                  {errors.company_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@empresa.com"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Contacto */}
            <div className="space-y-2">
              <Label htmlFor="contact">Número de Contacto *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contact"
                  type="tel"
                  placeholder=" 300 123 4567"
                  className="pl-10"
                  {...register("contact")}
                />
              </div>
              {errors.contact && (
                <p className="text-sm text-destructive">
                  {errors.contact.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  className="pl-10 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error general */}
            {errors.root && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">
                  {errors.root.message}
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
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
