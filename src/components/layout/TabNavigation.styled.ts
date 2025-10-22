// src/components/layout/TabNavigation.styled.ts
import styled from 'styled-components';

export const NavTabsContainer = styled.nav`
  display: flex;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 2px solid ${({ theme }) => theme.colors.lightGrey};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const NavTabButton = styled.button<{ $isActive: boolean }>`
  flex: 1 0 auto;
  padding: 15px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.secondary};
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;

  ${({ $isActive, theme }) =>
    $isActive &&
    `
    color: ${theme.colors.dark};
    background: ${theme.colors.white};
    border-bottom-color: ${theme.colors.primary};
  `}

  &:hover:not(.active) {
    background: ${({ theme }) => theme.colors.lightGrey};
    color: ${({ theme }) => theme.colors.dark};
  }
`;
