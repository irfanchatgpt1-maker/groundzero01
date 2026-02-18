import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToCSV, exportToGoogleSheets } from '@/lib/export-utils';

interface ExportDropdownProps {
  data: Record<string, unknown>[];
  filename: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({ data, filename }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = (type: 'csv' | 'gsheet') => {
    if (data.length === 0) return;
    if (type === 'csv') exportToCSV(data, filename);
    else exportToGoogleSheets(data, filename);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-card dark:bg-card-dark border border-border text-muted-foreground px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-all shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px]">file_download</span>
        <span className="hidden sm:inline">Export</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 bg-card dark:bg-card-dark border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <button
              onClick={() => handleExport('gsheet')}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors"
            >
              <span className="material-icons text-green-600 text-lg">table_chart</span>
              Google Sheets (.tsv)
            </button>
            <div className="border-t border-border" />
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors"
            >
              <span className="material-icons text-blue-600 text-lg">description</span>
              CSV File (.csv)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
