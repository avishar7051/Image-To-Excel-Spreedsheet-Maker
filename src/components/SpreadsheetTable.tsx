import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  ClipboardCheck,
  Clipboard,
  X,
  MoreVertical,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SheetData, CellPosition } from '../types';
import { exportSheetToCSV, copySheetToClipboardTSV } from '../utils/excelExport';

interface SpreadsheetTableProps {
  sheets: SheetData[];
  activeSheetIndex: number;
  onSelectSheet: (index: number) => void;
  onUpdateSheet: (updatedSheet: SheetData, sheetIndex: number) => void;
  onAddSheet: () => void;
  onDeleteSheet: (index: number) => void;
  onDuplicateSheet: (index: number) => void;
}

export const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  sheets,
  activeSheetIndex,
  onSelectSheet,
  onUpdateSheet,
  onAddSheet,
  onDeleteSheet,
  onDuplicateSheet,
}) => {
  const currentSheet = sheets[activeSheetIndex] || {
    id: 'default',
    name: 'Sheet1',
    columns: ['Column 1', 'Column 2'],
    rows: [['', '']],
  };

  // State for inline cell editing
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // State for editing column headers
  const [editingColIndex, setEditingColIndex] = useState<number | null>(null);
  const [editColValue, setEditColValue] = useState<string>('');

  // State for renaming sheet tab
  const [isRenamingSheet, setIsRenamingSheet] = useState<boolean>(false);
  const [newSheetName, setNewSheetName] = useState<string>('');

  // Filter / Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  // Selected row for actions
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const colInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when cell edit begins
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Auto-focus header input when column edit begins
  useEffect(() => {
    if (editingColIndex !== null && colInputRef.current) {
      colInputRef.current.focus();
      colInputRef.current.select();
    }
  }, [editingColIndex]);

  // Handle cell edit commit
  const handleCommitCell = () => {
    if (!editingCell) return;
    const { rowIndex, colIndex } = editingCell;

    const newRows = currentSheet.rows.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        const nextRow = [...row];
        nextRow[colIndex] = editValue;
        return nextRow;
      }
      return row;
    });

    onUpdateSheet(
      {
        ...currentSheet,
        rows: newRows,
      },
      activeSheetIndex
    );

    setEditingCell(null);
  };

  // Handle column header commit
  const handleCommitColumn = () => {
    if (editingColIndex === null) return;
    const trimmed = editColValue.trim() || `Column ${editingColIndex + 1}`;

    const newCols = [...currentSheet.columns];
    newCols[editingColIndex] = trimmed;

    onUpdateSheet(
      {
        ...currentSheet,
        columns: newCols,
      },
      activeSheetIndex
    );

    setEditingColIndex(null);
  };

  // Add new row
  const handleAddRow = () => {
    const emptyRow = new Array(currentSheet.columns.length).fill('');
    const newRows = [...currentSheet.rows, emptyRow];
    onUpdateSheet(
      {
        ...currentSheet,
        rows: newRows,
      },
      activeSheetIndex
    );
  };

  // Delete row
  const handleDeleteRow = (rowIndex: number) => {
    const newRows = currentSheet.rows.filter((_, idx) => idx !== rowIndex);
    onUpdateSheet(
      {
        ...currentSheet,
        rows: newRows.length > 0 ? newRows : [new Array(currentSheet.columns.length).fill('')],
      },
      activeSheetIndex
    );
    if (selectedRowIndex === rowIndex) {
      setSelectedRowIndex(null);
    }
  };

  // Add column
  const handleAddColumn = () => {
    const colNumber = currentSheet.columns.length + 1;
    const newCols = [...currentSheet.columns, `Column ${colNumber}`];
    const newRows = currentSheet.rows.map(row => [...row, '']);

    onUpdateSheet(
      {
        ...currentSheet,
        columns: newCols,
        rows: newRows,
      },
      activeSheetIndex
    );
  };

  // Delete column
  const handleDeleteColumn = (colIndex: number) => {
    if (currentSheet.columns.length <= 1) {
      return; // Keep at least one column
    }
    const newCols = currentSheet.columns.filter((_, idx) => idx !== colIndex);
    const newRows = currentSheet.rows.map(row => row.filter((_, idx) => idx !== colIndex));

    onUpdateSheet(
      {
        ...currentSheet,
        columns: newCols,
        rows: newRows,
      },
      activeSheetIndex
    );
  };

  // Rename sheet commit
  const handleCommitSheetName = () => {
    const trimmed = newSheetName.trim() || `Sheet ${activeSheetIndex + 1}`;
    onUpdateSheet(
      {
        ...currentSheet,
        name: trimmed,
      },
      activeSheetIndex
    );
    setIsRenamingSheet(false);
  };

  // Filtered rows for search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) {
      return currentSheet.rows.map((row, index) => ({ row, originalIndex: index }));
    }
    const q = searchQuery.toLowerCase();
    return currentSheet.rows
      .map((row, index) => ({ row, originalIndex: index }))
      .filter(({ row }) =>
        row.some(cell => String(cell).toLowerCase().includes(q))
      );
  }, [currentSheet.rows, searchQuery]);

  // Copy TSV
  const handleCopyTSV = async () => {
    const success = await copySheetToClipboardTSV(currentSheet);
    if (success) {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    }
  };

  // Keyboard navigation for cell editing
  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitCell();
      // Move to next row
      if (rowIndex + 1 < currentSheet.rows.length) {
        setEditingCell({ rowIndex: rowIndex + 1, colIndex });
        setEditValue(currentSheet.rows[rowIndex + 1][colIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCommitCell();
      // Move to next column
      if (colIndex + 1 < currentSheet.columns.length) {
        setEditingCell({ rowIndex, colIndex: colIndex + 1 });
        setEditValue(currentSheet.rows[rowIndex][colIndex + 1]);
      } else if (rowIndex + 1 < currentSheet.rows.length) {
        setEditingCell({ rowIndex: rowIndex + 1, colIndex: 0 });
        setEditValue(currentSheet.rows[rowIndex + 1][0]);
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Column letters (A, B, C... Z, AA, AB...)
  const getColLetter = (index: number): string => {
    let letter = '';
    let temp = index;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* 1. Sheets Tab Bar */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-0 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1 min-w-0">
          <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 py-1 mr-1">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
            Sheets ({sheets.length}):
          </div>

          {sheets.map((sheet, index) => {
            const isActive = index === activeSheetIndex;
            return (
              <div
                key={sheet.id || index}
                onClick={() => onSelectSheet(index)}
                className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-lg transition-all border-t border-l border-r cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-slate-200 dark:border-slate-800 shadow-sm -mb-[1px] pb-2'
                    : 'bg-slate-100/80 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                {isActive && isRenamingSheet ? (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={newSheetName}
                      onChange={e => setNewSheetName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleCommitSheetName();
                        if (e.key === 'Escape') setIsRenamingSheet(false);
                      }}
                      onBlur={handleCommitSheetName}
                      autoFocus
                      className="w-24 px-1 py-0.5 text-xs border rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-blue-500 outline-none"
                    />
                    <button
                      onClick={handleCommitSheetName}
                      className="text-green-600 dark:text-green-400 hover:text-green-700"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0" />
                    <span
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setNewSheetName(sheet.name);
                        setIsRenamingSheet(true);
                      }}
                      className="truncate max-w-[120px]"
                      title="Double click to rename"
                    >
                      {sheet.name}
                    </span>
                    <span className="text-[10px] opacity-60">
                      ({sheet.rows.length})
                    </span>
                  </>
                )}

                {/* Sheet Context actions */}
                {isActive && !isRenamingSheet && (
                  <div className="flex items-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewSheetName(sheet.name);
                        setIsRenamingSheet(true);
                      }}
                      title="Rename Sheet"
                      className="p-0.5 hover:text-blue-700"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    {sheets.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSheet(index);
                        }}
                        title="Delete Sheet"
                        className="p-0.5 hover:text-red-600 ml-0.5"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Sheet Button */}
          <button
            onClick={onAddSheet}
            title="Add New Blank Sheet"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sheet</span>
          </button>
        </div>

        {/* Action icons on right */}
        <div className="flex items-center gap-1 pb-1">
          <button
            onClick={() => onDuplicateSheet(activeSheetIndex)}
            title="Duplicate Active Sheet"
            className="p-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Top Spreadsheet Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {/* Left: Quick table mutation buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Row</span>
          </button>

          <button
            onClick={handleAddColumn}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Add Column</span>
          </button>

          {selectedRowIndex !== null && (
            <button
              onClick={() => handleDeleteRow(selectedRowIndex)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Row {selectedRowIndex + 1}</span>
            </button>
          )}

          <div className="hidden sm:block w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>{currentSheet.rows.length} rows</span>
            <span>•</span>
            <span>{currentSheet.columns.length} cols</span>
          </div>
        </div>

        {/* Right: Search + Export shortcuts */}
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none w-36 sm:w-44 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Copy TSV button */}
          <button
            onClick={handleCopyTSV}
            title="Copy as TSV (paste directly into Excel or Google Sheets)"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {copiedStatus ? (
              <>
                <ClipboardCheck className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy TSV</span>
              </>
            )}
          </button>

          {/* Export this sheet as CSV */}
          <button
            onClick={() => exportSheetToCSV(currentSheet, currentSheet.name)}
            title="Download CSV for this sheet"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 3. Excel Spreadsheet Grid */}
      <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50 relative">
        <table className="w-full border-collapse text-left text-xs font-sans">
          {/* Table Header */}
          <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800/90 backdrop-blur shadow-sm">
            <tr>
              {/* Row index corner cell */}
              <th className="w-12 min-w-12 px-2 py-2 text-center text-[10px] font-mono text-slate-400 dark:text-slate-500 border-r border-b border-slate-200 dark:border-slate-700 bg-slate-200/70 dark:bg-slate-800">
                #
              </th>

              {/* Column headers */}
              {currentSheet.columns.map((colName, colIdx) => (
                <th
                  key={colIdx}
                  className="group relative min-w-[130px] max-w-[280px] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 border-r border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase">
                        {getColLetter(colIdx)}
                      </span>

                      {editingColIndex === colIdx ? (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <input
                            ref={colInputRef}
                            type="text"
                            value={editColValue}
                            onChange={e => setEditColValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleCommitColumn();
                              if (e.key === 'Escape') setEditingColIndex(null);
                            }}
                            onBlur={handleCommitColumn}
                            className="w-full px-1.5 py-0.5 text-xs border rounded bg-white dark:bg-slate-900 border-blue-500 text-slate-900 dark:text-white outline-none"
                          />
                          <button
                            onClick={handleCommitColumn}
                            className="text-green-600 hover:text-green-700 p-0.5"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span
                          onDoubleClick={() => {
                            setEditingColIndex(colIdx);
                            setEditColValue(colName);
                          }}
                          className="truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          title="Double-click to rename column"
                        >
                          {colName}
                        </span>
                      )}
                    </div>

                    {/* Column controls on hover */}
                    {editingColIndex !== colIdx && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingColIndex(colIdx);
                            setEditColValue(colName);
                          }}
                          title="Rename column"
                          className="p-0.5 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        {currentSheet.columns.length > 1 && (
                          <button
                            onClick={() => handleDeleteColumn(colIdx)}
                            title="Delete this column"
                            className="p-0.5 text-slate-400 hover:text-red-600 ml-0.5"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={currentSheet.columns.length + 1}
                  className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                >
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No matching records found</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Clear search filter
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredRows.map(({ row, originalIndex }) => {
                const isSelected = selectedRowIndex === originalIndex;
                return (
                  <tr
                    key={originalIndex}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Row Index Indicator Cell */}
                    <td
                      onClick={() => setSelectedRowIndex(isSelected ? null : originalIndex)}
                      className="w-12 min-w-12 px-2 py-1.5 text-center text-[10px] font-mono text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      title="Click to select row"
                    >
                      {originalIndex + 1}
                    </td>

                    {/* Data Cells */}
                    {row.map((cellValue, colIdx) => {
                      const isEditing =
                        editingCell?.rowIndex === originalIndex &&
                        editingCell?.colIndex === colIdx;

                      // Highlight if search query matches
                      const isMatch =
                        searchQuery &&
                        String(cellValue).toLowerCase().includes(searchQuery.toLowerCase());

                      return (
                        <td
                          key={colIdx}
                          onClick={() => {
                            if (!isEditing) {
                              setEditingCell({ rowIndex: originalIndex, colIndex: colIdx });
                              setEditValue(cellValue || '');
                            }
                          }}
                          className={`min-w-[130px] max-w-[280px] px-3 py-1.5 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 cursor-text select-text ${
                            isEditing
                              ? 'p-0 ring-2 ring-blue-500 ring-inset z-10 bg-white dark:bg-slate-900'
                              : isMatch
                              ? 'bg-yellow-100/70 dark:bg-yellow-900/30'
                              : ''
                          }`}
                        >
                          {isEditing ? (
                            <input
                              ref={inputRef}
                              type="text"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => handleKeyDown(e, originalIndex, colIdx)}
                              onBlur={handleCommitCell}
                              className="w-full h-full px-3 py-1.5 bg-transparent border-0 outline-none text-xs text-slate-900 dark:text-white font-sans"
                            />
                          ) : (
                            <div className="truncate min-h-[1.25rem]">
                              {cellValue !== '' ? (
                                <span>{cellValue}</span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 italic select-none">
                                  —
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Bottom Table Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-3">
          <span>
            Showing <strong className="font-semibold text-slate-700 dark:text-slate-300">{filteredRows.length}</strong> of{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-300">{currentSheet.rows.length}</strong> rows
          </span>
          <span>•</span>
          <span>
            <strong className="font-semibold text-slate-700 dark:text-slate-300">{currentSheet.columns.length}</strong> columns
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">Tab</kbd> to move cells, <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">Enter</kbd> to save
          </span>
        </div>
      </div>
    </div>
  );
};
