import React, { useState, useEffect } from 'react';
import { usePageTracker } from '../../hooks/usePageTracker';
import { X, Download, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function TrackingModal({ isOpen, onClose }) {
  const { getTrackingData, downloadTrackingData } = usePageTracker();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchIDB = async () => {
        setLoading(true);
        const records = await getTrackingData();
        // Sort descending to display newest sessions at the peak natively
        setHistory(records.sort((a, b) => b.timestamp - a.timestamp));
        setLoading(false);
      };
      fetchIDB();
    }
  }, [isOpen, getTrackingData]);

  if (!isOpen) return null;

  // Render raw tracking integers into human readable minutes/seconds cleanly arrays natively
  const formatMinSec = (ms) => {
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Backdrop Context */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Floating Centered Surface array */}
      <div className="theme-panel w-full max-w-2xl max-h-[90vh] overflow-hidden relative z-10 shadow-2xl flex flex-col p-6 md:p-8 scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Dismissal Toggle (Top Right X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-primary)] border border-transparent hover:border-[var(--border-divider)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all z-20 cursor-pointer"
          aria-label="Close Tracking Modal"
        >
          <X size={24} />
        </button>

        {/* IDB History Aggregation Viewer */}
        <div className="flex flex-col h-full min-h-[500px]">
          
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-[var(--border-divider)] gap-4">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Clock size={24} className="text-accent" />
                Local Device Tracking
                </h2>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                    Your offline reading session history.
                </p>
            </div>
            
          </div>

          <div className="overflow-y-auto overflow-x-hidden flex-1 space-y-4 pr-3 pb-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-50">
                  <Clock size={40} className="animate-spin text-accent mb-4" />
                  <p className="text-[var(--text-secondary)] font-medium">Decrypting Vault...</p>
              </div>
            ) : history.length > 0 ? (
              history.map((record, i) => (
                <div key={record.id || i} className="p-5 rounded-2xl border border-[var(--border-divider)] bg-[var(--bg-primary)] shadow-sm hover:shadow-md hover:border-accent/40 transition-all group">
                  <div className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center justify-between">
                    <span>{new Date(record.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2.5 py-1 rounded shadow-sm border border-[var(--border-divider)]">
                        {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-[var(--text-secondary)] pt-3 border-t border-[var(--border-divider)]">
                    <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span> 
                        <span className="font-medium">Active:</span> <strong className="text-[var(--text-primary)] text-base">{formatMinSec(record.activeTime)}</strong>
                    </span>
                    <span className="flex items-center gap-2 opacity-80">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> 
                        <span className="font-medium">Inactive:</span> <strong className="text-[var(--text-primary)] text-base">{formatMinSec(record.inactiveTime)}</strong>
                    </span>
                  </div>
                </div>
              ))
            ) : ( 
              <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-primary)] border-2 border-dashed border-[var(--border-divider)] flex items-center justify-center mb-4 text-[var(--text-secondary)]">?</div>
                  <p className="text-[var(--text-secondary)] font-medium text-lg">No tracking records exist.</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 opacity-60 max-w-sm">Close this tab later intentionally to generate and parse your very first device log safely.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border-divider)] flex justify-end">
            
            <button 
              onClick={downloadTrackingData}
              className="flex items-center gap-2 text-sm bg-accent hover:bg-[var(--color-accent-hover-light)] dark:hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg border border-transparent transition-all cursor-pointer font-bold shadow-sm active:scale-95"
            >
              <Download size={16} /> Save Data As JSON
            </button>
          </div>
        </div>
        
      </div>
    </div>,
    document.body
  );
}
