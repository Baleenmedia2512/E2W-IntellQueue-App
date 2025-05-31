// components/ToastContainer.jsx
"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Expose a global function to trigger toasts
    window.showCustomToast = (title, message, link, router) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, message, link, router }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000); // Auto-dismiss after 5s
    };
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return createPortal(
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] w-full max-w-sm px-4 sm:px-0 pointer-events-none">
      <div className="relative group/container pointer-events-auto" style={{ minHeight: '80px' }}>
        {toasts.map((toast, index) => (
          <ToastItem 
            key={toast.id} 
            {...toast} 
            onDismiss={() => dismissToast(toast.id)}
            index={index}
            total={toasts.length}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

const ToastItem = ({ title, message, link, router, onDismiss, index, total }) => {
  return (
    <div 
      className="absolute top-0 left-0 w-full bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-black/5 rounded-xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4 transition-all duration-300 group-hover/container:shadow-xl group-hover/container:shadow-black/10"
      style={{
        transform: `translateY(${index * 8}px) scale(${1 - (index * 0.015)})`,
        zIndex: total - index,
        '--hover-transform': `translateY(${index * 80}px) scale(1)`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = e.currentTarget.style.getPropertyValue('--hover-transform');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `translateY(${index * 8}px) scale(${1 - (index * 0.015)})`;
      }}
    >
      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 sm:mt-2.5 shadow-sm"></div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 text-sm leading-5 mb-1">{title}</div>
        <div className="text-gray-600 text-xs sm:text-sm leading-relaxed">{message}</div>
        {link && (
          <button
            onClick={() => router.push(link)}
            className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center gap-1 group/link"
          >
            More info
            <svg className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      
      <button 
        onClick={onDismiss} 
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 opacity-0 group-hover/container:opacity-100 touch-manipulation"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};