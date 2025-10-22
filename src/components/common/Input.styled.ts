// src/components/common/Input.styled.ts
import styled from 'styled-components';

export const InputWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const StyledLabel = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid ${({ theme }) => theme.colors.lightGrey};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1em;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;
