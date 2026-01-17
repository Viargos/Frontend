import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangleIcon, CloseIcon } from '@/components/icons';

interface ErrorAlertProps {
  message: string | null;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div 
          className="w-full bg-red-50 border border-red-200 rounded-lg p-4"
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-red-800 font-medium text-sm mb-1">
                Unable to create journey
              </h4>
              <p className="text-red-700 text-sm">
                {message}
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
              title="Dismiss error"
            >
              <CloseIcon className="w-4 h-4 text-red-500" size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
