"use client";

import { useCallback, useState } from "react";
import { ImageUploadIcon } from "@/components/icons";

interface DropzoneProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Dropzone({
  onFileSelect,
  accept,
  multiple = false,
  className = "",
  children,
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect(files);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`relative bg-black border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer transition-all duration-200 hover:border-gray-400 ${
        isDragOver ? "border-gray-400 bg-gray-900" : ""
      } ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => document.getElementById("dropzone-file-input")?.click()}
    >
      <input
        id="dropzone-file-input"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
      />
      
      {children || (
        <div className="text-white">
          <ImageUploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-lg font-medium text-white mb-2">
            {isDragOver ? "Drop files here" : "Drop files here or click to upload"}
          </div>
          <p className="text-sm text-gray-400">
            {accept ? `Supported formats: ${accept}` : "Any file type supported"}
          </p>
        </div>
      )}
    </div>
  );
}
