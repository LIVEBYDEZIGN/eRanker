import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
  description?: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, altText, description }: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full bg-[#161618] rounded-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="relative">
          <img
            src={imageUrl}
            alt={altText}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          {description && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-white text-lg">{description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}