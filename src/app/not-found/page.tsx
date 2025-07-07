import React from "react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <span className="text-6xl mb-4">🚧</span>
      <h1 className="text-3xl font-bold mb-2">¡Estamos construyendo esta página!</h1>
      <p className="text-lg text-gray-400 mb-6">
        Pronto estará disponible. Gracias por tu paciencia.
      </p>
      <Link
        href="/dashboard"
        className="inline-block rounded bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition"
      >
        Volver a la plataforma
      </Link>
    </div>
  );
}