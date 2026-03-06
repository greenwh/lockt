// src/components/health/MedicationQuickView.tsx
import React from 'react';
import type { HealthMedication } from '../../types/data.types';
import styled from 'styled-components';

interface MedicationQuickViewProps {
  entry: HealthMedication;
  onSelect: (entry: HealthMedication) => void;
  onDelete?: (entryId: string) => void;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: '#d4edda', color: '#155724' },
  planned: { bg: '#cce5ff', color: '#004085' },
  prn: { bg: '#fff3cd', color: '#856404' },
  'not-taking': { bg: '#e2e3e5', color: '#383d41' },
};

const typeColors: Record<string, { bg: string; color: string }> = {
  prescription: { bg: '#e8daef', color: '#6c3483' },
  supplement: { bg: '#d5f5e3', color: '#1e8449' },
  otc: { bg: '#fdebd0', color: '#935116' },
};

const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
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

const MedicationQuickView: React.FC<MedicationQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const statusStyle = statusColors[entry.status] || statusColors.active;
  const typeStyle = typeColors[entry.type] || typeColors.prescription;
  const hasWarning = entry.interactionNotes?.includes('\u26A0\uFE0F');

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(entry.id);
  };

  return (
    <Row onClick={() => onSelect(entry)}>
      <Cell>
        {hasWarning && <span style={{ marginRight: '4px' }}>{'\u26A0\uFE0F'}</span>}
        {entry.name}
      </Cell>
      <Cell>{entry.dose}</Cell>
      <Cell>
        <Badge $bg={typeStyle.bg} $color={typeStyle.color}>{entry.type}</Badge>
      </Cell>
      <Cell>
        <Badge $bg={statusStyle.bg} $color={statusStyle.color}>{entry.status}</Badge>
      </Cell>
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

export default MedicationQuickView;
