// src/components/vso/ExposureQuickView.tsx
import React from 'react';
import type { VSOExposure } from '../../types/data.types';
import styled from 'styled-components';

interface ExposureQuickViewProps {
  entry: VSOExposure;
  onSelect: (entry: VSOExposure) => void;
  onDelete?: (entryId: string) => void;
}

const exposureTypeColors: Record<string, { bg: string; color: string }> = {
  'rf-radiation': { bg: '#fadbd8', color: '#922b21' },
  chemical: { bg: '#e8daef', color: '#6c3483' },
  fuel: { bg: '#fdebd0', color: '#935116' },
  paint: { bg: '#d6eaf8', color: '#2e4053' },
  solvent: { bg: '#fff3cd', color: '#856404' },
  particulate: { bg: '#e2e3e5', color: '#383d41' },
  noise: { bg: '#d5f5e3', color: '#1e8449' },
  nuclear: { bg: '#f5b7b1', color: '#922b21' },
  other: { bg: '#e2e3e5', color: '#383d41' },
};

const exposureTypeLabels: Record<string, string> = {
  'rf-radiation': 'RF/Microwave Radiation',
  chemical: 'Chemical',
  fuel: 'Fuel',
  paint: 'Paint/Coating',
  solvent: 'Solvent',
  particulate: 'Particulate',
  noise: 'Noise',
  nuclear: 'Nuclear/Ionizing',
  other: 'Other',
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

const ExposureQuickView: React.FC<ExposureQuickViewProps> = ({ entry, onSelect, onDelete }) => {
  const typeStyle = exposureTypeColors[entry.exposureType] || exposureTypeColors.other;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(entry.id);
  };

  return (
    <Row onClick={() => onSelect(entry)}>
      <Cell>{entry.substance}</Cell>
      <Cell>
        <Badge $bg={typeStyle.bg} $color={typeStyle.color}>
          {exposureTypeLabels[entry.exposureType] || entry.exposureType}
        </Badge>
      </Cell>
      <Cell>{entry.weaponSystem}</Cell>
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

export default ExposureQuickView;
