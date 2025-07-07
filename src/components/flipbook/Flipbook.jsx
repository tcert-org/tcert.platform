'use client';

import React, { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const FlipPage = React.forwardRef(({ pageNumber, width }, ref) => (
  <div
    ref={ref}
    className="bg-white flex items-center justify-center"
    style={{ width: '100%', height: '100%' }}
  >
    <Page
      pageNumber={pageNumber}
      width={width}
      renderAnnotationLayer={false}
      renderTextLayer={false}
    />
  </div>
));

FlipPage.displayName = 'FlipPage';

function Flipbook({ material }) {
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(400);
  const [pageHeight, setPageHeight] = useState(600);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width < 768;
      setIsMobile(mobile);

      if (mobile) {
        setPageWidth(width - 32); // padding para evitar bordes duros
        setPageHeight(height * 0.8);
      } else {
        const containerWidth = containerRef.current?.offsetWidth || 1000;
        const containerHeight = containerRef.current?.offsetHeight || 800;
        setPageWidth(Math.min(containerWidth / 2, 600));
        setPageHeight(Math.min(containerHeight, 800));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex justify-center items-center overflow-hidden"
    >
      <Document
        file={`/materials/${material}`}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {numPages && (
          <HTMLFlipBook
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            drawShadow
            showCover={true}
            usePortrait={isMobile}
            mobileScrollSupport={true}
            className="shadow-md"
          >
            {Array.from({ length: numPages }, (_, i) => (
              <FlipPage key={i} pageNumber={i + 1} width={pageWidth} />
            ))}
          </HTMLFlipBook>
        )}
      </Document>
    </div>
  );
}

export default Flipbook;