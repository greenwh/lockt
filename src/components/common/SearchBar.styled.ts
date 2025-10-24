// src/components/common/SearchBar.styled.ts
import styled from 'styled-components';

export const SearchBarWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 2px solid ${({ theme }) => theme.colors.lightGrey};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1em;
  transition: all 0.3s ease;
  background: ${({ theme }) => theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

export const SearchIcon = styled.span`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 1.2em;
  pointer-events: none;
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 1.2em;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.lightGrey};
    color: ${({ theme }) => theme.colors.dark};
  }
`;
