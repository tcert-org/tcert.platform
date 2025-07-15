"use client";

import React, { useState } from "react";
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
    const page = parseInt(inputValue);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      setPageNumber(page);
    } else {
      setInputValue(String(pageNumber)); // restaura el valor anterior si es inválido
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center gap-4 p-2">
      <Document
        file={`/materials/${material}`}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          if (pageNumber > numPages) {
            setPageNumber(numPages);
            setInputValue(String(numPages));
          }
        }}
        loading={<p>Cargando PDF...</p>}
      >
        <Page
          pageNumber={pageNumber}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          width={window.innerWidth * 0.9}
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
