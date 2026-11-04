import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-card shadow-xl border transition-all animate-fade-in ${
            toast.type === 'success'
              ? 'bg-white text-ink border-brand-line'
              : toast.type === 'error'
              ? 'bg-white text-ink border-rose-200'
              : 'bg-white text-ink border-line'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-brand" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-brand" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm leading-snug">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{toast.message}</p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-ink-muted hover:text-ink transition-colors p-0.5"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
