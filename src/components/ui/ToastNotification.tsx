import React, { createContext, useContext, useState, useCallback } from 'react';
import { Info, AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl transition-all duration-300 animate-slideUp text-xs font-mono ${
              toast.type === 'error'
                ? 'bg-rose-950/85 border-rose-500/40 text-rose-200'
                : toast.type === 'success'
                ? 'bg-emerald-950/85 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-900/85 border-cyan-500/30 text-cyan-200'
            }`}
          >
            {toast.type === 'error' && <AlertCircle size={16} className="text-rose-400 shrink-0" />}
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
            {toast.type === 'info' && <Info size={16} className="text-cyan-400 shrink-0" />}
            <span className="flex-1 font-sans-clean">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white p-1 rounded focus:outline-none"
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
