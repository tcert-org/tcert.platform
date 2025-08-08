"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useUserStore } from "@/stores/user-store";

export default function SecurityForm() {
  const { getUser } = useUserStore();

  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (!/[A-Z]/.test(passwordData.newPassword)) {
      toast.error(
        "La nueva contraseña debe contener al menos una letra mayúscula"
      );
      return;
    }

    if (!/[a-z]/.test(passwordData.newPassword)) {
      toast.error(
        "La nueva contraseña debe contener al menos una letra minúscula"
      );
      return;
    }

    if (!/[0-9]/.test(passwordData.newPassword)) {
      toast.error("La nueva contraseña debe contener al menos un número");
      return;
    }

    if (!/[!@#$%^&*]/.test(passwordData.newPassword)) {
      toast.error(
        "La nueva contraseña debe contener al menos un carácter especial (!@#$%^&*)"
      );
      return;
    }

    setChangingPassword(true);

    try {
      const user = await getUser();
      if (!user?.id) {
        throw new Error("No se pudo obtener la información del usuario");
      }

      const response = await fetch(`/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al cambiar la contraseña");
      }

      toast.success("Contraseña cambiada exitosamente");

      // Limpiar el formulario
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cambiar la contraseña"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordInputChange = (
    field: keyof typeof passwordData,
    value: string
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <form onSubmit={handlePasswordChange} className="space-y-6">
      {/* Contraseña Actual */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="text-red-700 font-medium">
          Contraseña Actual *
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-red-500 group-focus-within:text-orange-500 transition-colors duration-300" />
          <Input
            id="currentPassword"
            type={showPasswords.current ? "text" : "password"}
            value={passwordData.currentPassword}
            onChange={(e) =>
              handlePasswordInputChange("currentPassword", e.target.value)
            }
            placeholder="Ingrese su contraseña actual"
            className="pl-10 pr-10 border-red-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-red-50/30"
            required
            disabled={changingPassword}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("current")}
            className="absolute right-3 top-3 text-red-500 hover:text-orange-500 transition-colors duration-300"
          >
            {showPasswords.current ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Nueva Contraseña */}
      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-red-700 font-medium">
          Nueva Contraseña *
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-red-500 group-focus-within:text-orange-500 transition-colors duration-300" />
          <Input
            id="newPassword"
            type={showPasswords.new ? "text" : "password"}
            value={passwordData.newPassword}
            onChange={(e) =>
              handlePasswordInputChange("newPassword", e.target.value)
            }
            placeholder="Mín 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 especial"
            className="pl-10 pr-10 border-red-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-red-50/30"
            required
            disabled={changingPassword}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("new")}
            className="absolute right-3 top-3 text-red-500 hover:text-orange-500 transition-colors duration-300"
          >
            {showPasswords.new ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          La contraseña debe contener al menos 8 caracteres, una letra
          mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*)
        </div>
      </div>

      {/* Confirmar Nueva Contraseña */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-red-700 font-medium">
          Confirmar Nueva Contraseña *
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-red-500 group-focus-within:text-orange-500 transition-colors duration-300" />
          <Input
            id="confirmPassword"
            type={showPasswords.confirm ? "text" : "password"}
            value={passwordData.confirmPassword}
            onChange={(e) =>
              handlePasswordInputChange("confirmPassword", e.target.value)
            }
            placeholder="Confirme su nueva contraseña"
            className="pl-10 pr-10 border-red-200 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 bg-gradient-to-r from-white to-red-50/30"
            required
            disabled={changingPassword}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("confirm")}
            className="absolute right-3 top-3 text-red-500 hover:text-orange-500 transition-colors duration-300"
          >
            {showPasswords.confirm ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Botón de Cambiar Contraseña */}
      <div className="flex gap-4 pt-6">
        <Button
          type="submit"
          disabled={changingPassword}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:via-rose-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-red-600/40 border border-red-400/20 transition-all duration-300 transform hover:scale-105 font-medium"
        >
          {changingPassword ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Cambiando...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Cambiar Contraseña
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPasswordData({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
            toast.info("Formulario de contraseña limpiado");
          }}
          disabled={changingPassword}
          className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-300 font-medium"
        >
          Limpiar
        </Button>
      </div>
    </form>
  );
}
