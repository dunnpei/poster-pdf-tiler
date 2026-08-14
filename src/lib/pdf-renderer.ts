export async function initPdfJs() {
  if (typeof window === 'undefined') return null;
  const pdfjsLib = await import('pdfjs-dist');
  
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // CDN fallback for PDF.js worker script
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  }
  return pdfjsLib;
}

export interface PDFRenderResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  numPages: number;
  pdfDoc: any;
}

export async function renderPdfPage(
  fileOrBuffer: File | ArrayBuffer,
  pageNumber: number = 1,
  scale: number = 3.0 // High DPI render scale
): Promise<PDFRenderResult> {
  const pdfjsLib = await initPdfJs();
  if (!pdfjsLib) {
    throw new Error('PDF.js is only available in browser context.');
  }

  let arrayBuffer: ArrayBuffer;
  if (fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    arrayBuffer = fileOrBuffer;
  }

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const validPageNum = Math.max(1, Math.min(pageNumber, numPages));
  const page = await pdfDoc.getPage(validPageNum);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  if (context) {
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
  }

  return {
    canvas,
    width: viewport.width,
    height: viewport.height,
    numPages,
    pdfDoc,
  };
}
