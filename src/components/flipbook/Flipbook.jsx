"use client";

import React, { useState, useEffect, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";

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
  const [isPortrait, setIsPortrait] = useState(false);
  const [bookSize, setBookSize] = useState({ width: 800, height: 600 });
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

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

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-center px-4 overflow-x-hidden overflow-y-hidden"
    >
      <Document
        file={`/materials/${material}`}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<p>Cargando PDF...</p>}
      >
        {numPages && !isMobile && (
          <HTMLFlipBook
            width={bookSize.width / 2}
            height={bookSize.height}
            size="fixed"
            showCover={true}
            usePortrait={isPortrait}
            drawShadow
            mobileScrollSupport
            maxShadowOpacity={0.5}
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

      {/* Modal para mobile */}
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
