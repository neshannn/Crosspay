'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              onClose={() => removeToast(toast.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast, onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="text-black" size={20} />,
    error: <AlertCircle className="text-black" size={20} />,
    info: <Info className="text-black" size={20} />,
    warning: <AlertTriangle className="text-black" size={20} />,
  };

  const bgColors = {
    success: 'bg-brutalist-green',
    error: 'bg-red-500',
    info: 'bg-brutalist-cyan',
    warning: 'bg-brutalist-yellow',
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 100, opacity: 0, scale: 0.8 }}
      className={`
        pointer-events-auto
        flex items-center gap-4 p-4 border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        min-w-[300px] max-w-md ${bgColors[toast.type]}
      `}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-white border-[2px] border-black flex items-center justify-center">
        {icons[toast.type]}
      </div>
      <p className="flex-grow font-black uppercase text-xs tracking-tight text-black leading-tight">
        {toast.message}
      </p>
      <button 
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-black/10 transition-colors"
      >
        <X size={18} />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
