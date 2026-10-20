import type { ChangeEvent } from 'react';

import {
  CloseIcon,
  SearchIcon,
} from '../../../shared/components/AppIcons';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar',
  ariaLabel = 'Buscar estructuras',
}: SearchInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="ge-search">
      <SearchIcon className="ge-search__icon" />

      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={handleChange}
      />

      {value.length > 0 && (
        <button
          type="button"
          className="ge-search__clear"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange('')}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}