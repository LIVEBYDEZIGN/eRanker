import React from 'react';
import { X } from 'lucide-react';
import { HubspotCalendar } from './HubspotCalendar';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#161618] rounded-xl overflow-hidden border border-[#ff5702]/10"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="p-4">
          <HubspotCalendar />
        </div>
      </div>
    </div>
  );
}