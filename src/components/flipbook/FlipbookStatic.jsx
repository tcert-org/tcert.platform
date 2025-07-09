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

  const nextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const prevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));

  return (
    <div className="w-full h-full flex flex-col items-center gap-4 p-2">
      <Document
        file={`/materials/${material}`}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
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
        <span className="text-xs">
          Pág {pageNumber} de {numPages}
        </span>
        <Button onClick={nextPage} disabled={pageNumber >= numPages}>
          Siguiente <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
