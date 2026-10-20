import { useState } from 'react';

import {
  MOCK_DEFAULT_FILTERS,
  MOCK_REPORT_ROWS,
  REPORT_COLUMNS_CATALOG,
} from '../mocks/reports.mocks';
import type {
  ReportFilterCriteria,
} from '../types/reports.types';
import { downloadCsvReport, downloadTxtReport } from '../utils/exportReport';

interface ReportGeneralWizardProps {
  onBackToHub: () => void;
  canDownload: boolean;
}

export function ReportGeneralWizard({ onBackToHub, canDownload }: ReportGeneralWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [filters, setFilters] = useState<ReportFilterCriteria>({
    ...MOCK_DEFAULT_FILTERS,
    periodMode: 'dateRange',
  });
  const [dateError, setDateError] = useState('');
  const [selectedColumnIds, setSelectedColumnIds] = useState<Set<string>>(
    () => new Set(REPORT_COLUMNS_CATALOG.filter((c) => c.defaultSelected).map((c) => c.id)),
  );
  const [downloadSuccessToast, setDownloadSuccessToast] = useState('');

  const handleValidateDatesAndProceed = () => {
    if (!filters.dateFrom || !filters.dateTo) {
      setDateError('Debes especificar tanto la Fecha de Inicio como la Fecha de Fin.');
      return;
    }
    const d1 = new Date(filters.dateFrom);
    const d2 = new Date(filters.dateTo);
    if (d1 > d2) {
      setDateError('La Fecha de Inicio no puede ser posterior a la Fecha de Fin.');
      return;
    }
    const diffDays = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 366) {
      setDateError('El rango de fechas no puede ser mayor a 1 año calendario.');
      return;
    }
    setDateError('');
    setCurrentStep(2);
  };

  const toggleColumn = (id: string) => {
    setSelectedColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedColumns = REPORT_COLUMNS_CATALOG.filter((col) =>
    selectedColumnIds.has(col.id),
  );

  const filteredRows = MOCK_REPORT_ROWS.filter((row) => {
    if (filters.business !== 'Todos' && row.negocio !== filters.business) return false;
    if (filters.zone !== 'Todas' && !row.zona.includes(filters.zone)) return false;
    return true;
  });

  const handleDownloadCsv = () => {
    downloadCsvReport(
      `reporte_general_${filters.dateFrom}_a_${filters.dateTo}`,
      selectedColumns,
      filteredRows,
    );
    setDownloadSuccessToast('Reporte General en formato CSV descargado exitosamente.');
  };

  const handleDownloadTxt = () => {
    downloadTxtReport(
      `reporte_general_${filters.dateFrom}_a_${filters.dateTo}`,
      selectedColumns,
      filteredRows,
      `TIPO DE REPORTE: REPORTE GENERAL | RANGO: DEL ${filters.dateFrom} AL ${filters.dateTo} | NEGOCIO: ${filters.business}`,
    );
    setDownloadSuccessToast('Reporte General en formato TXT descargado exitosamente.');
  };

  return (
    <div className="rep-wizard">
      <div className="rep-wizard__nav">
        <button type="button" className="rep-back-btn" onClick={onBackToHub}>
          ← Volver al Hub de Reportes
        </button>
        <span className="rep-pill">CU-EST-003: Reporte General</span>
      </div>

      <header className="rep-wizard__header">
        <h1>Generación de Reporte General por Rango de Fechas</h1>
        <p>Realiza extracciones completas de la estructura comercial definiendo ventanas de tiempo personalizadas.</p>
      </header>

      {/* Stepper de 3 Pasos */}
      <nav aria-label="Pasos del reporte general" className="rep-stepper">
        <button
          type="button"
          className={`rep-stepper__step ${currentStep === 1 ? 'rep-stepper__step--active' : currentStep > 1 ? 'rep-stepper__step--completed' : ''}`}
          onClick={() => setCurrentStep(1)}
        >
          <span className="rep-stepper__num">1</span>
          <span>1. Rango de Fechas y Filtros</span>
        </button>
        <span className="rep-stepper__divider" aria-hidden="true">›</span>
        <button
          type="button"
          className={`rep-stepper__step ${currentStep === 2 ? 'rep-stepper__step--active' : currentStep > 2 ? 'rep-stepper__step--completed' : ''}`}
          onClick={() => setCurrentStep(2)}
        >
          <span className="rep-stepper__num">2</span>
          <span>2. Selección de Columnas ({selectedColumnIds.size})</span>
        </button>
        <span className="rep-stepper__divider" aria-hidden="true">›</span>
        <button
          type="button"
          className={`rep-stepper__step ${currentStep === 3 ? 'rep-stepper__step--active' : ''}`}
          onClick={() => setCurrentStep(3)}
        >
          <span className="rep-stepper__num">3</span>
          <span>3. Vista Previa y Descarga</span>
        </button>
      </nav>

      {/* =====================================================================
          PASO 1: RANGO DE FECHAS Y FILTROS
         ===================================================================== */}
      {currentStep === 1 && (
        <section className="rep-step-card">
          <h2>Paso 1: Definición de Rango de Fechas</h2>
          <p className="rep-step-desc">Ingresa el periodo temporal de consulta (máximo 1 año) y los filtros organizacionales.</p>

          <div className="rep-form-grid">
            <div className="rep-field">
              <label htmlFor="gen-dfrom">Fecha Inicio *:</label>
              <input
                id="gen-dfrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => {
                  setFilters({ ...filters, dateFrom: e.target.value });
                  if (dateError) setDateError('');
                }}
              />
            </div>

            <div className="rep-field">
              <label htmlFor="gen-dto">Fecha Fin *:</label>
              <input
                id="gen-dto"
                type="date"
                value={filters.dateTo}
                onChange={(e) => {
                  setFilters({ ...filters, dateTo: e.target.value });
                  if (dateError) setDateError('');
                }}
              />
            </div>

            <div className="rep-field">
              <label htmlFor="gen-biz">Negocio / Formato:</label>
              <select
                id="gen-biz"
                value={filters.business}
                onChange={(e) => setFilters({ ...filters, business: e.target.value })}
              >
                <option value="Todos">Todos (Liverpool y Suburbia)</option>
                <option value="Liverpool">Liverpool</option>
                <option value="Suburbia">Suburbia</option>
              </select>
            </div>

            <div className="rep-field">
              <label htmlFor="gen-zone">Zona Operativa:</label>
              <select
                id="gen-zone"
                value={filters.zone}
                onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
              >
                <option value="Todas">Todas las zonas</option>
                <option value="Zona 1">Zona 1 (Metropolitana)</option>
                <option value="Zona 2">Zona 2 (Centro)</option>
                <option value="Zona 3">Zona 3 (Norte)</option>
                <option value="Corporativo">Corporativo</option>
              </select>
            </div>
          </div>

          {dateError && (
            <p className="ge-modal__error" role="alert">
              {dateError}
            </p>
          )}

          <div className="rep-actions-footer">
            <span />
            <button
              type="button"
              className="rep-btn rep-btn--primary"
              onClick={handleValidateDatesAndProceed}
            >
              Continuar a Selección de Columnas →
            </button>
          </div>
        </section>
      )}

      {/* =====================================================================
          PASO 2: SELECCIÓN DE COLUMNAS AUTORIZADAS
         ===================================================================== */}
      {currentStep === 2 && (
        <section className="rep-step-card">
          <div className="rep-step-card__top">
            <div>
              <h2>Paso 2: Selección de Columnas para el Reporte General</h2>
              <p className="rep-step-desc">Elige los campos a incluir en el archivo final exportable.</p>
            </div>
            <button
              type="button"
              className="rep-btn rep-btn--secondary"
              onClick={() => setSelectedColumnIds(new Set(REPORT_COLUMNS_CATALOG.map((c) => c.id)))}
            >
              ✓ Seleccionar todas
            </button>
          </div>

          <div className="rep-columns-grid">
            <div className="rep-category-card">
              <h3>Campos de Estructura</h3>
              <div className="rep-checkbox-list">
                {REPORT_COLUMNS_CATALOG.filter((c) => c.category === 'estructura').map((col) => (
                  <label key={col.id} className="rep-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedColumnIds.has(col.id)}
                      onChange={() => toggleColumn(col.id)}
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rep-category-card">
              <h3>Campos de Colaboradores y Puestos</h3>
              <div className="rep-checkbox-list">
                {REPORT_COLUMNS_CATALOG.filter((c) => c.category === 'puestos').map((col) => (
                  <label key={col.id} className="rep-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedColumnIds.has(col.id)}
                      onChange={() => toggleColumn(col.id)}
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rep-category-card">
              <h3>Campos de Asignación y Vigencias</h3>
              <div className="rep-checkbox-list">
                {REPORT_COLUMNS_CATALOG.filter((c) => c.category === 'relaciones').map((col) => (
                  <label key={col.id} className="rep-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedColumnIds.has(col.id)}
                      onChange={() => toggleColumn(col.id)}
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="rep-actions-footer">
            <button
              type="button"
              className="rep-btn rep-btn--secondary"
              onClick={() => setCurrentStep(1)}
            >
              ← Modificar Rango de Fechas
            </button>
            <button
              type="button"
              className="rep-btn rep-btn--primary"
              disabled={selectedColumnIds.size === 0}
              onClick={() => setCurrentStep(3)}
            >
              Ver Vista Previa ({selectedColumnIds.size} columnas) →
            </button>
          </div>
        </section>
      )}

      {/* =====================================================================
          PASO 3: VISTA PREVIA Y DESCARGA
         ===================================================================== */}
      {currentStep === 3 && (
        <section className="rep-step-card">
          <div className="rep-step-card__top">
            <div>
              <h2>Paso 3: Vista Previa y Descarga del Reporte General</h2>
              <div className="rep-badges-row">
                <span className="rep-badge">Rango: {filters.dateFrom} al {filters.dateTo}</span>
                <span className="rep-badge">Negocio: {filters.business}</span>
                <span className="rep-badge">{filteredRows.length} registros</span>
              </div>
            </div>

            <div className="rep-export-actions">
              <button
                type="button"
                className="rep-btn rep-btn--download-csv"
                disabled={!canDownload || filteredRows.length === 0}
                onClick={handleDownloadCsv}
              >
                📥 Descargar CSV
              </button>
              <button
                type="button"
                className="rep-btn rep-btn--download-txt"
                disabled={!canDownload || filteredRows.length === 0}
                onClick={handleDownloadTxt}
              >
                📄 Descargar TXT
              </button>
            </div>
          </div>

          {!canDownload && (
            <p className="rep-warning" role="alert">
              ℹ Tu rol actual permite previsualizar la consulta. Para exportar archivos solicita el permiso <code>REPORT_GENERAL_DOWNLOAD</code>.
            </p>
          )}

          <div className="rep-table-wrapper">
            <table className="rep-table">
              <thead>
                <tr>
                  {selectedColumns.map((col) => (
                    <th key={col.id}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    {selectedColumns.map((col) => (
                      <td key={col.id}>
                        {col.id === 'seccionAncla' && row.seccionAncla.includes('🔒') ? (
                          <span className="rep-anchor-tag">{row.seccionAncla}</span>
                        ) : col.id === 'estatus' ? (
                          <span className="rep-status-tag">{row.estatus}</span>
                        ) : (
                          String((row as unknown as Record<string, unknown>)[col.id] ?? '')
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rep-actions-footer">
            <button
              type="button"
              className="rep-btn rep-btn--secondary"
              onClick={() => setCurrentStep(2)}
            >
              ← Modificar Columnas
            </button>
            <button
              type="button"
              className="rep-btn rep-btn--secondary"
              onClick={() => setCurrentStep(1)}
            >
              Ajustar Rango de Fechas
            </button>
          </div>
        </section>
      )}

      {downloadSuccessToast && (
        <div className="gm-toast" role="status">
          <span>{downloadSuccessToast}</span>
          <button type="button" aria-label="Cerrar mensaje" onClick={() => setDownloadSuccessToast('')}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
