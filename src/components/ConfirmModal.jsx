import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion", 
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-[#E8E4DC] shadow-2xl space-y-4">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
            {title}
          </h3>
          <p className="text-sm text-[#6B6864] mt-2 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#1A1A1A] bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
