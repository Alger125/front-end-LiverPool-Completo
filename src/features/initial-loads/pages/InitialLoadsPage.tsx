import { useState } from 'react';
import { Link } from 'react-router-dom';

import { appendAuditLogEntry, useSession } from '../../../shared/auth';

import '../styles/initialLoads.css';

interface ParsedInitialLoadRow {
  line: number;
  business: string;
  location: string;
  department: string;
  groupName: string;
  sectionCode: string;
  sectionName: string;
  isAnchor: boolean;
  responsible: string;
  status: 'Válido' | 'Advertencia' | 'Error';
  message: string;
}

const SAMPLE_PREVIEW_DATA: ParsedInitialLoadRow[] = [
  {
    line: 2,
    business: 'Liverpool',
    location: 'Liverpool Insurgentes (0001)',
    department: 'Depto. 101 - Perfumería y Cosméticos',
    groupName: 'Grupo 001 — Gala y Noche',
    sectionCode: 'SEC-101',
    sectionName: '101 - Fragancias Importadas',
    isAnchor: true,
    responsible: 'Alejandro Martínez Soto',
    status: 'Válido',
    message: 'Estructura conforme. Sección ancla validada.',
  },
  {
    line: 3,
    business: 'Liverpool',
    location: 'Liverpool Insurgentes (0001)',
    department: 'Depto. 101 - Perfumería y Cosméticos',
    groupName: 'Grupo 001 — Gala y Noche',
    sectionCode: 'SEC-102',
    sectionName: '102 - Estuches y Sets de Regalo',
    isAnchor: false,
    responsible: 'Alejandro Martínez Soto',
    status: 'Válido',
    message: 'Estructura conforme.',
  },
  {
    line: 4,
    business: 'Liverpool',
    location: 'Liverpool Insurgentes (0001)',
    department: 'Depto. 110 - Vestidos de Fiesta',
    groupName: 'Grupo 004 — Sastrería y Formal',
    sectionCode: 'SEC-303',
    sectionName: '303 - Sastrería y Formal',
    isAnchor: false,
    responsible: 'Fernando Ríos Cano',
    status: 'Advertencia',
    message: 'Grupo sin sección ancla. Verifique que no sea el único grupo del departamento.',
  },
  {
    line: 5,
    business: 'Liverpool',
    location: 'Liverpool Centro (0002)',
    department: 'Depto. 999 - Inexistente',
    groupName: 'Grupo 009',
    sectionCode: 'SEC-999',
    sectionName: '999 - Sección de Prueba',
    isAnchor: false,
    responsible: 'Sin Asignar',
    status: 'Error',
    message: 'El Departamento padre (999) no existe en el catálogo maestro del almacén.',
  },
];

export function InitialLoadsPage() {
  const session = useSession();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationCompleted, setValidationCompleted] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedInitialLoadRow[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const handleDownloadTemplate = () => {
    const templateContent = [
      'Negocio,IdUbicacion,NombreUbicacion,IdDepartamento,NombreDepartamento,IdGrupo,NombreGrupo,IdSeccion,NombreSeccion,EsAncla,NoEmpleadoResponsable,NombreResponsable',
      'Liverpool,0001,Liverpool Insurgentes,101,Perfumería y Cosméticos,GRP-001,Grupo 001,SEC-101,Fragancias Importadas,SI,EMP-001042,Alejandro Martínez Soto',
      'Liverpool,0001,Liverpool Insurgentes,101,Perfumería y Cosméticos,GRP-001,Grupo 001,SEC-102,Estuches de Regalo,NO,EMP-001042,Alejandro Martínez Soto',
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Plantilla_Oficial_Cargas_Iniciales_ZDeptos.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSuccessToast('Plantilla oficial descargada exitosamente.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsValidating(true);
    setValidationCompleted(false);

    // Simular procesamiento del validador de estructura
    setTimeout(() => {
      setIsValidating(false);
      setValidationCompleted(true);
      setParsedRows(SAMPLE_PREVIEW_DATA);
      setSuccessToast(`Archivo "${file.name}" validado. Se procesaron 4 registros.`);
    }, 900);
  };

  const stats = {
    total: parsedRows.length,
    valid: parsedRows.filter((r) => r.status === 'Válido').length,
    warnings: parsedRows.filter((r) => r.status === 'Advertencia').length,
    errors: parsedRows.filter((r) => r.status === 'Error').length,
  };

  const handleApplyLoad = () => {
    setShowApplyModal(false);
    setSuccessToast(
      `Carga inicial aplicada exitosamente. Se crearon ${stats.valid} registros en la estructura comercial.`,
    );

    appendAuditLogEntry({
      action: 'INITIAL_LOAD_PROCESSED',
      actorId: session?.user.employeeNumber ?? 'EMP-001',
      actorName: session?.user.fullName ?? 'Administrador',
      module: 'INITIAL_LOADS',
      outcome: 'SUCCESS',
      detail: `Aplicación de carga masiva (${uploadedFile?.name ?? 'archivo.csv'}). Registros válidos: ${stats.valid}, Errores omitidos: ${stats.errors}`,
    });
  };

  return (
    <section className="il-page">
      <nav className="il-breadcrumb" aria-label="Ruta de navegación">
        <Link to="/structures">Gestión de estructuras</Link>
        <span aria-hidden="true">›</span>
        <strong>Cargas Iniciales Masivas</strong>
      </nav>

      <header className="il-header">
        <div className="il-header__left">
          <span className="il-pill">CU-CIN-001: Conciliación Masiva</span>
          <h1 className="il-title">Cargas Iniciales para la Estructura Comercial</h1>
          <p className="il-subtitle">
            Carga masiva y aprovisionamiento inicial de Grupos Comerciales, Departamentos Padre y Secciones Gestionadas desde plantillas oficiales.
          </p>
        </div>

        <div className="il-header__actions">
          <button
            type="button"
            className="il-btn il-btn--secondary"
            onClick={handleDownloadTemplate}
          >
            📄 Descargar Plantilla Oficial (.CSV)
          </button>
        </div>
      </header>

      {/* Zona de Carga de Archivo */}
      <div className="il-upload-card">
        <div className="il-dropzone">
          <span className="il-dropzone__icon" aria-hidden="true">
            📂
          </span>
          <h3>Selecciona o arrastra el archivo de carga inicial</h3>
          <p>Formatos aceptados: <code>.CSV</code> o <code>.XLSX</code> (Con codificación UTF-8 y layout oficial)</p>

          <label className="il-btn il-btn--primary il-upload-label">
            Examinar archivo en tu equipo
            <input
              type="file"
              accept=".csv,.xlsx"
              className="ge-visually-hidden"
              onChange={handleFileUpload}
            />
          </label>

          {uploadedFile && (
            <div className="il-file-chip">
              <span>📄 {uploadedFile.name}</span>
              <small>({(uploadedFile.size / 1024).toFixed(1)} KB)</small>
            </div>
          )}
        </div>
      </div>

      {isValidating && (
        <div className="il-loading-card" role="status">
          <div className="il-spinner" />
          <p>Validando consistencia de grupos, departamentos padre y secciones gestionadas...</p>
        </div>
      )}

      {/* Resultados de Validación y Conciliación */}
      {validationCompleted && (
        <div className="il-results-section">
          {/* Tarjetas de Estadísticas */}
          <div className="il-stats-grid">
            <div className="il-stat-card">
              <span>Total Registros Leídos</span>
              <strong>{stats.total}</strong>
            </div>

            <div className="il-stat-card il-stat-card--valid">
              <span>Registros Válidos</span>
              <strong>{stats.valid}</strong>
            </div>

            <div className="il-stat-card il-stat-card--warn">
              <span>Advertencias</span>
              <strong>{stats.warnings}</strong>
            </div>

            <div className="il-stat-card il-stat-card--error">
              <span>Errores Bloqueantes</span>
              <strong>{stats.errors}</strong>
            </div>
          </div>

          {/* Tabla de Detalle de Conciliación */}
          <div className="il-table-wrapper">
            <div className="il-table-header">
              <h3>Reporte de Conciliación Previa</h3>
              <button
                type="button"
                className="il-btn il-btn--primary"
                disabled={stats.valid === 0}
                onClick={() => setShowApplyModal(true)}
              >
                Aplicar {stats.valid} registros a la Estructura Comercial →
              </button>
            </div>

            <table className="il-table">
              <thead>
                <tr>
                  <th>Línea</th>
                  <th>Ubicación / Negocio</th>
                  <th>Departamento</th>
                  <th>Grupo Comercial</th>
                  <th>Sección</th>
                  <th>Responsable</th>
                  <th>Estatus</th>
                  <th>Observación / Validación</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((r) => (
                  <tr key={r.line}>
                    <td>#{r.line}</td>
                    <td>
                      <strong>{r.location}</strong>
                      <div className="il-subtext">{r.business}</div>
                    </td>
                    <td>{r.department}</td>
                    <td>{r.groupName}</td>
                    <td>
                      <strong>{r.sectionName}</strong>
                      {r.isAnchor && <span className="il-anchor-tag">🔒 Ancla</span>}
                    </td>
                    <td>{r.responsible}</td>
                    <td>
                      <span className={`il-status-tag il-status-tag--${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="il-msg-cell">{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Aplicación */}
      {showApplyModal && (
        <div
          className="ge-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowApplyModal(false);
          }}
        >
          <div className="ge-modal ge-modal--wide" role="dialog" aria-labelledby="modal-apply-title">
            <h2 id="modal-apply-title" className="ge-modal__title">
              Confirmar Aplicación de Carga Inicial
            </h2>
            <p className="ge-modal__description">
              Estás a punto de incorporar <strong>{stats.valid} registros válidos</strong> a la estructura comercial activa de Liverpool.
            </p>

            <div className="il-confirm-box">
              <p>
                ✓ Los departamentos y grupos nuevos se darán de alta con fecha de vigencia del periodo actual.
              </p>
              <p>
                ⚠ Los {stats.errors} registro(s) con error serán omitidos y deberán corregirse en una carga posterior.
              </p>
            </div>

            <div className="ge-modal__actions">
              <button
                type="button"
                className="ge-modal__cancel"
                onClick={() => setShowApplyModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ge-modal__submit"
                onClick={handleApplyLoad}
              >
                Confirmar y Aplicar Estructura
              </button>
            </div>
          </div>
        </div>
      )}

      {successToast && (
        <div className="gm-toast" role="status">
          <span>{successToast}</span>
          <button type="button" aria-label="Cerrar mensaje" onClick={() => setSuccessToast('')}>
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
