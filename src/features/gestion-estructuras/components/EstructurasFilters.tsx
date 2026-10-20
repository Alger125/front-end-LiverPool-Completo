import { SearchInput } from './SearchInput';
import { SelectField } from './SelectField';

type FiltersVariant = 'operaciones' | 'corporativo';

interface EstructurasFiltersProps {
  variant: FiltersVariant;
  year: string;
  years: readonly string[];
  onYearChange: (value: string) => void;
  month: string;
  months: readonly string[];
  onMonthChange: (value: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  zone?: string;
  zones?: readonly string[];
  onZoneChange?: (value: string) => void;
  businessFormat?: string;
  businessFormats?: readonly string[];
  onBusinessFormatChange?: (value: string) => void;
  structure?: string;
  structures?: readonly string[];
  onStructureChange?: (value: string) => void;
  futurePublicationsCount?: number;
  onViewFuturePublications?: () => void;
}

export function EstructurasFilters({
  variant,
  year,
  years,
  onYearChange,
  month,
  months,
  onMonthChange,
  searchValue,
  onSearchChange,
  zone,
  zones = [],
  onZoneChange,
  businessFormat,
  businessFormats = [],
  onBusinessFormatChange,
  structure,
  structures = [],
  onStructureChange,
  futurePublicationsCount = 0,
  onViewFuturePublications,
}: EstructurasFiltersProps) {
  const isOperations = variant === 'operaciones';

  return (
    <div className="ge-filters">
      <div className="ge-filters__fields">
        {isOperations && businessFormats.length > 0 && (
          <SelectField
            id="operations-business-format"
            label="Negocio"
            value={businessFormat ?? 'Todos'}
            options={businessFormats}
            onChange={(value) => onBusinessFormatChange?.(value)}
          />
        )}

        {isOperations && (
          zones.length > 0 && onZoneChange ? (
            <SelectField
              id="structure-zone"
              label="Zona"
              value={zone ?? ''}
              options={zones}
              onChange={onZoneChange}
            />
          ) : (
            <div className="ge-field">
              <label htmlFor="structure-zone">Zona:</label>
              <input
                id="structure-zone"
                value={zone ?? ''}
                readOnly
              />
            </div>
          )
        )}

        <SelectField
          id={`${variant}-year`}
          label="Año"
          value={year}
          years-select="true"
          options={years}
          onChange={onYearChange}
        />

        <SelectField
          id={`${variant}-month`}
          label="Mes"
          value={month}
          options={months}
          onChange={onMonthChange}
        />

        {!isOperations && (
          <SelectField
            id="corporate-structure"
            label="Estructura"
            value={structure ?? ''}
            options={structures}
            onChange={(value) => onStructureChange?.(value)}
          />
        )}
      </div>

      <div className="ge-filters__actions">
        {onViewFuturePublications && (
          <button
            type="button"
            className="ge-future-btn"
            onClick={onViewFuturePublications}
          >
            <span>📅 Publicaciones futuras</span>
            {futurePublicationsCount > 0 && (
              <span className="ge-future-btn__badge">
                {futurePublicationsCount}
              </span>
            )}
          </button>
        )}

        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          ariaLabel={
            isOperations
              ? 'Buscar estructura de operaciones'
              : 'Buscar estructura corporativa'
          }
        />
      </div>
    </div>
  );
}