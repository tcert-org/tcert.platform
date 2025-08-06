"use client";

import React, { useState, useEffect, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import pdf1 from "./materials/itil_dpi.pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const FlipPage = React.forwardRef(({ pageNumber, pageWidth }, ref) => (
  <div
    ref={ref}
    className="bg-white flex justify-center items-center w-full h-full"
  >
    <Page
      pageNumber={pageNumber}
      width={pageWidth}
      renderAnnotationLayer={false}
      renderTextLayer={false}
    />
  </div>
));
FlipPage.displayName = "FlipPage";

export default function Flipbook({ material }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);
  const [bookSize, setBookSize] = useState({ width: 800, height: 600 });
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const flipBookRef = useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;

      const forcePortrait = containerWidth < 900;
      setIsPortrait(forcePortrait);
      const scaleFactor = 0.9;
      const pageWidth = forcePortrait
        ? containerWidth * scaleFactor
        : Math.min(containerWidth * scaleFactor, 950) / 2;

      const pageHeight = pageWidth * 1.414;

      setBookSize({ width: pageWidth * 2, height: pageHeight });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    setIsMobile(window.innerWidth < 768);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const goNextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const goPrevPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const handlePageChange = (e) => {
    const page = e.data; // contiene { page, pageElement }
    setCurrentPage(page + 1); // se indexa desde 0
  };

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center px-4 overflow-x-hidden overflow-y-hidden"
    >
      <Document
        file={`/materials/${material}`}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          setCurrentPage(1);
        }}
        loading={<p>Cargando PDF...</p>}
      >
        {numPages && !isMobile && (
          <>
            <HTMLFlipBook
              ref={flipBookRef}
              width={bookSize.width / 2}
              height={bookSize.height}
              size="fixed"
              showCover={true}
              usePortrait={isPortrait}
              drawShadow
              mobileScrollSupport
              maxShadowOpacity={0.5}
              onFlip={handlePageChange}
              className="shadow-lg"
            >
              {Array.from({ length: numPages }, (_, index) => (
                <FlipPage
                  key={index}
                  pageNumber={index + 1}
                  pageWidth={bookSize.width / 2}
                />
              ))}
            </HTMLFlipBook>

            <div className="flex items-center justify-center gap-4 mt-6">
              <Button onClick={goPrevPage} disabled={currentPage <= 1}>
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {numPages}
              </span>
              <Button onClick={goNextPage} disabled={currentPage >= numPages}>
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {isMobile && (
          <div
            className="w-full flex justify-center items-center cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <Page
              pageNumber={1}
              width={bookSize.width / 2}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </div>
        )}
      </Document>

      {/* Modal solo para móviles */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ✕
          </button>
          <div className="w-full max-w-[90vw] h-[90vh] overflow-auto bg-white p-4 rounded-lg shadow-lg">
            <Document
              file={`/materials/${material}`}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              {Array.from({ length: numPages }, (_, index) => (
                <Page
                  key={index}
                  pageNumber={index + 1}
                  width={Math.min(window.innerWidth * 0.85, 400)}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="mb-4"
                />
              ))}
            </Document>
          </div>
        </div>
      )}
    </div>
  );
}
