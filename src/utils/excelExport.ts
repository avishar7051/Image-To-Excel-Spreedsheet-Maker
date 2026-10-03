import * as XLSX from 'xlsx';
import { SheetData } from '../types';

/**
 * Sanitize a string to be a valid Excel worksheet name.
 * Excel limits names to 31 characters and forbids: \ / ? * : [ ]
 */
export function sanitizeSheetName(name: string, fallbackIndex: number = 1): string {
  let clean = (name || `Sheet${fallbackIndex}`)
    .replace(/[:\\/?*\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!clean) clean = `Sheet${fallbackIndex}`;
  if (clean.length > 30) clean = clean.substring(0, 30).trim();
  return clean;
}

/**
 * Automatically calculate optimal column widths for an Excel worksheet.
 */
function calculateColWidths(columns: string[], rows: string[][]): XLSX.ColInfo[] {
  return columns.map((colName, colIdx) => {
    let maxLength = colName ? colName.length : 10;
    for (const row of rows) {
      const cellValue = row[colIdx];
      if (cellValue) {
        const strVal = String(cellValue);
        if (strVal.length > maxLength) {
          maxLength = strVal.length;
        }
      }
    }
    // Min width 12, max width 60, add padding of 3
    const width = Math.min(Math.max(maxLength + 3, 12), 60);
    return { wch: width };
  });
}

/**
 * Convert sheet data to XLSX Worksheet with typed cell values.
 */
function createWorksheet(sheet: SheetData): XLSX.WorkSheet {
  const data: (string | number)[][] = [];

  // Header row
  data.push(sheet.columns);

  // Body rows
  for (const row of sheet.rows) {
    const formattedRow = row.map(cell => {
      if (cell === null || cell === undefined || cell === '') {
        return '';
      }
      const trimmed = String(cell).trim();

      // Check if it's a clean number (e.g. "123", "45.67", "-89")
      // Do not convert leading zeros like "00123" (could be ID/phone) or currency with symbols
      if (/^-?\d+(\.\d+)?$/.test(trimmed) && !(trimmed.length > 1 && trimmed.startsWith('0') && !trimmed.startsWith('0.'))) {
        const num = Number(trimmed);
        if (!isNaN(num)) return num;
      }
      return trimmed;
    });
    data.push(formattedRow);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Apply column widths
  ws['!cols'] = calculateColWidths(sheet.columns, sheet.rows);

  return ws;
}

/**
 * Export all sheets in the workbook to an .xlsx file.
 */
export function exportToExcel(sheets: SheetData[], baseFileName: string = 'Extracted_Data'): void {
  if (!sheets || sheets.length === 0) {
    throw new Error('No sheets to export');
  }

  const wb = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  sheets.forEach((sheet, index) => {
    let sheetName = sanitizeSheetName(sheet.name, index + 1);
    
    // Ensure unique sheet name
    let counter = 1;
    let uniqueName = sheetName;
    while (usedNames.has(uniqueName.toLowerCase())) {
      const suffix = ` (${counter})`;
      const maxBaseLen = 30 - suffix.length;
      uniqueName = `${sheetName.substring(0, maxBaseLen)}${suffix}`;
      counter++;
    }
    usedNames.add(uniqueName.toLowerCase());

    const ws = createWorksheet(sheet);
    XLSX.utils.book_append_sheet(wb, ws, uniqueName);
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const cleanFileName = baseFileName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fullFileName = `${cleanFileName}_${timestamp}.xlsx`;

  XLSX.writeFile(wb, fullFileName);
}

/**
 * Export a single sheet to a CSV file.
 */
export function exportSheetToCSV(sheet: SheetData, baseFileName: string = 'Sheet_Data'): void {
  const ws = createWorksheet(sheet);
  const csvContent = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanName = sanitizeSheetName(sheet.name, 1).replace(/\s+/g, '_');
  link.setAttribute('download', `${cleanName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy sheet data to clipboard as Tab-Separated Values (TSV)
 * for direct pasting into Excel / Google Sheets.
 */
export async function copySheetToClipboardTSV(sheet: SheetData): Promise<boolean> {
  try {
    const lines: string[] = [];
    lines.push(sheet.columns.join('\t'));
    for (const row of sheet.rows) {
      lines.push(row.join('\t'));
    }
    const tsv = lines.join('\n');
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
