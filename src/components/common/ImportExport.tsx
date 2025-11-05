// src/components/common/ImportExport.tsx
import React, { useRef, useState } from 'react';
import { StyledImportExport, ButtonGroup, ImportButton, ExportButton, FileInput, ErrorMessage } from './ImportExport.styled';
import { csvService } from '../../services/csv.service';

interface ImportExportProps<T> {
  data: T[];
  onImport: (importedData: T[]) => Promise<void>;
  exportFunction: (data: T[]) => string;
  importFunction: (csvContent: string) => T[];
  filename: string; // e.g., "passwords.csv"
  className?: string;
}

function ImportExport<T>({
  data,
  onImport,
  exportFunction,
  importFunction,
  filename,
  className,
}: ImportExportProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    try {
      setError(null);
      const csvContent = exportFunction(data);
      csvService.downloadCsv(csvContent, filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export data';
      setError(message);
      console.error('Export failed:', err);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    try {
      // Read CSV file
      const csvContent = await csvService.readCsvFile(file);

      // Parse CSV to data
      const importedData = importFunction(csvContent);

      if (importedData.length === 0) {
        throw new Error('No valid data found in CSV file');
      }

      // Call onImport callback (merges with existing data)
      await onImport(importedData);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import data';
      setError(message);
      console.error('Import failed:', err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <StyledImportExport className={className}>
      <ButtonGroup>
        <ImportButton onClick={handleImportClick} disabled={isImporting}>
          {isImporting ? 'Importing...' : '📥 Import CSV'}
        </ImportButton>
        <ExportButton onClick={handleExport} disabled={data.length === 0}>
          📤 Export CSV
        </ExportButton>
      </ButtonGroup>
      <FileInput ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </StyledImportExport>
  );
}

export default ImportExport;
