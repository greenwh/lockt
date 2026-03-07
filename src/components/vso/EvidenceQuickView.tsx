// src/components/vso/EvidenceQuickView.tsx
import React from 'react';
import type { VSOEvidence } from '../../types/data.types';
import styled from 'styled-components';

interface EvidenceQuickViewProps {
  entry: VSOEvidence;
  onSelect: (entry: VSOEvidence) => void;
  onDelete?: (entryId: string) => void;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  'obtained': { bg: '#d4edda', color: '#155724' },
  'pending-request': { bg: '#fff3cd', color: '#856404' },
  'needed': { bg: '#f5b7b1', color: '#922b21' },
  'in-progress': { bg: '#cce5ff', color: '#004085' },
  'submitted-to-va': { bg: '#abebc6', color: '#1e8449' },
};

const priorityColors: Record<string, { bg: string; color: string }> = {
  'critical': { bg: '#f5b7b1', color: '#922b21' },
  'high': { bg: '#fdebd0', color: '#935116' },
  'moderate': { bg: '#fff3cd', color: '#856404' },
  'low': { bg: '#e2e3e5', color: '#383d41' },
};

const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr auto;
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

const EvidenceQuickView: React.FC<EvidenceQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const statusStyle = statusColors[entry.status] || statusColors.obtained;
  const priorityStyle = priorityColors[entry.priority] || priorityColors.moderate;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(entry.id);
  };

  return (
    <Row onClick={() => onSelect(entry)}>
      <Cell>{entry.evidenceName}</Cell>
      <Cell>
        <Badge $bg={statusStyle.bg} $color={statusStyle.color}>{entry.status}</Badge>
      </Cell>
      <Cell>
        <Badge $bg={priorityStyle.bg} $color={priorityStyle.color}>{entry.priority}</Badge>
      </Cell>
      <Cell>{entry.linkedClaimNames}</Cell>
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

export default EvidenceQuickView;
