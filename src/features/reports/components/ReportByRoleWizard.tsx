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

interface ReportByRoleWizardProps {
  onBackToHub: () => void;
  canDownload: boolean;
}

export function ReportByRoleWizard({ onBackToHub, canDownload }: ReportByRoleWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [filters, setFilters] = useState<ReportFilterCriteria>(MOCK_DEFAULT_FILTERS);
  const [selectedColumnIds, setSelectedColumnIds] = useState<Set<string>>(
    () => new Set(REPORT_COLUMNS_CATALOG.filter((c) => c.defaultSelected).map((c) => c.id)),
  );
  const [downloadSuccessToast, setDownloadSuccessToast] = useState('');

  const toggleColumn = (id: string) => {
    setSelectedColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) return prev; // Mantener al menos 1
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllColumns = () => {
    setSelectedColumnIds(new Set(REPORT_COLUMNS_CATALOG.map((c) => c.id)));
  };

  const selectedColumns = REPORT_COLUMNS_CATALOG.filter((col) =>
    selectedColumnIds.has(col.id),
  );

  const filteredRows = MOCK_REPORT_ROWS.filter((row) => {
    if (filters.business !== 'Todos' && row.negocio !== filters.business) return false;
    if (filters.zone !== 'Todas' && !row.zona.includes(filters.zone)) return false;
    if (filters.collaborator.trim()) {
      const q = filters.collaborator.toLowerCase();
      return (
        row.colaborador.toLowerCase().includes(q) ||
        row.numeroEmpleado.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDownloadCsv = () => {
    downloadCsvReport(
      `reporte_por_rol_${filters.month}_${filters.year}`,
      selectedColumns,
      filteredRows,
    );
    setDownloadSuccessToast('Reporte CSV descargado exitosamente.');
  };

  const handleDownloadTxt = () => {
    downloadTxtReport(
      `reporte_por_rol_${filters.month}_${filters.year}`,
      selectedColumns,
      filteredRows,
      `TIPO DE REPORTE: REPORTE POR ROL | PERIODO: ${filters.month} ${filters.year} | NEGOCIO: ${filters.business}`,
    );
    setDownloadSuccessToast('Reporte TXT formateado descargado exitosamente.');
  };

  return (
    <div className="rep-wizard">
      <div className="rep-wizard__nav">
        <button type="button" className="rep-back-btn" onClick={onBackToHub}>
          Inicio / Reportes
        </button>

      </div>

      <header className="rep-wizard__header">
        <h1>Configurar Reporte por Rol</h1>
        <p>Configura los filtros de periodo y estructura, selecciona las columnas de datos y previsualiza la información para exportación.</p>
      </header>

      {/* Stepper de 3 Pasos */}
      <nav aria-label="Pasos del reporte" className="rep-stepper">
        <button
          type="button"
          className={`rep-stepper__step ${currentStep === 1 ? 'rep-stepper__step--active' : currentStep > 1 ? 'rep-stepper__step--completed' : ''}`}
          onClick={() => setCurrentStep(1)}
        >
          <span className="rep-stepper__num">1</span>
          <span>1. Filtros y Periodo</span>
        </button>
        <span className="rep-stepper__divider" aria-hidden="true">›</span>
        <button
          type="button"
          className={`rep-stepper__step ${currentStep === 2 ? 'rep-stepper__step--active' : currentStep > 2 ? 'rep-stepper__step--completed' : ''}`}
          onClick={() => setCurrentStep(2)}
        >
          <span className="rep-stepper__num">2</span>
          <span>2. Selección de Datos ({selectedColumnIds.size})</span>
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
          PASO 1: FILTROS Y PERIODO
         ===================================================================== */}
      {currentStep === 1 && (
        <section className="rep-step-card">
          <h2>Paso 1: Configuración de Periodo y Filtros de Alcance</h2>
          <p className="rep-step-desc">Define el mes, año y el alcance organizacional para acotar la consulta.</p>

          <div className="rep-form-grid">
            <div className="rep-field">
              <label htmlFor="f-year">Año comercial *:</label>
              <select
                id="f-year"
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>

            <div className="rep-field">
              <label htmlFor="f-month">Mes comercial *:</label>
              <select
                id="f-month"
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              >
                <option value="Octubre">Octubre</option>
                <option value="Noviembre">Noviembre</option>
                <option value="Diciembre">Diciembre</option>
                <option value="Septiembre">Septiembre</option>
              </select>
            </div>

            <div className="rep-field">
              <label htmlFor="f-business">Negocio / Formato:</label>
              <select
                id="f-business"
                value={filters.business}
                onChange={(e) => setFilters({ ...filters, business: e.target.value })}
              >
                <option value="Todos">Todos (Liverpool y Suburbia)</option>
                <option value="Liverpool">Liverpool</option>
                <option value="Suburbia">Suburbia</option>
              </select>
            </div>

            <div className="rep-field">
              <label htmlFor="f-zone">Zona Operativa:</label>
              <select
                id="f-zone"
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

            <div className="rep-field">
              <label htmlFor="f-dept">Departamento comercial:</label>
              <select
                id="f-dept"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              >
                <option value="Todos">Todos los departamentos</option>
                <option value="Perfumería">Perfumería y Cosméticos</option>
                <option value="Damas">Damas y Calzado</option>
                <option value="Caballeros">Caballeros</option>
                <option value="Hogar">Muebles y Hogar</option>
              </select>
            </div>

            <div className="rep-field">
              <label htmlFor="f-collab">Filtrar por Colaborador o No. Empleado:</label>
              <input
                id="f-collab"
                type="text"
                placeholder="Ej. Alejandro Martínez o EMP-001042"
                value={filters.collaborator}
                onChange={(e) => setFilters({ ...filters, collaborator: e.target.value })}
              />
            </div>
          </div>

          <div className="rep-actions-footer">
            <span />
            <button
              type="button"
              className="rep-btn rep-btn--primary"
              onClick={() => setCurrentStep(2)}
            >
              Continuar a Selección de Datos →
            </button>
          </div>
        </section>
      )}

      {/* =====================================================================
          PASO 2: SELECCIÓN DE DATOS
         ===================================================================== */}
      {currentStep === 2 && (
        <section className="rep-step-card">
          <div className="rep-step-card__top">
            <div>
              <h2>Paso 2: Selección de Columnas y Campos del Reporte</h2>
              <p className="rep-step-desc">Selecciona los campos requeridos agrupados en Estructura, Puestos y Personas, y Relaciones.</p>
            </div>
            <button
              type="button"
              className="rep-btn rep-btn--secondary"
              onClick={handleSelectAllColumns}
            >
              ✓ Seleccionar todas las columnas
            </button>
          </div>

          <div className="rep-columns-grid">
            {/* Tarjeta: Estructura */}
            <div className="rep-category-card">
              <h3>Estructura Organizacional</h3>
              <p>Datos de ubicación, negocio, gerencia, departamento, grupo y sección.</p>
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

            {/* Tarjeta: Puestos y Personas */}
            <div className="rep-category-card">
              <h3>Puestos y Personas</h3>
              <p>Identificación del colaborador, número de empleado, puesto y rol asignado.</p>
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

            {/* Tarjeta: Relaciones y Vigencias */}
            <div className="rep-category-card">
              <h3>Relaciones y Vigencias</h3>
              <p>Responsable titular, fechas de inicio y fin de vigencia y estatus.</p>
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
              ← Regresar a Filtros
            </button>
            <button
              type="button"
              className="rep-btn rep-btn--primary"
              disabled={selectedColumnIds.size === 0}
              onClick={() => setCurrentStep(3)}
            >
              Continuar a Vista Previa ({selectedColumnIds.size} columnas) →
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
              <h2>Paso 3: Vista Previa y Exportación del Reporte</h2>
              <div className="rep-badges-row">
                <span className="rep-badge">Periodo: {filters.month} {filters.year}</span>
                <span className="rep-badge">Negocio: {filters.business}</span>
                <span className="rep-badge">Zona: {filters.zone}</span>
                <span className="rep-badge">{filteredRows.length} registros encontrados</span>
              </div>
            </div>

            <div className="rep-export-actions">
              <button
                type="button"
                className="rep-btn rep-btn--download-csv"
                disabled={!canDownload || filteredRows.length === 0}
                title={!canDownload ? 'No tienes permiso para descargar reportes' : 'Descargar en formato CSV'}
                onClick={handleDownloadCsv}
              >
                📥 Descargar CSV
              </button>
              <button
                type="button"
                className="rep-btn rep-btn--download-txt"
                disabled={!canDownload || filteredRows.length === 0}
                title={!canDownload ? 'No tienes permiso para descargar reportes' : 'Descargar en formato TXT'}
                onClick={handleDownloadTxt}
              >
                📄 Descargar TXT
              </button>
            </div>
          </div>

          {!canDownload && (
            <p className="rep-warning" role="alert">
              ℹ Tu rol actual permite previsualizar el reporte en pantalla. Para exportar archivos CSV/TXT solicita el permiso <code>REPORT_ROLE_DOWNLOAD</code>.
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
              ← Modificar Columnas Seleccionadas
            </button>
            <button
              type="button"
              className="rep-btn rep-btn--secondary"
              onClick={() => setCurrentStep(1)}
            >
              Ajustar Filtros
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
