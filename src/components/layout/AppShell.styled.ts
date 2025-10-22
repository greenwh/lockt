// src/components/layout/AppShell.styled.ts
import styled from 'styled-components';

export const AppContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 40px);

  @media (max-width: 768px) {
    border-radius: 0;
    min-height: 100vh;
  }
`;

export const AppHeader = styled.header`
  background: ${({ theme }) => theme.colors.headerBackground};
  color: ${({ theme }) => theme.colors.textLight};
  padding: 30px;
  text-align: center;

  h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
    font-weight: 300;
  }

  p {
    font-size: 1.1em;
    opacity: 0.9;
  }
`;

export const AppContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
`;
