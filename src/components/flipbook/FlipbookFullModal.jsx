"use client";

import React, { useRef, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function FlipbookFullModal({ material }) {
  const [open, setOpen] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [browserZoom, setBrowserZoom] = useState(1);
  const flipbookRef = useRef();

  useEffect(() => {
    return () => {
      document.body.style.zoom = "1";
    };
  }, []);

  const handlePageChange = (e) => {
    const newPage = e.data + 1;
    setCurrentPage(newPage);
    setPageInput(String(newPage));
  };

  const goToPage = (page) => {
    if (flipbookRef.current && page >= 1 && page <= numPages) {
      flipbookRef.current.pageFlip().flip(page - 1);
      setCurrentPage(page);
      setPageInput(String(page));
    }
  };

  const nextPage = () => {
    if (currentPage < numPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const zoomIn = () => {
    const newZoom = Math.min(browserZoom + 0.1, 2);
    setBrowserZoom(newZoom);
    document.body.style.zoom = newZoom;
  };

  const zoomOut = () => {
    const newZoom = Math.max(browserZoom - 0.1, 0.5);
    setBrowserZoom(newZoom);
    document.body.style.zoom = newZoom;
  };

  const resetZoom = () => {
    setBrowserZoom(1);
    document.body.style.zoom = "1";
  };

  const handleClose = () => {
    setOpen(false);
    resetZoom();
  };

  return (
    <div className="w-full flex justify-center">
      <Button onClick={() => setOpen(true)}>Abrir material</Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center px-4">
          {/* Botón de cierre */}
          <button
            className="absolute top-4 left-4 text-white text-2xl z-50"
            onClick={handleClose}
          >
            <X />
          </button>

          {/* Flipbook */}
          <Document
            file={`/materials/${material}`}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<p className="text-white">Cargando PDF...</p>}
          >
            <HTMLFlipBook
              ref={flipbookRef}
              width={500}
              height={700}
              size="fixed"
              showCover={true}
              usePortrait={false}
              drawShadow
              maxShadowOpacity={0.5}
              onFlip={handlePageChange}
              className="shadow-lg"
            >
              {Array.from({ length: numPages }, (_, index) => (
                <div
                  key={index}
                  className="bg-white flex justify-center items-center w-full h-full"
                >
                  <Page
                    pageNumber={index + 1}
                    width={500}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                </div>
              ))}
            </HTMLFlipBook>
          </Document>

          {/* Controles flotantes */}
          <div className="absolute bottom-4 flex flex-col md:flex-row items-center gap-4 bg-white rounded-lg p-3 shadow z-50">
            {/* Paginación */}
            <div className="flex items-center gap-2">
              <Button onClick={prevPage} variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1 text-sm">
                Página
                <Input
                  type="number"
                  className="w-14 h-8 px-2 text-center"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={() => goToPage(Number(pageInput))}
                  onKeyDown={(e) => {
                    if (e.key === "a") {
                      goToPage(Number(pageInput));
                    }
                  }}
                />
                de {numPages}
              </div>

              <Button onClick={nextPage} variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Button
                onClick={zoomOut}
                variant="outline"
                size="sm"
                title="Zoom -"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                onClick={resetZoom}
                variant="outline"
                size="sm"
                title="Restaurar"
              >
                <RefreshCcw className="w-4 h-4" />
              </Button>
              <Button
                onClick={zoomIn}
                variant="outline"
                size="sm"
                title="Zoom +"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
