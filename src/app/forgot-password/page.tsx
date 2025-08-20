"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMessage(
          "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña."
        );
      } else {
        const data = await res.json();
        setMessage(
          data.error || "Error al enviar el correo. Intenta más tarde."
        );
      }
    } catch (err) {
      setMessage("Error de red. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-violet-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mt-10">
        <h2 className="text-2xl font-bold mb-4 text-center text-violet-900">
          Recuperar contraseña
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="text-center text-sm text-green-700">{message}</div>
          )}
          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? "Enviando..." : "Enviar instrucciones"}
          </Button>
        </form>
      </div>
    </div>
  );
}
