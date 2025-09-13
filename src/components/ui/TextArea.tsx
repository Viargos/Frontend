"use client";

import React, { forwardRef } from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = "", label, error, helperText, ...props }, ref) => {
    const baseClasses = `
      w-full px-3 py-2 border rounded-lg
      text-gray-900 bg-white
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      transition-colors duration-200
      resize-vertical
    `;

    const errorClasses = error
      ? "border-red-300 focus:ring-red-500"
      : "border-gray-300 hover:border-gray-400";

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${className}`.trim()}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
