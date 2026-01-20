import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatFileSize } from '@/lib/aws/media-upload';
import { UploadIcon, FileTextIcon, TrashIcon, PlayCircleIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

interface MediaItem {
  id: string;
  url: string;
  name?: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  onDelete?: (id: string) => void;
  onReorder?: (items: MediaItem[]) => void;
  className?: string;
  columns?: number;
  showLightbox?: boolean;
  showControls?: boolean;
  allowReorder?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  onDelete,
  onReorder,
  className = '',
  columns = 4,
  showLightbox = true,
  showControls = true,
  allowReorder = false,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;

      switch (e.key) {
        case 'Escape':
          setLightboxIndex(null);
          break;
        case 'ArrowLeft':
          setLightboxIndex(prev => prev === null ? null : Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          setLightboxIndex(prev => prev === null ? null : Math.min(items.length - 1, prev + 1));
          break;
      }
    };

    if (lightboxIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxIndex, items.length]);

  // Open lightbox
  const openLightbox = useCallback((index: number) => {
    if (showLightbox) {
      setLightboxIndex(index);
    }
  }, [showLightbox]);

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Navigate lightbox
  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    setLightboxIndex(prev => {
      if (prev === null) return null;
      if (direction === 'prev') {
        return Math.max(0, prev - 1);
      } else {
        return Math.min(items.length - 1, prev + 1);
      }
    });
  }, [items.length]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    if (!allowReorder) return;
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  }, [allowReorder]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (!allowReorder || !draggedItem) return;
    e.preventDefault();
    setDragOverIndex(index);
  }, [allowReorder, draggedItem]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    if (!allowReorder || !draggedItem || !onReorder) return;
    e.preventDefault();

    const dragIndex = items.findIndex(item => item.id === draggedItem);
    if (dragIndex === -1 || dragIndex === dropIndex) return;

    const newItems = [...items];
    const [draggedItemData] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItemData);

    onReorder(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  }, [allowReorder, draggedItem, items, onReorder]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverIndex(null);
  }, []);

  // Get file type from URL or type field
  const getFileType = useCallback((item: MediaItem): 'image' | 'video' | 'other' => {
    if (item.type) {
      if (item.type.startsWith('image/')) return 'image';
      if (item.type.startsWith('video/')) return 'video';
    }

    // Fallback: check URL extension
    const url = item.url.toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/.test(url)) return 'image';
    if (/\.(mp4|mov|avi|mkv|webm)($|\?)/.test(url)) return 'video';

    return 'other';
  }, []);

  // Generate grid columns class
  const getGridCols = useCallback(() => {
    const colsMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };
    return colsMap[columns] || colsMap[4];
  }, [columns]);

  if (items.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <UploadIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">No media files</p>
        <p className="text-gray-400 text-sm">Upload some files to see them here</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Media Grid */}
      <div className={`grid gap-4 ${getGridCols()}`}>
        {items.map((item, index) => {
          const fileType = getFileType(item);
          const isDragging = draggedItem === item.id;
          const isDragOver = dragOverIndex === index;

          return (
            <motion.div
              key={item.id}
              className={`
                relative group aspect-square bg-gray-100 rounded-lg overflow-hidden
                ${showLightbox ? 'cursor-pointer' : ''}
                ${allowReorder ? 'cursor-move' : ''}
                ${isDragging ? 'opacity-50' : ''}
                ${isDragOver ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => openLightbox(index)}
              draggable={allowReorder}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.02 }}
              layout
            >
              {/* Media Content */}
              {fileType === 'image' ? (
                <img
                  src={item.url}
                  alt={item.name || 'Media'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : fileType === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <FileTextIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Media Info Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2">
                  {item.name && (
                    <p className="text-white text-xs font-medium truncate">
                      {item.name}
                    </p>
                  )}
                  {item.size && (
                    <p className="text-white/80 text-xs">
                      {formatFileSize(item.size)}
                    </p>
                  )}
                </div>
              </div>

              {/* Controls */}
              {showControls && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    {onDelete && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </motion.button>
                    )}
                  </div>
                </div>
              )}

              {/* Video Play Icon */}
              {fileType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-3">
                    <PlayCircleIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              >
                <XIcon className="w-8 h-8" />
              </button>

              {/* Navigation */}
              {items.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox('prev');
                    }}
                    disabled={lightboxIndex === 0}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors z-10"
                  >
                    <ChevronLeftIcon className="w-8 h-8" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateLightbox('next');
                    }}
                    disabled={lightboxIndex === items.length - 1}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors z-10"
                  >
                    <ChevronRightIcon className="w-8 h-8" />
                  </button>
                </>
              )}

              {/* Media Content */}
              <motion.div
                key={lightboxIndex}
                className="max-w-full max-h-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const item = items[lightboxIndex];
                  const fileType = getFileType(item);

                  if (fileType === 'image') {
                    return (
                      <img
                        src={item.url}
                        alt={item.name || 'Media'}
                        className="max-w-full max-h-full object-contain"
                      />
                    );
                  } else if (fileType === 'video') {
                    return (
                      <video
                        src={item.url}
                        controls
                        autoPlay
                        className="max-w-full max-h-full"
                      />
                    );
                  }

                  return (
                    <div className="bg-white rounded-lg p-8 text-center">
                      <FileTextIcon className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-900 font-medium">{item.name || 'Unknown file'}</p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-[#160E53] transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  );
                })()}
              </motion.div>

              {/* Counter */}
              {items.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                  {lightboxIndex + 1} of {items.length}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;
