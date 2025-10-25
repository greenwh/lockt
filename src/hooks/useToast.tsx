// src/hooks/useToast.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainerManager } from '../components/common/Toast';
import type { ToastMessage, ToastType } from '../components/common/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number, action?: { label: string; onClick: () => void }) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number, action?: { label: string; onClick: () => void }) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      duration: number = 5000,
      action?: { label: string; onClick: () => void }
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastMessage = {
        id,
        type,
        message,
        duration,
        action,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const success = useCallback(
    (message: string, duration: number = 5000) => {
      showToast(message, 'success', duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration: number = 5000, action?: { label: string; onClick: () => void }) => {
      showToast(message, 'error', duration, action);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration: number = 5000) => {
      showToast(message, 'warning', duration);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration: number = 5000) => {
      showToast(message, 'info', duration);
    },
    [showToast]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainerManager toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
