import { useId } from 'react';
import { CloseIcon, SearchIcon } from '../../../shared/components/AppIcons';
import './RoleSearch.css';

interface RoleSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function RoleSearch({ value, onChange }: RoleSearchProps) {
  const searchId = useId();

  const handleClear = () => {
    onChange('');

    window.requestAnimationFrame(() => {
      document.getElementById(searchId)?.focus();
    });
  };

  return (
    <div className="role-search">
      <SearchIcon className="role-search__icon" />

      <label className="sr-only" htmlFor={searchId}>
        Buscar rol por nombre o ID
      </label>

      <input
        id={searchId}
        className="role-search__input"
        type="search"
        value={value}
        placeholder="Buscar por nombre o ID"
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />

      {value.length > 0 && (
        <button
          className="role-search__clear"
          type="button"
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
          onClick={handleClear}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}