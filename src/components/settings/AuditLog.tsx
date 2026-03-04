// src/components/settings/AuditLog.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { auditLogService } from '../../services/auditlog.service';
import type { AuditLogEntry, AuditLogAction } from '../../services/auditlog.service';

const ACTION_CONFIG: Record<AuditLogAction, { icon: string; label: string }> = {
  'added': { icon: '➕', label: 'Added' },
  'edited': { icon: '✏️', label: 'Edited' },
  'deleted': { icon: '🗑️', label: 'Deleted' },
};

const CATEGORY_LABELS: Record<string, string> = {
  passwords: 'Passwords',
  creditCards: 'Credit Cards',
  crypto: 'Crypto',
  freetext: 'Freetext',
  providers: 'Health Providers',
  conditions: 'Health Conditions',
  impairments: 'Health Impairments',
  journal: 'Health Journal',
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

const AuditLog: React.FC = () => {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    setLoading(true);
    const data = await auditLogService.getEntries();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleClear = async () => {
    await auditLogService.clear();
    setEntries([]);
  };

  if (loading) {
    return <Container><EmptyState>Loading...</EmptyState></Container>;
  }

  if (entries.length === 0) {
    return (
      <Container>
        <EmptyState>No data changes recorded yet. Add, edit, or delete entries to see history here.</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <LogList>
        {entries.map((entry) => {
          const config = ACTION_CONFIG[entry.action];
          const categoryLabel = CATEGORY_LABELS[entry.category] || entry.category;
          return (
            <LogItem key={entry.id} $isDelete={entry.action === 'deleted'}>
              <LogIcon>{config.icon}</LogIcon>
              <LogContent>
                <LogAction>{config.label}</LogAction>
                <LogSummary>
                  <strong>{entry.entryName}</strong> in {categoryLabel}
                </LogSummary>
                {entry.changedFields && entry.changedFields.length > 0 && (
                  <LogFields>Changed: {entry.changedFields.join(', ')}</LogFields>
                )}
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

export default AuditLog;

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

const LogItem = styled.div<{ $isDelete: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme, $isDelete }) => ($isDelete ? `${theme.colors.error}10` : theme.colors.surface)};

  &:hover {
    background: ${({ theme, $isDelete }) => ($isDelete ? `${theme.colors.error}18` : theme.colors.background)};
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

const LogFields = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 2px 0 0 0;
  font-style: italic;
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
