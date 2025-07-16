"use client";
import { BookA } from "lucide-react";
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
  const isProgrammaticFlip = useRef(false);

  useEffect(() => {
    return () => {
      document.body.style.zoom = "1";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handlePageChange = (e) => {
    const newPage = e.data + 1;

    if (isProgrammaticFlip.current) {
      isProgrammaticFlip.current = false;
    }

    setCurrentPage(newPage);
    setPageInput(String(newPage));
    localStorage.setItem("flipbook_last_page", String(newPage));
  };

  const goToPage = (page) => {
    if (
      flipbookRef.current &&
      typeof flipbookRef.current.pageFlip === "function" &&
      page >= 1 &&
      page <= numPages
    ) {
      isProgrammaticFlip.current = true;
      flipbookRef.current.pageFlip().flip(page - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < numPages) {
      goToPage(currentPage + 2);
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

  useEffect(() => {
    if (open && numPages) {
      const saved = parseInt(
        localStorage.getItem("flipbook_last_page") || "1",
        10
      );
      const validPage = Math.min(Math.max(saved, 1), numPages);

      setCurrentPage(validPage); // sincroniza estado
      setPageInput(String(validPage)); // sincroniza input

      // Espera a que el libro esté listo para hacer el flip
      const interval = setInterval(() => {
        try {
          if (
            flipbookRef.current &&
            typeof flipbookRef.current.pageFlip === "function"
          ) {
            isProgrammaticFlip.current = true;
            flipbookRef.current.pageFlip().flip(validPage - 1);
            clearInterval(interval); // detener intervalo cuando se haga el flip
          }
        } catch (error) {
          console.log(
            error,
            "Es posible que el pageFlip() este llamando undefinded porque aun no esta listo"
          );
        }
      }, 100);
    }
  }, [open, numPages]);

  return (
    <div className="w-full flex justify-center">
      <Button onClick={() => setOpen(true)}>
        <BookA />
        Abrir material
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center px-4">
          <button
            className="absolute top-4 left-4 text-white text-2xl z-50"
            onClick={handleClose}
          >
            <X />
          </button>

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

          <div className="absolute bottom-4 flex flex-col md:flex-row items-center gap-4 bg-white rounded-lg p-3 shadow z-50">
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
                    if (e.key === "Enter") {
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
