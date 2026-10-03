import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle2, Clock, BrainCircuit } from 'lucide-react';

interface ExtractionProgressProps {
  onCancel?: () => void;
}

const STEPS = [
  { id: 1, label: 'Uploading & Preprocessing Image', desc: 'Analyzing resolution and color space' },
  { id: 2, label: 'Gemini Vision Structure Detection', desc: 'Detecting grid boundaries, headers & sections' },
  { id: 3, label: 'OCR & Numerical Parsing', desc: 'Extracting cell values, dates, currencies and codes' },
  { id: 4, label: 'Building Excel Spreadsheet', desc: 'Structuring sheets and standardizing schema' },
];

export const ExtractionProgress: React.FC<ExtractionProgressProps> = ({ onCancel }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Progressively advance through the visual indicator steps
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2800);
    return () => clearInterval(stepInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Animated Icon Badge */}
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-5">
          <BrainCircuit className="w-8 h-8 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
            <Sparkles className="w-3 h-3 animate-spin" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
          Converting Image to Excel
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Gemini 3.8 Flash Vision is extracting tabular data with structured outputs
        </p>

        {/* Steps List */}
        <div className="space-y-3 text-left mb-6 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.id} className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold ${
                      isDone
                        ? 'text-slate-700 dark:text-slate-300'
                        : isCurrent
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timer & Cancel */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>Elapsed: {seconds}s</span>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
