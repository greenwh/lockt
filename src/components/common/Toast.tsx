// src/components/common/Toast.tsx

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300); // Match exit animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <ToastContainer $type={toast.type} $isExiting={isExiting}>
      <ToastIcon $type={toast.type}>{getIcon()}</ToastIcon>
      <ToastContent>
        <ToastMessage>{toast.message}</ToastMessage>
        {toast.action && (
          <ToastAction onClick={toast.action.onClick}>
            {toast.action.label}
          </ToastAction>
        )}
      </ToastContent>
      <DismissButton onClick={handleDismiss}>×</DismissButton>
    </ToastContainer>
  );
};

export default Toast;

// Toast Container Component
interface ToastContainerManagerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainerManager: React.FC<ToastContainerManagerProps> = ({ toasts, onDismiss }) => {
  return (
    <ToastList>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </ToastList>
  );
};

// Animations
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// Styled Components
const ToastList = styled.div`
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;

  @media (max-width: 768px) {
    left: 16px;
    right: 16px;
  }
`;

const ToastContainer = styled.div<{ $type: ToastType; $isExiting: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  max-width: 480px;
  padding: 16px;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  border-left: 4px solid ${(props) => {
    switch (props.$type) {
      case 'success':
        return props.theme.colors.success;
      case 'error':
        return props.theme.colors.error;
      case 'warning':
        return props.theme.colors.warning;
      case 'info':
        return props.theme.colors.primary;
      default:
        return props.theme.colors.border;
    }
  }};
  pointer-events: auto;
  animation: ${(props) => (props.$isExiting ? slideOut : slideIn)} 0.3s ease;

  @media (max-width: 768px) {
    min-width: auto;
    max-width: 100%;
  }
`;

const ToastIcon = styled.div<{ $type: ToastType }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
  background: ${(props) => {
    switch (props.$type) {
      case 'success':
        return props.theme.colors.success;
      case 'error':
        return props.theme.colors.error;
      case 'warning':
        return props.theme.colors.warning;
      case 'info':
        return props.theme.colors.primary;
      default:
        return props.theme.colors.border;
    }
  }}15;
  color: ${(props) => {
    switch (props.$type) {
      case 'success':
        return props.theme.colors.success;
      case 'error':
        return props.theme.colors.error;
      case 'warning':
        return props.theme.colors.warning;
      case 'info':
        return props.theme.colors.primary;
      default:
        return props.theme.colors.text;
    }
  }};
`;

const ToastContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ToastMessage = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${(props) => props.theme.colors.text};
`;

const ToastAction = styled.button`
  align-self: flex-start;
  padding: 4px 12px;
  background: transparent;
  color: ${(props) => props.theme.colors.primary};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.primary}15;
  }
`;

const DismissButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.text};
  }
`;
