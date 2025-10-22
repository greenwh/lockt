// src/components/health/HealthTabs.styled.ts
import styled from 'styled-components';

export const SubNavContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGrey};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const SubNavButton = styled.button<{ isActive: boolean }>`
  padding: 10px 15px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;

  ${({ isActive, theme }) =>
    isActive &&
    `
    color: ${theme.colors.primary};
    border-bottom-color: ${theme.colors.primary};
  `}

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
