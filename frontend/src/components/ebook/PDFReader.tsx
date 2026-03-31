"use client";

import { useState, useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/Button';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFReader({ url }: { url: string }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadPDF = async () => {
      const loadingTask = pdfjs.getDocument(url);
      const pdf = await loadingTask.promise;
      setNumPages(pdf.numPages);
      renderPage(pdf, pageNumber);
    };
    loadPDF();
  }, [url, pageNumber]);

  const renderPage = async (pdf: any, num: number) => {
    const page = await pdf.getPage(num);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
  };

  return (
    <div className="flex flex-col items-center bg-muted/20 rounded-2xl overflow-hidden border shadow-inner">
      <div className="w-full bg-background border-b p-3 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))} disabled={pageNumber <= 1}>
            <ChevronLeft size={18} />
          </Button>
          <span className="text-sm font-medium">Page {pageNumber} of {numPages}</span>
          <Button variant="ghost" size="sm" onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))} disabled={pageNumber >= numPages}>
            <ChevronRight size={18} />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm"><ZoomOut size={18} /></Button>
          <Button variant="ghost" size="sm"><ZoomIn size={18} /></Button>
          <Button variant="ghost" size="sm"><Maximize size={18} /></Button>
        </div>
      </div>
      <div className="p-8 overflow-auto max-h-[80vh] w-full flex justify-center bg-muted/10">
        <canvas ref={canvasRef} className="shadow-2xl bg-white" />
      </div>
    </div>
  );
}
