"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Users, Eye, EyeOff } from "lucide-react";
import { studentLoginSchema, partnerLoginSchema } from "@/lib/schemas";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";

type StudentLoginForm = z.infer<typeof studentLoginSchema>;
type PartnerLoginForm = z.infer<typeof partnerLoginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [loginType, setLoginType] = useState<"student" | "partner">("student");
  const router = useRouter();
  const updateUser = useUserStore((state) => state.updateUser);

  const handleStudentLogin = async (data: StudentLoginForm) => {
    console.log(data);
  };

  const handlePartnerLogin = async (data: PartnerLoginForm) => {
    try {
      const response = await fetch("/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error en la autenticación");
      }

      const result = await response.json();

      updateUser(result.data.user);

      router.push("/dashboard");
    } catch (error) {
      console.error("Error en el login:", error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Ingreso a la plataforma</CardTitle>
          <CardDescription>Selecciona tu forma de ingreso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <Button
              variant={loginType === "student" ? "selected" : "outline"}
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                setLoginType("student");
              }}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Iniciar como estudiante
            </Button>
            <Button
              variant={loginType === "partner" ? "selected" : "outline"}
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                setLoginType("partner");
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Iniciar como partner
            </Button>
          </div>

          {loginType === "student" && (
            <StudentLoginForm onSubmit={handleStudentLogin} />
          )}

          {loginType === "partner" && (
            <PartnerLoginForm onSubmit={handlePartnerLogin} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudentLoginForm({
  onSubmit,
}: {
  onSubmit: (data: StudentLoginForm) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentLoginForm>({
    resolver: zodResolver(studentLoginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="token">Token</Label>
          <Input
            id="token"
            type="text"
            placeholder="Ingresa tu token"
            {...register("token")}
          />
          {errors.token && (
            <span className="text-red-500 text-sm">{errors.token.message}</span>
          )}
        </div>
        <Button type="submit" className="w-full">
          Ingresar
        </Button>
      </div>
    </form>
  );
}

function PartnerLoginForm({
  onSubmit,
}: {
  onSubmit: (data: PartnerLoginForm) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnerLoginForm>({
    resolver: zodResolver(partnerLoginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Contraseña</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>
        <Button type="submit" className="w-full">
          Ingresar
        </Button>
        <div className="text-center text-sm">
          <a href="#" className="underline-offset-4 hover:underline">
            Quiero ser partner
          </a>
        </div>
      </div>
    </form>
  );
}
