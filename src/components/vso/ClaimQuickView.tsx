// src/components/vso/ClaimQuickView.tsx
import React from 'react';
import type { VSOClaim } from '../../types/data.types';
import styled from 'styled-components';

interface ClaimQuickViewProps {
  entry: VSOClaim;
  onSelect: (entry: VSOClaim) => void;
  onDelete?: (entryId: string) => void;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  'planning': { bg: '#cce5ff', color: '#004085' },
  'intent-filed': { bg: '#fff3cd', color: '#856404' },
  'filed': { bg: '#d4edda', color: '#155724' },
  'pending-development': { bg: '#e8daef', color: '#6c3483' },
  'c-and-p-scheduled': { bg: '#fdebd0', color: '#935116' },
  'c-and-p-completed': { bg: '#d5f5e3', color: '#1e8449' },
  'rating-decision': { bg: '#d6eaf8', color: '#2e4053' },
  'appealing': { bg: '#fadbd8', color: '#922b21' },
  'granted': { bg: '#abebc6', color: '#1e8449' },
  'denied': { bg: '#f5b7b1', color: '#922b21' },
};

const typeColors: Record<string, { bg: string; color: string }> = {
  'direct': { bg: '#d4edda', color: '#155724' },
  'secondary': { bg: '#cce5ff', color: '#004085' },
  'presumptive': { bg: '#e8daef', color: '#6c3483' },
  'aggravation': { bg: '#fadbd8', color: '#922b21' },
  'increase': { bg: '#fff3cd', color: '#856404' },
};

const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGrey};
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const Cell = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badge = styled.span<{ $bg: string; $color: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const ClaimQuickView: React.FC<ClaimQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const statusStyle = statusColors[entry.status] || statusColors.planning;
  const typeStyle = typeColors[entry.claimType] || typeColors.direct;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(entry.id);
  };

  return (
    <Row onClick={() => onSelect(entry)}>
      <Cell>{entry.claimName}</Cell>
      <Cell>{entry.diagnosticCode}</Cell>
      <Cell>
        <Badge $bg={statusStyle.bg} $color={statusStyle.color}>{entry.status}</Badge>
      </Cell>
      <Cell>
        <Badge $bg={typeStyle.bg} $color={typeStyle.color}>{entry.claimType}</Badge>
      </Cell>
      <Cell>{entry.filingDeadline || '-'}</Cell>
      {onDelete && (
        <Cell>
          <button
            onClick={handleDelete}
            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.2em' }}
            aria-label="Delete entry"
          >
            {'\uD83D\uDDD1\uFE0F'}
          </button>
        </Cell>
      )}
    </Row>
  );
};

export default ClaimQuickView;
