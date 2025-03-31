'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import Toast, { ToastProps } from './Toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData extends Omit<ToastProps, 'onClose'> {
  id: string;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default function ToastContainer({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Generate a unique ID for each toast
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  // Add a new toast
  const showToast = useCallback((message: string, type: ToastType, duration = 5000) => {
    const id = generateId();
    const newToast = {
      id,
      message,
      type,
      duration,
    };
    setToasts(prevToasts => [...prevToasts, newToast]);
    return id;
  }, []);

  // Remove a toast by ID
  const hideToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const value = {
    showToast,
    hideToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container fixed at the bottom right of the screen */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={hideToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
} 