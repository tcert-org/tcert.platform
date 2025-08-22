import React from "react";

interface ActionWarningProps {
  show: boolean;
  message?: string;
}

const ActionWarning: React.FC<ActionWarningProps> = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg animate-pulse mx-4 max-w-[calc(100vw-2rem)]">
      <p className="text-xs sm:text-sm font-medium text-center">
        {message || "⚠️ Acción no permitida durante el examen/simulador"}
      </p>
    </div>
  );
};

export default ActionWarning;
