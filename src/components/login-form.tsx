"use client";

import React, { useState, useEffect } from "react";
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
import {
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  Loader2,
  Award,
  Shield,
  Building2,
} from "lucide-react";
import { studentLoginSchema, partnerLoginSchema } from "@/lib/schemas";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { useStudentStore } from "@/stores/student-store";
import Image from "next/image";

type StudentLoginForm = z.infer<typeof studentLoginSchema>;
type PartnerLoginForm = z.infer<typeof partnerLoginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [loginType, setLoginType] = useState<"student" | "partner">("student");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const updateUser = useUserStore((state) => state.updateUser);
  const updateStudent = useStudentStore((state) => state.updateStudent);

  // Animación inicial
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleStudentLogin = async (data: StudentLoginForm) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // Manejar diferentes tipos de error
      if (response.status === 403 && result.error === "VOUCHER_EXPIRED") {
        setErrorMessage("🕒 Tu voucher ha expirado.");
        return;
      }

      if (response.status === 409 && result.error === "VOUCHER_ALREADY_USED") {
        setErrorMessage(
          "✅ Este voucher ya fue utilizado. No puedes acceder nuevamente con el mismo código."
        );
        return;
      }

      if (response.status === 401 && result.error === "VOUCHER_NOT_FOUND") {
        setErrorMessage(
          "🔍 Voucher inválido. Verifica que hayas ingresado el código correctamente."
        );
        return;
      }

      if (response.status === 400) {
        setErrorMessage(
          "⚠️ Formato del token inválido. Por favor verifica el código ingresado."
        );
        return;
      }

      if (response.status === 401) {
        setErrorMessage("🚫 Token inválido o no autorizado.");
        return;
      }

      if (!response.ok) {
        setErrorMessage(result.error || "Error inesperado al iniciar sesión.");
        return;
      }

      updateStudent(result.data.student, result.data.access_token);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error en el login:", error);
      setErrorMessage("❌ Algo salió mal, intenta nuevamente más tarde");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartnerLogin = async (data: PartnerLoginForm) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok || result.statusCode !== 200) {
        setErrorMessage(result.error || "Error al iniciar sesión");
        return;
      }

      if (!result.data?.user) {
        setErrorMessage("No se recibió información del usuario.");
        return;
      }

      updateUser(result.data.user);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error en el login:", error);
      setErrorMessage("Error inesperado al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (type: "student" | "partner") => {
    setLoginType(type);
    setErrorMessage(null);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div
      className={cn("flex flex-col gap-6 w-full max-w-md mx-auto", className)}
      {...props}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300 w-full",
          "border-0 bg-gradient-to-br from-white to-gray-50/80",
          "shadow-2xl shadow-violet-950/10 backdrop-blur-sm",
          "ring-1 ring-gray-200/50"
        )}
      >
        {/* Elementos decorativos elegantes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-100/15 to-transparent rounded-full translate-y-12 -translate-x-12" />

        {/* Línea decorativa superior elegante */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-950 via-violet-800 to-orange-500" />

        <CardHeader className="text-center relative z-10 pt-6 pb-4">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/sm-full-color.png"
              alt="T-cert logo"
              width={70}
              height={70}
              className="drop-shadow-lg"
            />
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-violet-950 via-violet-800 to-violet-900 bg-clip-text text-transparent mb-1 tracking-tight">
            T-Cert Platform
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 font-medium tracking-wide">
            Ente Certificador Internacional
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 px-6 pb-6">
          <div className="flex flex-col gap-3 mb-6">
            <Button
              variant={loginType === "student" ? "default" : "outline"}
              className={cn(
                "w-full h-14 text-base font-semibold transition-all duration-300 transform",
                "border-2 rounded-xl relative overflow-hidden group",
                loginType === "student"
                  ? "bg-gradient-to-r from-violet-950 to-violet-900 hover:from-violet-900 hover:to-violet-800 text-white border-violet-950 shadow-lg shadow-violet-950/25 scale-[1.02]"
                  : "border-gray-200 hover:border-violet-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-violet-100/50 text-gray-700 hover:text-violet-900 hover:scale-[1.01] hover:shadow-md"
              )}
              onClick={(e) => {
                e.preventDefault();
                handleTypeChange("student");
              }}
              disabled={isLoading}
            >
              <div className="flex items-center justify-center space-x-3 relative z-10">
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors duration-200",
                    loginType === "student"
                      ? "bg-white/15"
                      : "bg-violet-100 group-hover:bg-violet-200"
                  )}
                >
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-semibold">Estudiante</span>
              </div>
              {loginType === "student" && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              )}
            </Button>

            <Button
              variant={loginType === "partner" ? "default" : "outline"}
              className={cn(
                "w-full h-14 text-base font-semibold transition-all duration-300 transform",
                "border-2 rounded-xl relative overflow-hidden group",
                loginType === "partner"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-orange-500 shadow-lg shadow-orange-500/25 scale-[1.02]"
                  : "border-gray-200 hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100/50 text-gray-700 hover:text-orange-900 hover:scale-[1.01] hover:shadow-md"
              )}
              onClick={(e) => {
                e.preventDefault();
                handleTypeChange("partner");
              }}
              disabled={isLoading}
            >
              <div className="flex items-center justify-center space-x-3 relative z-10">
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors duration-200",
                    loginType === "partner"
                      ? "bg-white/15"
                      : "bg-orange-100 group-hover:bg-orange-200"
                  )}
                >
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="font-semibold">Partner Institucional</span>
              </div>
              {loginType === "partner" && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              )}
            </Button>
          </div>

          <div className="transition-all duration-500 transform">
            {loginType === "student" && (
              <StudentLoginForm
                onSubmit={handleStudentLogin}
                isLoading={isLoading}
              />
            )}

            {loginType === "partner" && (
              <PartnerLoginForm
                onSubmit={handlePartnerLogin}
                isLoading={isLoading}
              />
            )}
          </div>

          {errorMessage && (
            <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
              <div
                className={cn(
                  "border-l-4 rounded-r-xl p-4 backdrop-blur-sm",
                  errorMessage.includes("expirado")
                    ? "bg-orange-50/80 border-orange-400"
                    : errorMessage.includes("ya fue utilizado")
                    ? "bg-green-50/80 border-green-400"
                    : "bg-red-50/80 border-red-400"
                )}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        errorMessage.includes("expirado")
                          ? "bg-orange-400"
                          : errorMessage.includes("ya fue utilizado")
                          ? "bg-green-400"
                          : "bg-red-400"
                      )}
                    ></div>
                  </div>
                  <div className="ml-3">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        errorMessage.includes("expirado")
                          ? "text-orange-800"
                          : errorMessage.includes("ya fue utilizado")
                          ? "text-green-800"
                          : "text-red-700"
                      )}
                    >
                      {errorMessage}
                    </span>
                    {errorMessage.includes("expirado") && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-100/50 p-2 rounded-lg border border-orange-200/50">
                        💡 <strong>Tip:</strong> Solicita un nuevo voucher a tu
                        institución educativa para continuar con tus
                        certificaciones.
                      </div>
                    )}
                    {errorMessage.includes("ya fue utilizado") && (
                      <div className="mt-2 text-xs text-green-700 bg-green-100/50 p-2 rounded-lg border border-green-200/50">
                        ℹ️ <strong>Información:</strong> Este voucher ya fue
                        usado anteriormente. Solicita un nuevo voucher si deseas
                        obtener otra certificación.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudentLoginForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: StudentLoginForm) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentLoginForm>({
    resolver: zodResolver(studentLoginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label
          htmlFor="token"
          className="text-sm font-semibold text-violet-900 flex items-center"
        >
          <Award className="w-4 h-4 mr-2 text-violet-700" />
          Token de Certificación
        </Label>
        <div className="relative group">
          <Input
            id="token"
            type="text"
            placeholder="Ingresa tu token único de acceso"
            className={cn(
              "h-12 text-sm transition-all duration-300 border-2 rounded-xl pl-4 pr-12",
              "border-violet-200 focus:border-violet-950 focus:ring-4 focus:ring-violet-100/50",
              "bg-gradient-to-r from-white to-violet-50/30 hover:to-violet-50/50",
              "shadow-sm focus:shadow-md group-hover:shadow-sm",
              errors.token &&
                "border-red-300 focus:border-red-500 focus:ring-red-100/50"
            )}
            {...register("token")}
            disabled={isLoading}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-orange-400 animate-pulse"></div>
          </div>
        </div>
        {errors.token && (
          <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50/80 p-2 rounded-lg border border-red-200/50 animate-in slide-in-from-top-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
            <span className="font-medium">{errors.token.message}</span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        className={cn(
          "w-full h-12 text-sm font-semibold rounded-xl relative overflow-hidden group",
          "bg-gradient-to-r from-violet-950 to-violet-900 hover:from-violet-900 hover:to-violet-800",
          "shadow-lg shadow-violet-950/25 hover:shadow-xl hover:shadow-violet-950/30",
          "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
          "border border-violet-800",
          isLoading && "opacity-80"
        )}
        disabled={isLoading}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        {isLoading ? (
          <div className="flex items-center space-x-2 relative z-10">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verificando token...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 relative z-10">
            <GraduationCap className="h-4 w-4" />
            <span>Acceder como Estudiante</span>
            <Award className="h-4 w-4 text-orange-300" />
          </div>
        )}
      </Button>
    </form>
  );
}

function PartnerLoginForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: PartnerLoginForm) => void;
  isLoading: boolean;
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-sm font-semibold text-orange-900 flex items-center"
        >
          <Building2 className="w-4 h-4 mr-2 text-orange-700" />
          Correo Institucional
        </Label>
        <div className="relative group">
          <Input
            id="email"
            type="email"
            placeholder="admin@institucion.com"
            className={cn(
              "h-12 text-sm transition-all duration-300 border-2 rounded-xl pl-4",
              "border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100/50",
              "bg-gradient-to-r from-white to-orange-50/30 hover:to-orange-50/50",
              "shadow-sm focus:shadow-md group-hover:shadow-sm",
              errors.email &&
                "border-red-300 focus:border-red-500 focus:ring-red-100/50"
            )}
            {...register("email")}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50/80 p-2 rounded-lg border border-red-200/50 animate-in slide-in-from-top-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
            <span className="font-medium">{errors.email.message}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-sm font-semibold text-orange-900 flex items-center"
          >
            <Shield className="w-4 h-4 mr-2 text-orange-700" />
            Contraseña Segura
          </Label>
          <button
            type="button"
            className="text-xs text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline transition-colors font-medium"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div className="relative group">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contraseña institucional"
            className={cn(
              "h-12 text-sm pr-12 transition-all duration-300 border-2 rounded-xl pl-4",
              "border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100/50",
              "bg-gradient-to-r from-white to-orange-50/30 hover:to-orange-50/50",
              "shadow-sm focus:shadow-md group-hover:shadow-sm",
              errors.password &&
                "border-red-300 focus:border-red-500 focus:ring-red-100/50"
            )}
            {...register("password")}
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-orange-50 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-orange-600" />
            ) : (
              <Eye className="h-4 w-4 text-orange-600" />
            )}
          </Button>
        </div>
        {errors.password && (
          <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50/80 p-2 rounded-lg border border-red-200/50 animate-in slide-in-from-top-1">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
            <span className="font-medium">{errors.password.message}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <Button
          type="submit"
          className={cn(
            "w-full h-12 text-sm font-semibold rounded-xl relative overflow-hidden group",
            "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
            "shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30",
            "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
            "border border-orange-400",
            isLoading && "opacity-80"
          )}
          disabled={isLoading}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          {isLoading ? (
            <div className="flex items-center space-x-2 relative z-10">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verificando credenciales...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 relative z-10">
              <Building2 className="h-4 w-4" />
              <span>Acceder Panel Institucional</span>
              <Shield className="h-4 w-4 text-violet-300" />
            </div>
          )}
        </Button>

        <div className="text-center pt-1">
          <button
            type="button"
            className="text-xs text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline transition-colors font-medium bg-orange-50/50 px-3 py-1.5 rounded-lg hover:bg-orange-50"
          >
            ¿Deseas ser Partner Institucional? Solicita información
          </button>
        </div>
      </div>
    </form>
  );
}
