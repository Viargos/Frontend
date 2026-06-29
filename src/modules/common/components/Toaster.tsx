'use client';

import type { Toast } from '../hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '../hooks/use-toast';

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { id, type, message, description, duration = 4000 } = toast;

  useEffect(() => {
    if (duration === Infinity) {
      return;
    }
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />,
      border: 'border-emerald-500/20 dark:border-emerald-500/30',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    },
    error: {
      icon: <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />,
      border: 'border-red-500/20 dark:border-red-500/30',
      bg: 'bg-red-50/50 dark:bg-red-950/20',
    },
    info: {
      icon: <Info className="h-5 w-5 shrink-0 text-blue-500" />,
      border: 'border-blue-500/20 dark:border-blue-500/30',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />,
      border: 'border-amber-500/20 dark:border-amber-500/30',
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    },
  };

  const { icon, border, bg } = typeConfig[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`w-full max-w-sm overflow-hidden rounded-2xl border ${border} ${bg} shadow-lg backdrop-blur-md`}
    >
      <div className="flex items-start gap-3 p-4">
        {icon}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{message}</p>
          {description && (
            <p className="mt-1 text-xs leading-normal text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="shrink-0 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed top-20 right-4 z-[9999] flex w-full max-w-[380px] flex-col gap-3 px-4 sm:px-0">
      <div className="pointer-events-auto flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
