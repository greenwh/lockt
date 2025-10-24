// src/components/sync/SyncStatus.styled.ts
import styled from 'styled-components';

export const SyncStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

export const StatusIcon = styled.span<{ status: string }>`
  font-size: 1.2em;
  animation: ${({ status }) => (status === 'syncing' ? 'rotate 1s linear infinite' : 'none')};

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const StatusText = styled.span<{ status: string }>`
  font-size: 0.875em;
  color: ${({ theme, status }) => {
    switch (status) {
      case 'success':
        return theme.colors.success;
      case 'error':
      case 'conflict':
        return theme.colors.error;
      case 'offline':
        return theme.colors.secondary;
      default:
        return theme.colors.text;
    }
  }};
  font-weight: 500;
`;

export const LastSyncTime = styled.span`
  font-size: 0.75em;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const SyncButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2em;
  border-radius: ${({ theme }) => theme.borderRadius};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.lightGrey};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
