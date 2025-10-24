// src/components/sync/SyncSettings.styled.ts
import styled from 'styled-components';

export const SettingsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

export const SettingsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const SettingsLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: 500;
  cursor: pointer;
`;

export const SettingsCheckbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

export const SettingsSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.lightGrey};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1em;
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SettingsDescription = styled.p`
  font-size: 0.875em;
  color: ${({ theme }) => theme.colors.secondary};
  margin: ${({ theme }) => theme.spacing.xs} 0 0 0;
`;

export const AccountInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const AccountLabel = styled.div`
  font-size: 0.875em;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const AccountValue = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.lightGrey};
`;

export const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.875em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ theme, variant }) =>
    variant === 'danger' ? theme.colors.error : theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;
