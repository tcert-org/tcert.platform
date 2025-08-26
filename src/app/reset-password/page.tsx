"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Token inválido o faltante");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Error al cambiar la contraseña");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/sign-in"), 2500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-violet-50">
      <div className="w-full max-w-md relative overflow-hidden transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/80 shadow-2xl shadow-violet-950/10 backdrop-blur-sm ring-1 ring-gray-200/50 rounded-xl p-8 mt-10">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-100/15 to-transparent rounded-full translate-y-12 -translate-x-12" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-950 via-violet-800 to-orange-500" />
        <div className="flex items-center justify-center mb-4 relative z-10 pt-6 pb-2">
          <Image
            src="/sm-full-color.png"
            alt="T-cert logo"
            width={70}
            height={70}
            className="drop-shadow-lg"
          />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-violet-950 via-violet-800 to-violet-900 bg-clip-text text-transparent tracking-tight relative z-10">
          Restablecer contraseña
        </h2>
        {success ? (
          <div className="text-green-700 text-center font-semibold relative z-10">
            ¡Contraseña actualizada! Redirigiendo al login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="mt-1 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                  onClick={() => setShowNew((v) => !v)}
                >
                  {showNew ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="mt-1 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-700 via-violet-600 to-orange-500 text-white font-semibold shadow-md hover:from-violet-800 hover:to-orange-600 focus:ring-2 focus:ring-violet-400 focus:outline-none"
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Cambiar contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
