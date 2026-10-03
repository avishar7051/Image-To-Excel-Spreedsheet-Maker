import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  Eye,
  Columns,
  Table as TableIcon,
  CheckCircle,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Zap,
  Info
} from 'lucide-react';
import { SheetData, ExtractionMode, ExtractionOptions, ViewLayout } from './types';
import { exportToExcel } from './utils/excelExport';
import { SAMPLE_IMAGES, SampleItem } from './utils/sampleImages';
import { Navbar } from './components/Navbar';
import { ImageViewer } from './components/ImageViewer';
import { SpreadsheetTable } from './components/SpreadsheetTable';
import { ExtractionProgress } from './components/ExtractionProgress';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // API Key Status
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Uploaded Image State
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [imageSize, setImageSize] = useState<string>('');
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');

  // Extraction State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractionNotes, setExtractionNotes] = useState<string | null>(null);
  const [detectedTableCount, setDetectedTableCount] = useState<number>(0);

  // Sheets Data
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);

  // View / Layout
  const [viewLayout, setViewLayout] = useState<ViewLayout>('split');
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Extraction Options
  const [options, setOptions] = useState<ExtractionOptions>({
    mode: 'standard',
    customInstructions: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Dark Mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Check backend health
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (typeof data.hasApiKey === 'boolean') {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch(() => {
        // Dev server fallback
      });
  }, []);

  // Format file size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Process File selection
  const handleFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    setErrorMessage(null);
    setExtractionNotes(null);
    setImageName(file.name);
    setImageSize(formatBytes(file.size));
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setImageDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Load sample image
  const handleSelectSample = (sample: SampleItem) => {
    setErrorMessage(null);
    setExtractionNotes(null);
    setImageName(`${sample.title}.svg`);
    setImageSize('Vector SVG Table');
    setImageMimeType(sample.mimeType);
    setImageDataUrl(sample.dataUrl);

    // Auto set appropriate mode if financial or multi-section
    if (sample.id === 'sample-finance') {
      setOptions(prev => ({ ...prev, mode: 'financial' }));
    } else if (sample.id === 'sample-multitable') {
      setOptions(prev => ({ ...prev, mode: 'multi_section' }));
    } else if (sample.id === 'sample-invoice') {
      setOptions(prev => ({ ...prev, mode: 'receipt' }));
    }
  };

  // Execute Gemini AI Conversion
  const handleConvert = async () => {
    if (!imageDataUrl) {
      setErrorMessage('Please select or drop an image first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setExtractionNotes(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageDataUrl,
          mimeType: imageMimeType,
          mode: options.mode,
          customInstructions: options.customInstructions,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to extract data from image.');
      }

      if (!data.sheets || data.sheets.length === 0) {
        throw new Error('No tabular structure was detected in this image. Try another image or adjust extraction instructions.');
      }

      // Add unique IDs to sheets for React keys
      const preparedSheets: SheetData[] = data.sheets.map((sheet: any, idx: number) => ({
        id: `sheet-${Date.now()}-${idx}`,
        name: sheet.name || `Sheet${idx + 1}`,
        columns: sheet.columns || ['Column 1'],
        rows: sheet.rows || [],
      }));

      setSheets(preparedSheets);
      setActiveSheetIndex(0);
      setDetectedTableCount(data.detectedTableCount || preparedSheets.length);
      if (data.notes) {
        setExtractionNotes(data.notes);
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      setErrorMessage(err.message || 'An error occurred during AI extraction.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Sheet operations
  const handleUpdateSheet = (updatedSheet: SheetData, sheetIndex: number) => {
    setSheets(prev => {
      const next = [...prev];
      next[sheetIndex] = updatedSheet;
      return next;
    });
  };

  const handleAddSheet = () => {
    const newSheetNumber = sheets.length + 1;
    const newSheet: SheetData = {
      id: `sheet-${Date.now()}`,
      name: `Sheet${newSheetNumber}`,
      columns: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        ['', '', ''],
        ['', '', ''],
      ],
    };
    setSheets(prev => [...prev, newSheet]);
    setActiveSheetIndex(sheets.length);
  };

  const handleDeleteSheet = (index: number) => {
    if (sheets.length <= 1) return;
    setSheets(prev => prev.filter((_, idx) => idx !== index));
    if (activeSheetIndex >= index && activeSheetIndex > 0) {
      setActiveSheetIndex(prev => prev - 1);
    }
  };

  const handleDuplicateSheet = (index: number) => {
    const source = sheets[index];
    if (!source) return;

    const copy: SheetData = {
      id: `sheet-${Date.now()}`,
      name: `${source.name} Copy`.substring(0, 30),
      columns: [...source.columns],
      rows: source.rows.map(r => [...r]),
    };

    setSheets(prev => [...prev, copy]);
    setActiveSheetIndex(sheets.length);
  };

  // Export to Excel
  const handleExportAllToExcel = () => {
    if (sheets.length === 0) return;
    const baseName = imageName.replace(/\.[^/.]+$/, '') || 'Extracted_Data';
    exportToExcel(sheets, baseName);
  };

  // Reset / Change Image
  const handleResetImage = () => {
    setImageDataUrl(null);
    setImageName('');
    setImageSize('');
    setSheets([]);
    setErrorMessage(null);
    setExtractionNotes(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        hasApiKey={hasApiKey}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 gap-5">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                  Notice
                </h4>
                <p className="text-xs mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Informational Extraction Notes (e.g., Currency notes, detected sections) */}
        {extractionNotes && (
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-xs">
            <Info className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold">AI Detection Notes:</strong> {extractionNotes}
            </div>
          </div>
        )}

        {/* SECTION 1: When No Image Uploaded - Hero Dropzone + Sample Cards */}
        {!imageDataUrl ? (
          <div className="flex-1 flex flex-col justify-center items-center py-6 sm:py-10 max-w-4xl mx-auto w-full">
            {/* Hero Text */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/40 text-xs font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Next-Gen Table Recognition</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Turn any image into a formatted{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Excel Spreadsheet
                </span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Upload receipts, invoices, screenshots, or financial statements. Gemini AI detects tables, multi-column layouts, and exports native .xlsx files.
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden group ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500/70 hover:bg-slate-50/60 dark:hover:bg-slate-850 shadow-sm'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                Click to browse or drop your document here
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Supports PNG, JPG, JPEG, WEBP, and screenshots (up to 25MB)
              </p>

              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity">
                <span>Select from Computer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Built-in Preset Samples */}
            <div className="w-full mt-10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Or test with 1-click sample documents:
                </h4>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  No upload required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {SAMPLE_IMAGES.map(sample => (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                          {sample.badge}
                        </span>
                        <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {sample.title}
                      </h5>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {sample.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Load sample</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* SECTION 2: Image Loaded Workspace */
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Top Interactive Workspace Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {/* Left: Conversion action + Options */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{sheets.length > 0 ? 'Re-extract with AI' : 'Convert to Excel'}</span>
                </button>

                {/* AI Configuration Options Popover Toggle */}
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    showOptions
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Extraction Options</span>
                </button>

                {/* Reset button */}
                <button
                  onClick={handleResetImage}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Change Image
                </button>
              </div>

              {/* Right: Layout Switcher + Primary Download (.xlsx) */}
              <div className="flex items-center gap-2">
                {/* View Layout Controls (Split, Table Only, Image Only) */}
                <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                  <button
                    onClick={() => setViewLayout('split')}
                    title="Side-by-side View"
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                      viewLayout === 'split'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Split</span>
                  </button>

                  <button
                    onClick={() => setViewLayout('table-only')}
                    title="Spreadsheet View Only"
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                      viewLayout === 'table-only'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>

                  <button
                    onClick={() => setViewLayout('image-only')}
                    title="Image View Only"
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                      viewLayout === 'image-only'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Image</span>
                  </button>
                </div>

                {/* Main Download Button */}
                <button
                  onClick={handleExportAllToExcel}
                  disabled={sheets.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .XLSX</span>
                  {sheets.length > 1 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-800/60 text-[10px]">
                      {sheets.length} sheets
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Options Drawer */}
            {showOptions && (
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Extraction Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'standard', label: 'Standard Table', desc: 'General spreadsheets & grids' },
                      { id: 'receipt', label: 'Itemized Receipt', desc: 'Line items, tax, subtotals' },
                      { id: 'financial', label: 'Financial Matrix', desc: 'P&L, balance sheets, balance' },
                      { id: 'multi_section', label: 'Multi-Section Split', desc: 'Isolate multiple tables to tabs' },
                    ].map(modeItem => (
                      <button
                        key={modeItem.id}
                        type="button"
                        onClick={() =>
                          setOptions(prev => ({ ...prev, mode: modeItem.id as ExtractionMode }))
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          options.mode === modeItem.id
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <p className="font-semibold text-xs">{modeItem.label}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {modeItem.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom Prompt Hints (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Ignore handwritten notes at the top, format dates as YYYY-MM-DD, split the two side-by-side tables into Sheet1 and Sheet2..."
                    value={options.customInstructions}
                    onChange={e =>
                      setOptions(prev => ({ ...prev, customInstructions: e.target.value }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Split Screen Workspace Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[560px]">
              {/* Left Column: Image Viewer */}
              {(viewLayout === 'split' || viewLayout === 'image-only') && (
                <div
                  className={`h-full min-h-[400px] flex flex-col ${
                    viewLayout === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'
                  }`}
                >
                  <ImageViewer
                    imageSrc={imageDataUrl}
                    imageName={imageName}
                    fileSize={imageSize}
                    onReplaceImage={handleResetImage}
                  />
                </div>
              )}

              {/* Right Column: Spreadsheet Editor */}
              {(viewLayout === 'split' || viewLayout === 'table-only') && (
                <div
                  className={`h-full min-h-[400px] flex flex-col ${
                    viewLayout === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'
                  }`}
                >
                  {sheets.length > 0 ? (
                    <SpreadsheetTable
                      sheets={sheets}
                      activeSheetIndex={activeSheetIndex}
                      onSelectSheet={setActiveSheetIndex}
                      onUpdateSheet={handleUpdateSheet}
                      onAddSheet={handleAddSheet}
                      onDeleteSheet={handleDeleteSheet}
                      onDuplicateSheet={handleDuplicateSheet}
                    />
                  ) : (
                    /* Placeholder before user clicks Convert */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                        <FileSpreadsheet className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Ready to Extract Table Data
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                        Click "Convert to Excel" above to run Gemini multimodal vision and build your interactive spreadsheet.
                      </p>
                      <button
                        onClick={handleConvert}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Run AI Table Extraction</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Fullscreen Loading Modal during Gemini Processing */}
      {isProcessing && (
        <ExtractionProgress onCancel={() => setIsProcessing(false)} />
      )}
    </div>
  );
}
