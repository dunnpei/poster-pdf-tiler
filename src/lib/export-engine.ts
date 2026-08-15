import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { SourceMedia, TileConfig, TileRect } from '@/types/tiler';
import { calculateTileRects, getPaperDimensions } from './tiler-math';

export interface ProgressCallback {
  (current: number, total: number, message: string): void;
}

/**
 * Draw cut marks and overlay page labeling on slice canvas
 */
function drawCutMarksAndLabels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tile: TileRect,
  config: TileConfig
) {
  if (!config.showCutMarks) return;

  ctx.save();
  
  // Cut mark stroke style
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.lineWidth = Math.max(1, width * 0.002);
  ctx.setLineDash([width * 0.01, width * 0.01]);

  const paper = getPaperDimensions(config.paperOrientation);
  const overlapRatioX = config.overlapMm / paper.widthMm;
  const overlapRatioY = config.overlapMm / paper.heightMm;

  // Draw overlap dashed boundary guides if overlap > 0
  if (config.overlapMm > 0) {
    // Right overlap line if not last column
    if (tile.col < config.cols) {
      const lineX = width * (1 - overlapRatioX);
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, height);
      ctx.stroke();
    }
    // Bottom overlap line if not last row
    if (tile.row < config.rows) {
      const lineY = height * (1 - overlapRatioY);
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(width, lineY);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Render a single tile slice to an HTMLCanvasElement
 */
export async function renderTileSliceCanvas(
  media: SourceMedia,
  tile: TileRect,
  config: TileConfig
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const targetW = Math.max(1, tile.sourceW);
  const targetH = Math.max(1, tile.sourceH);

  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas 2d context');

  if (media.imageElement) {
    ctx.drawImage(
      media.imageElement,
      tile.sourceX,
      tile.sourceY,
      tile.sourceW,
      tile.sourceH,
      0,
      0,
      targetW,
      targetH
    );
  }

  // Draw overlay cut marks and page indicator
  drawCutMarksAndLabels(ctx, targetW, targetH, tile, config);

  return canvas;
}

/**
 * Export all sliced tiles into a single multi-page PDF document
 */
export async function exportToPdf(
  media: SourceMedia,
  config: TileConfig,
  onProgress?: ProgressCallback
): Promise<void> {
  const tiles = calculateTileRects(media.width, media.height, config);
  const total = tiles.length;

  const pdf = new jsPDF({
    orientation: config.paperOrientation,
    unit: 'mm',
    format: 'a4',
  });

  const paper = getPaperDimensions(config.paperOrientation);

  for (let i = 0; i < total; i++) {
    const tile = tiles[i];
    if (onProgress) {
      onProgress(i + 1, total, `處理第 ${i + 1} / ${total} 頁切片中...`);
    }

    const tileCanvas = await renderTileSliceCanvas(media, tile, config);
    const imgData = tileCanvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage('a4', config.paperOrientation);
    }

    // Stretch to exact full A4 page
    pdf.addImage(imgData, 'JPEG', 0, 0, paper.widthMm, paper.heightMm);
  }

  if (onProgress) {
    onProgress(total, total, '正在生成 PDF 下載檔...');
  }

  const outputName = `${media.fileName.replace(/\.[^/.]+$/, '')}_poster_tiles.pdf`;
  pdf.save(outputName);
}

/**
 * Export all sliced tiles into a single ZIP archive containing PNG images
 */
export async function exportToZip(
  media: SourceMedia,
  config: TileConfig,
  onProgress?: ProgressCallback
): Promise<void> {
  const tiles = calculateTileRects(media.width, media.height, config);
  const total = tiles.length;
  const zip = new JSZip();
  const folder = zip.folder('poster_slices');

  for (let i = 0; i < total; i++) {
    const tile = tiles[i];
    if (onProgress) {
      onProgress(i + 1, total, `打包第 ${i + 1} / ${total} 張圖片切片...`);
    }

    const tileCanvas = await renderTileSliceCanvas(media, tile, config);
    const base64Data = tileCanvas.toDataURL('image/png').split(',')[1];
    folder?.file(`poster_tile_${tile.id}_R${tile.row}_C${tile.col}.png`, base64Data, { base64: true });
  }

  if (onProgress) {
    onProgress(total, total, '壓縮 ZIP 檔案中...');
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${media.fileName.replace(/\.[^/.]+$/, '')}_poster_slices.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
