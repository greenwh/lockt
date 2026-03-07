// src/components/vso/ActionQuickView.tsx
import React from 'react';
import type { VSOAction } from '../../types/data.types';
import styled from 'styled-components';

interface ActionQuickViewProps {
  entry: VSOAction;
  onSelect: (entry: VSOAction) => void;
  onDelete?: (entryId: string) => void;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  'not-started': { bg: '#e2e3e5', color: '#383d41' },
  'in-progress': { bg: '#cce5ff', color: '#004085' },
  blocked: { bg: '#f5b7b1', color: '#922b21' },
  completed: { bg: '#d4edda', color: '#155724' },
};

const phaseColors: Record<string, { bg: string; color: string }> = {
  'phase-1-foundation': { bg: '#d6eaf8', color: '#2e4053' },
  'phase-2-evidence': { bg: '#e8daef', color: '#6c3483' },
  'phase-3-nexus': { bg: '#fdebd0', color: '#935116' },
  'phase-4-filing': { bg: '#fadbd8', color: '#922b21' },
  ongoing: { bg: '#d5f5e3', color: '#1e8449' },
};

const priorityColors: Record<string, { bg: string; color: string }> = {
  critical: { bg: '#f5b7b1', color: '#922b21' },
  high: { bg: '#fdebd0', color: '#935116' },
  moderate: { bg: '#fff3cd', color: '#856404' },
  low: { bg: '#e2e3e5', color: '#383d41' },
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

const phaseLabels: Record<string, string> = {
  'phase-1-foundation': 'Phase 1: Foundation',
  'phase-2-evidence': 'Phase 2: Evidence',
  'phase-3-nexus': 'Phase 3: Nexus',
  'phase-4-filing': 'Phase 4: Filing',
  ongoing: 'Ongoing',
};

const ActionQuickView: React.FC<ActionQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const statusStyle = statusColors[entry.status] || statusColors['not-started'];
  const phaseStyle = phaseColors[entry.phase] || phaseColors['phase-1-foundation'];
  const priorityStyle = priorityColors[entry.priority] || priorityColors.moderate;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(entry.id);
  };

  return (
    <Row onClick={() => onSelect(entry)}>
      <Cell>{entry.actionItem}</Cell>
      <Cell>
        <Badge $bg={phaseStyle.bg} $color={phaseStyle.color}>{phaseLabels[entry.phase] || entry.phase}</Badge>
      </Cell>
      <Cell>
        <Badge $bg={statusStyle.bg} $color={statusStyle.color}>{entry.status}</Badge>
      </Cell>
      <Cell>
        <Badge $bg={priorityStyle.bg} $color={priorityStyle.color}>{entry.priority}</Badge>
      </Cell>
      <Cell>{entry.dueDate || ''}</Cell>
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

export default ActionQuickView;
