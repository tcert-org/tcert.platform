import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function LoginPage() {
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
        {/* Formulario con efecto de vidrio premium */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/12 to-white/6 rounded-2xl blur-md" />
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-800/10 to-orange-700/8 rounded-2xl" />
          <LoginForm />
        </div>
      </div>

      {/* Overlay final para profundidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/15 pointer-events-none" />
    </div>
  );
}
