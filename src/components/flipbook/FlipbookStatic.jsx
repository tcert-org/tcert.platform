"use client";

import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function FlipbookStatic({ material }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [inputValue, setInputValue] = useState("1");

  // 🧠 Restaurar después de que el PDF esté completamente cargado
  const handleLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);

    try {
      const savedPage = parseInt(
        localStorage.getItem("flipbook_last_page") || "1",
        10
      );
      const validPage = Math.min(Math.max(savedPage, 1), numPages);

      setPageNumber(validPage);
      setInputValue(String(validPage));
    } catch (error) {
      console.warn("Error reading from localStorage:", error);
      setPageNumber(1);
      setInputValue("1");
    }
  };

  // 🧠 Guardar en localStorage cada vez que cambie la página
  useEffect(() => {
    if (numPages) {
      try {
        localStorage.setItem("flipbook_last_page", String(pageNumber));
      } catch (error) {
        console.warn("Error saving to localStorage:", error);
      }
    }
  }, [pageNumber, numPages]);

  const nextPage = () => {
    const next = Math.min(pageNumber + 1, numPages);
    setPageNumber(next);
    setInputValue(String(next));
  };

  const prevPage = () => {
    const prev = Math.max(pageNumber - 1, 1);
    setPageNumber(prev);
    setInputValue(String(prev));
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(inputValue, 10);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      setPageNumber(page);
    } else {
      setInputValue(String(pageNumber)); // restaura el valor anterior si es inválido
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center gap-4 p-2">
      <Document
        file={`https://e48bssyezdxaxnzg.public.blob.vercel-storage.com/materials/${material}`}
        onLoadSuccess={handleLoadSuccess}
        loading={<p>Cargando PDF...</p>}
      >
        <Page
          pageNumber={pageNumber}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          width={Math.min(window.innerWidth * 0.9, 800)}
        />
      </Document>

      <div className="flex items-center gap-4">
        <Button onClick={prevPage} disabled={pageNumber <= 1}>
          <ChevronLeft className="w-4 h-4" /> Anterior
        </Button>

        <form onSubmit={handleInputSubmit} className="flex items-center gap-1">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="w-12 px-2 py-1 border border-gray-300 rounded text-center text-sm"
          />
          <span className="text-sm text-gray-700">de {numPages}</span>
        </form>

        <Button onClick={nextPage} disabled={pageNumber >= numPages}>
          Siguiente <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
