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
    <section className="flex min-h-screen flex-col items-center justify-center bg-muted p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Image
            src="/sm-full-color.png"
            alt="T-cert logo"
            width={90}
            height={90}
          />
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold">Registro</CardTitle>
            <CardDescription>
              Completa los siguientes datos para continuar
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="fullname">Nombre completo</Label>
                <Input
                  id="fullname"
                  {...register("fullname", {
                    required: "El nombre completo es obligatorio",
                  })}
                />
                {errors.fullname && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.fullname.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="document_type">Tipo de documento</Label>
                <select
                  id="document_type"
                  {...register("document_type", {
                    required: "Selecciona el tipo de documento",
                  })}
                  className="w-full border px-3 py-2 rounded-md text-sm"
                >
                  <option value="">Selecciona uno</option>
                  <option value="CC">Cédula</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="CE">Cédula de Extranjería</option>
                </select>
                {errors.document_type && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.document_type.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="document_number">Número de documento</Label>
                <Input
                  id="document_number"
                  {...register("document_number", {
                    required: "El número de documento es obligatorio",
                  })}
                />
                {errors.document_number && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.document_number.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registrando..." : "Registrar"}
              </Button>

              {success && (
                <p className="text-green-600 text-sm text-center">
                  Registro exitoso
                </p>
              )}

              {errorMessage && (
                <p className="text-red-600 text-sm text-center">
                  {errorMessage}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
