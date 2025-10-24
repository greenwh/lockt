// src/components/common/SearchBar.tsx
import React from 'react';
import { SearchBarWrapper, SearchInput, SearchIcon, ClearButton } from './SearchBar.styled';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...'
}) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <SearchBarWrapper>
      <SearchIcon>🔍</SearchIcon>
      <SearchInput
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <ClearButton onClick={handleClear} aria-label="Clear search">
          ✕
        </ClearButton>
      )}
    </SearchBarWrapper>
  );
};

export default SearchBar;
