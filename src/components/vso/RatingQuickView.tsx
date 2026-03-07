// src/components/vso/RatingQuickView.tsx
import React from 'react';
import type { VSORating } from '../../types/data.types';
import styled from 'styled-components';

interface RatingQuickViewProps {
  entry: VSORating;
  onSelect: (entry: VSORating) => void;
  onDelete?: (entryId: string) => void;
}

const currentlyMetColors: Record<string, { bg: string; color: string }> = {
  met: { bg: '#d4edda', color: '#155724' },
  'partially-met': { bg: '#fff3cd', color: '#856404' },
  'not-met': { bg: '#f5b7b1', color: '#922b21' },
  'unknown-need-testing': { bg: '#cce5ff', color: '#004085' },
};

const currentlyMetLabels: Record<string, string> = {
  met: 'Met',
  'partially-met': 'Partially Met',
  'not-met': 'Not Met',
  'unknown-need-testing': 'Unknown - Need Testing',
};

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr auto;
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

const RatingQuickView: React.FC<RatingQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const metStyle = currentlyMetColors[entry.currentlyMet] || currentlyMetColors.met;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(entry.id);
  };

  return (
    <Row onClick={() => onSelect(entry)}>
      <Cell>{entry.diagnosticCode}</Cell>
      <Cell>{entry.conditionName}</Cell>
      <Cell>{entry.ratingPercent}%</Cell>
      <Cell>
        <Badge $bg={metStyle.bg} $color={metStyle.color}>
          {currentlyMetLabels[entry.currentlyMet] || entry.currentlyMet}
        </Badge>
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

export default RatingQuickView;
