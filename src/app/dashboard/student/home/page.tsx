"use client";

import { useEffect, useState } from "react";
import FlipbookModal from "@/components/flipbook/FlipbookModal";
import FlipbookFullModal from "@/components/flipbook/FlipbookFullModal";

export default function StudentHomePage() {
  const [isMobile, setIsMobile] = useState(false);

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
          <FlipbookFullModal material="itil_dpi.pdf" />
        )}
      </div>
    </div>
  );
}
