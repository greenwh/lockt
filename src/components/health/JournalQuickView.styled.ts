// src/components/health/JournalQuickView.styled.ts
import styled from 'styled-components';

export const QuickViewRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr; /* Date, Reason, Pain Level */
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGrey};
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

export const QuickViewCell = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
