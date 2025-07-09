"use client";

import { useEffect, useState } from "react";
import Flipbook from "@/components/flipbook/Flipbook";
import FlipbookModal from "@/components/flipbook/FlipbookModal";

export default function StudentHomePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          <FlipbookModal material="itil_dpi.pdf" />
        ) : (
          <Flipbook material="itil_dpi.pdf" />
        )}
      </div>
    </div>
  );
}
