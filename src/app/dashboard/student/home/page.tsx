"use client";

import { useEffect, useState } from "react";
import FlipbookModal from "@/components/flipbook/FlipbookModal";
import FlipbookFullModal from "@/components/flipbook/FlipbookFullModal";

export default function StudentHomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [material, setMaterial] = useState<string | null>(null);

  useEffect(() => {
    const detectMobile = () => {
      const isMobileUA =
        /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const isNarrowScreen = window.innerWidth < 768;

      return isMobileUA || isNarrowScreen;
    };

    const handleResize = () => {
      setIsMobile(detectMobile());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const session = JSON.parse(
          sessionStorage.getItem("student-data") || "{}"
        );
        const voucher_id = session?.state?.decryptedStudent?.voucher_id;

        if (!voucher_id) {
          console.error("No se encontró voucher_id en la sesión");
          return;
        }

        const response = await fetch("/api/students/materials", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ voucher_id }),
        });

        const data = await response.json();

        if (response.ok && data.material) {
          setMaterial(data.material);
        } else {
          console.error("No se encontró el material del estudiante");
          console.log("MENSAJE DEL SERVIDOR:", data);
        }
      } catch (err) {
        console.error("Error al obtener el material del estudiante:", err);
      }
    };

    fetchMaterial();
  }, []);

  if (!material) {
    return <p className="text-gray-500">Cargando material...</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4 items-center text-center">
      <h1 className="text-2xl font-bold text-primary-700 -mt-8">
        Material de tu Certificación
      </h1>
      <p className="text-base text-gray-600">
        Aquí puedes visualizar y repasar todos los recursos de tu certificación.
        ¡Explora el material y prepárate para avanzar!
      </p>

      <div className="w-full max-w-7xl mx-auto mt-8">
        {isMobile ? (
          <FlipbookModal material={material} />
        ) : (
          <FlipbookFullModal material={material} />
        )}
      </div>
    </div>
  );
}
