export type PresetMode = '1to2' | '1to4' | 'custom';
export type PaperOrientation = 'portrait' | 'landscape';

export interface TileConfig {
  preset: PresetMode;
  rows: number;
  cols: number;
  paperOrientation: PaperOrientation;
  overlapMm: number; // 0 ~ 15 mm
  showCutMarks: boolean;
  selectedPage: number; // For PDF page selection (1-indexed)
}

export interface SourceMedia {
  type: 'image' | 'pdf';
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  aspectRatio: number;
  imageElement?: HTMLImageElement | HTMLCanvasElement;
  pdfDoc?: any;
  numPages?: number;
}

export interface TileRect {
  id: number;
  row: number;
  col: number;
  label: string;
  // Exact source image pixel coordinates
  sourceX: number;
  sourceY: number;
  sourceW: number;
  sourceH: number;
  // Normalized 0..1 bounding box for preview rendering
  normX: number;
  normY: number;
  normW: number;
  normH: number;
}
