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
            src="/reunion-de-equipo-para-startups.jpg"
            alt="Team Meeting"
            fill
            className="object-cover"
            priority
          />

          {/* Capa de desenfoque oscurecida */}
          <div className="absolute inset-0 backdrop-blur-lg bg-black/20" />

          {/* Contenedor del formulario sin sombra */}
          <div className="relative z-10 w-full max-w-md">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="relative p-6">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
