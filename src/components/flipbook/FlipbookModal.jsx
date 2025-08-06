"use client";
import { BookA, X } from "lucide-react";
import React, { useState } from "react";
import FlipbookStatic from "./FlipbookStatic";
import { Button } from "@/components/ui/button";

export default function FlipbookModal({ material }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full flex justify-center">
        <Button onClick={() => setOpen(true)} className="w-full bg-red-600">
          <BookA />
          Abrir material
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            {/* Header con botón de cerrar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Vista del material
              </h2>
              <button
                className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setOpen(false)}
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del PDF */}
            <div className="p-4">
              <FlipbookStatic material={material} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
