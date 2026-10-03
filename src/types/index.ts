export interface SheetData {
  id: string;
  name: string;
  columns: string[];
  rows: string[][];
}

export type ExtractionMode = 'standard' | 'receipt' | 'financial' | 'multi_section';

export interface ExtractionOptions {
  mode: ExtractionMode;
  customInstructions: string;
}

export type ViewLayout = 'split' | 'table-only' | 'image-only';

export interface CellPosition {
  rowIndex: number;
  colIndex: number;
}
