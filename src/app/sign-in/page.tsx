import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col justify-center gap-8 p-6 md:p-10 overflow-hidden">
      {/* Fondo dividido en dos mitades */}
      <div className="absolute inset-0 flex">
        {/* Mitad izquierda */}
        <div className="w-1/3 h-full relative">
          <Image
            src="/reunion-de-equipo-para-startups.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Mitad derecha */}
        <div className="w-2/3 h-full relative flex items-center justify-center">
          {/* Imagen de fondo */}
          <Image
            src="/fondo-oscuro.jpg"
            alt="Team Meeting"
            fill
            className="object-cover z-0"
            priority
          />

          {/* Contenedor del formulario centrado */}
          <div className="relative z-10 w-full max-w-md">
            {/* Efecto vidrio premium y mejor contraste */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 blur-md" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-black/30 backdrop-blur-sm" />
              <div className="relative p-6">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal posicionado y centrado en el lado derecho */}
    </div>
  );
}
