// src/components/freetext/FreetextQuickView.styled.ts
import styled from 'styled-components';

export const QuickViewRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr; /* Title and Description */
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
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
