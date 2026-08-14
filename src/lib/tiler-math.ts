import { TileConfig, TileRect, PaperOrientation } from '@/types/tiler';

// Standard A4 dimensions in mm
export const A4_PORTRAIT_W_MM = 210;
export const A4_PORTRAIT_H_MM = 297;

export interface PaperDimensions {
  widthMm: number;
  heightMm: number;
}

/**
 * Get target paper size in mm based on orientation
 */
export function getPaperDimensions(orientation: PaperOrientation): PaperDimensions {
  if (orientation === 'landscape') {
    return { widthMm: A4_PORTRAIT_H_MM, heightMm: A4_PORTRAIT_W_MM }; // 297 x 210 mm
  }
  return { widthMm: A4_PORTRAIT_W_MM, heightMm: A4_PORTRAIT_H_MM }; // 210 x 297 mm
}

/**
 * Calculate grid slice bounding boxes over the source image
 */
export function calculateTileRects(
  sourceW: number,
  sourceH: number,
  config: TileConfig
): TileRect[] {
  const { rows, cols, paperOrientation, overlapMm } = config;
  const paper = getPaperDimensions(paperOrientation);

  // Total physical tiled poster dimensions in mm accounting for overlaps
  const totalW_mm = cols * paper.widthMm - Math.max(0, cols - 1) * overlapMm;
  const totalH_mm = rows * paper.heightMm - Math.max(0, rows - 1) * overlapMm;

  const tiles: TileRect[] = [];

  let count = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Physical start and end in mm
      const xStart_mm = c * (paper.widthMm - overlapMm);
      const xEnd_mm = xStart_mm + paper.widthMm;

      const yStart_mm = r * (paper.heightMm - overlapMm);
      const yEnd_mm = yStart_mm + paper.heightMm;

      // Normalized coordinates (0..1)
      const normX = Math.max(0, xStart_mm / totalW_mm);
      const normY = Math.max(0, yStart_mm / totalH_mm);
      const normW = Math.min(1 - normX, paper.widthMm / totalW_mm);
      const normH = Math.min(1 - normY, paper.heightMm / totalH_mm);

      // Source image pixel bounds
      const srcX = Math.round(normX * sourceW);
      const srcY = Math.round(normY * sourceH);
      const srcW = Math.min(sourceW - srcX, Math.round(normW * sourceW));
      const srcH = Math.min(sourceH - srcY, Math.round(normH * sourceH));

      tiles.push({
        id: count,
        row: r + 1,
        col: c + 1,
        label: `P${count} (列${r + 1}, 欄${c + 1})`,
        sourceX: srcX,
        sourceY: srcY,
        sourceW: srcW,
        sourceH: srcH,
        normX,
        normY,
        normW,
        normH,
      });
      count++;
    }
  }

  return tiles;
}

/**
 * Get total calculated poster dimensions string in mm and cm
 */
export function getPosterDimensionsString(config: TileConfig): { mm: string; cm: string } {
  const paper = getPaperDimensions(config.paperOrientation);
  const totalW_mm = config.cols * paper.widthMm - Math.max(0, config.cols - 1) * config.overlapMm;
  const totalH_mm = config.rows * paper.heightMm - Math.max(0, config.rows - 1) * config.overlapMm;

  return {
    mm: `${Math.round(totalW_mm)} x ${Math.round(totalH_mm)} mm`,
    cm: `${(totalW_mm / 10).toFixed(1)} x ${(totalH_mm / 10).toFixed(1)} cm`,
  };
}
