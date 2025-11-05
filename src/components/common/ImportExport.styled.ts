// src/components/common/ImportExport.styled.ts
import styled from 'styled-components';

export const StyledImportExport = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

export const ImportButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.95em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ theme }) => theme.colors.success || '#28a745'};
  color: ${({ theme }) => theme.colors.white};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.secondary};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const ExportButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.95em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};

  &:hover:not(:disabled) {
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

export const FileInput = styled.input`
  display: none;
`;

export const ErrorMessage = styled.div`
  padding: 10px;
  background: #dc3545;
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.9em;
  margin-top: 5px;
`;
