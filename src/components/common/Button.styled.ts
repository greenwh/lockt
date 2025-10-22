// src/components/common/Button.styled.ts
import styled from 'styled-components';

export const StyledButton = styled.button`
  padding: 12px 25px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 123, 255, 0.4);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.secondary};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
