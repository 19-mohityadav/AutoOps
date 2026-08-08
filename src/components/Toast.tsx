import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Bot } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss?: (id: string) => void;
  onClose?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss, onClose }) => {
  const dismissHandler = onDismiss || onClose || (() => {});
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissHandler} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      default:
        return <Bot className="w-5 h-5 text-teal-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/40 bg-slate-900/95';
      case 'error':
        return 'border-rose-500/40 bg-slate-900/95';
      default:
        return 'border-teal-500/40 bg-slate-900/95';
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start justify-between p-4 rounded-2xl border shadow-2xl backdrop-blur-md text-white transition-all transform animate-in slide-in-from-bottom-5 duration-300 ${getBorderColor()}`}
    >
      <div className="flex items-start space-x-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
            {toast.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-2 shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
