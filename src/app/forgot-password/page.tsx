"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMessage(
          "Por favor, revisa tu correo electrónico. Hemos enviado un enlace para que puedas restablecer tu contraseña de manera segura."
        );
      } else {
        const data = await res.json();
        if (res.status === 404 && data.error) {
          setError(data.error);
        } else {
          setError(
            data.error || "Error al enviar el correo. Intenta más tarde."
          );
        }
      }
    } catch (err) {
      setMessage("Error de red. Intenta más tarde.");
    } finally {
      setLoading(false);
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
          Recuperar contraseña
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <Label htmlFor="forgot-email">Correo electrónico</Label>
            <Input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          {message && (
            <div className="w-full rounded-lg bg-green-100 border border-green-300 text-green-900 px-4 py-3 text-center text-sm font-medium shadow-sm mb-2 animate-fade-in">
              {message}
            </div>
          )}
          {error && (
            <div className="w-full rounded-lg bg-red-100 border border-red-300 text-red-900 px-4 py-3 text-center text-sm font-medium shadow-sm mb-2 animate-fade-in">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-700 via-violet-600 to-orange-500 text-white font-semibold shadow-md hover:from-violet-800 hover:to-orange-600 focus:ring-2 focus:ring-violet-400 focus:outline-none"
            disabled={loading || !email}
          >
            {loading ? "Enviando..." : "Enviar instrucciones"}
          </Button>
        </form>
      </div>
    </div>
  );
}
