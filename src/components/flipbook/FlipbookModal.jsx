"use client";

import React, { useState } from "react";
import FlipbookStatic from "./FlipbookStatic";
import { Button } from "@/components/ui/button";

export default function FlipbookModal({ material }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full flex justify-center">
        <Button onClick={() => setOpen(true)} className="w-full">
          Abrir material
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">
              Vista del material
            </h2>
            <FlipbookStatic material={material} />
          </div>
        </div>
      )}
    </>
  );
}
