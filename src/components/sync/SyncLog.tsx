// src/components/sync/SyncLog.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { syncLogService } from '../../services/synclog.service';
import type { SyncLogEntry, SyncLogAction } from '../../types/sync.types';

const ACTION_CONFIG: Record<SyncLogAction, { icon: string; label: string }> = {
  'upload': { icon: '\u2B06\uFE0F', label: 'Uploaded' },
  'download': { icon: '\u2B07\uFE0F', label: 'Downloaded' },
  'conflict-resolved-local': { icon: '\u2705', label: 'Conflict: Kept Local' },
  'conflict-resolved-remote': { icon: '\u2705', label: 'Conflict: Kept Remote' },
  'conflict-resolved-merge': { icon: '\uD83D\uDD00', label: 'Conflict: Merged' },
  'auto-connect': { icon: '\uD83D\uDD17', label: 'Auto-Connected' },
  'error': { icon: '\u274C', label: 'Error' },
  'force-upload': { icon: '\u23CF\uFE0F', label: 'Force Uploaded' },
  'force-download': { icon: '\u23CF\uFE0F', label: 'Force Downloaded' },
};

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

const SyncLog: React.FC = () => {
  const [entries, setEntries] = useState<SyncLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    setLoading(true);
    const data = await syncLogService.getEntries();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleClear = async () => {
    await syncLogService.clear();
    setEntries([]);
  };

  if (loading) {
    return <Container><EmptyState>Loading...</EmptyState></Container>;
  }

  if (entries.length === 0) {
    return (
      <Container>
        <EmptyState>No sync activity yet. Connect to OneDrive and sync to see history here.</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <LogList>
        {entries.map((entry) => {
          const config = ACTION_CONFIG[entry.action];
          return (
            <LogItem key={entry.id} $isError={entry.action === 'error'}>
              <LogIcon>{config.icon}</LogIcon>
              <LogContent>
                <LogAction>{config.label}</LogAction>
                <LogSummary>{entry.summary}</LogSummary>
                {entry.error && <LogError>{entry.error}</LogError>}
              </LogContent>
              <LogTime>{getRelativeTime(entry.timestamp)}</LogTime>
            </LogItem>
          );
        })}
      </LogList>
      <ClearButton onClick={handleClear}>Clear History</ClearButton>
    </Container>
  );
};

export default SyncLog;

// Styled Components
const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

const EmptyState = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 400px;
  overflow-y: auto;
`;

const LogItem = styled.div<{ $isError: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme, $isError }) => ($isError ? `${theme.colors.error}10` : theme.colors.surface)};

  &:hover {
    background: ${({ theme, $isError }) => ($isError ? `${theme.colors.error}18` : theme.colors.background)};
  }
`;

const LogIcon = styled.span`
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const LogContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const LogAction = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const LogSummary = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 2px 0 0 0;
  line-height: 1.3;
`;

const LogError = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.error};
  margin: 4px 0 0 0;
`;

const LogTime = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-shrink: 0;
  white-space: nowrap;
  margin-top: 2px;
`;

const ClearButton = styled.button`
  display: block;
  margin: ${({ theme }) => theme.spacing.md} auto 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.error};
    border-color: ${({ theme }) => theme.colors.error};
  }
`;
