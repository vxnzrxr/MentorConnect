import React, { useEffect, useRef } from 'react';

function LogoutModal({ isOpen, onClose, onConfirm }) {
  const firstButtonRef = useRef(null);
  const lastButtonRef = useRef(null);

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen) {
      // Focus the "Tidak" button when modal opens
      firstButtonRef.current?.focus();
      
      // Prevent background scroll
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        // Basic focus trap
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstButtonRef.current) {
              e.preventDefault();
              lastButtonRef.current?.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastButtonRef.current) {
              e.preventDefault();
              firstButtonRef.current?.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all duration-200 scale-100 opacity-100">
        {/* Modal Header */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <i className="fas fa-sign-out-alt text-red-600 text-xl"></i>
            </div>
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg font-medium text-gray-900">
              Konfirmasi Logout
            </h3>
            <p className="text-sm text-gray-500">
              Tindakan ini akan mengakhiri sesi Anda
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="mb-6">
          <p className="text-gray-600">
            Apakah Anda ingin logout dari akun ini? Anda akan kembali ke halaman utama dan perlu login ulang untuk mengakses dashboard.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3">
          <button
            ref={firstButtonRef}
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <i className="fas fa-times mr-2"></i>
            Tidak
          </button>
          <button
            ref={lastButtonRef}
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Iya, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
