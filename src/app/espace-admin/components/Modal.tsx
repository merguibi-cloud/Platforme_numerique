"use client";
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  isConfirm?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  title = 'Information', 
  message, 
  type = 'info',
  isConfirm = false,
  onConfirm,
  onCancel
}: ModalProps) => {
  
  useEffect(() => {
    if (isOpen) {
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
      
      // Fermer avec Escape
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✓',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800'
        };
      case 'warning':
        return {
          icon: '⚠',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800'
        };
      case 'error':
        return {
          icon: '✕',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800'
        };
      default:
        return {
          icon: 'ℹ',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#F8F5E4] border-2 border-[#032622] rounded-lg shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#032622]">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeStyles.iconBg}`}>
              <span className={`text-lg font-bold ${typeStyles.iconColor}`}>
                {typeStyles.icon}
              </span>
            </div>
            <h3 
              className={`text-lg font-bold ${typeStyles.titleColor}`}
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#032622] hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p 
            className="text-[#032622] text-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-termina-medium)' }}
          >
            {message}
          </p>
        </div>
        
        {/* Footer */}
        <div className={`flex ${isConfirm ? 'justify-between' : 'justify-end'} p-4 border-t border-[#032622]`}>
          {isConfirm ? (
            <>
              <button
                onClick={onCancel || onClose}
                className="bg-gray-500 text-white px-6 py-2 font-bold hover:bg-gray-600 transition-colors rounded"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                ANNULER
              </button>
              <button
                onClick={onConfirm}
                className="bg-[#032622] text-[#F8F5E4] px-6 py-2 font-bold hover:bg-[#032622]/90 transition-colors rounded"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                CONFIRMER
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="bg-[#032622] text-[#F8F5E4] px-6 py-2 font-bold hover:bg-[#032622]/90 transition-colors rounded"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
