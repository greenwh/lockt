// src/components/passwords/PasswordDetail.styled.ts
import styled from 'styled-components';

export const DetailContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

export const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const DetailTitle = styled.h2`
  margin: 0;
  margin-left: ${({ theme }) => theme.spacing.md};
`;

export const DetailSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const DetailField = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  & > strong {
    display: block;
    color: ${({ theme }) => theme.colors.textLight};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

export const ValueContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const MaskedValue = styled.span`
  font-family: monospace;
  font-size: 1.2em;
`;
