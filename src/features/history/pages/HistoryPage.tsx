import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { SECURITY_PERMISSION_CODES } from '../../access-management/model/permission.model';
import { useSession } from '../../../shared/auth';
import { CloseIcon, SearchIcon } from '../../../shared/components/AppIcons';
import { hasPermission } from '../../../shared/permissions';

import { MOCK_AUDIT_EVENTS } from '../mocks/history.mocks';
import type { AuditHistoryEvent, HistoryFilterState } from '../types/history.types';

import '../styles/history.css';

export function HistoryPage() {
  const session = useSession();
  const grantedPermissions = session?.grantedPermissions ?? [];

  const canDownloadHistory = hasPermission(
    SECURITY_PERMISSION_CODES.HISTORY_DOWNLOAD,
    grantedPermissions,
  );

  const [events] = useState<AuditHistoryEvent[]>(MOCK_AUDIT_EVENTS);
  const [filters, setFilters] = useState<HistoryFilterState>({
    dateFrom: '2026-10-01',
    dateTo: '2026-10-31',
    location: 'Todas',
    action: 'Todas',
    userQuery: '',
  });

  const [dateError, setDateError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditHistoryEvent | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (filters.dateFrom && ev.fecha < filters.dateFrom) return false;
      if (filters.dateTo && ev.fecha > filters.dateTo) return false;
      if (filters.location !== 'Todas' && !ev.ubicacion.includes(filters.location)) return false;
      if (filters.action !== 'Todas' && ev.accion !== filters.action) return false;
      if (filters.userQuery.trim()) {
        const q = filters.userQuery.toLowerCase();
        const matches =
          ev.usuario.toLowerCase().includes(q) ||
          ev.numeroEmpleado.toLowerCase().includes(q) ||
          ev.detalle.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [events, filters]);

  // Estadísticas para el panel lateral de resumen
  const stats = useMemo(() => {
    const uniqueUsers = new Set(filteredEvents.map((e) => e.usuario));
    const uniqueActions = new Set(filteredEvents.map((e) => e.accion));
    return {
      totalMovements: filteredEvents.length,
      usersCount: uniqueUsers.size,
      actionsCount: uniqueActions.size,
    };
  }, [filteredEvents]);

  const handleDateChange = (from: string, to: string) => {
    if (from && to && from > to) {
      setDateError('La fecha "Desde" no puede ser posterior a la fecha "Hasta".');
      return;
    }
    setDateError('');
    setFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
  };

  const handleExportCsv = () => {
    if (!canDownloadHistory) {
      setToastMessage('No cuentas con el permiso HISTORY_DOWNLOAD para exportar la bitácora.');
      return;
    }

    const headers = ['ID', 'Fecha', 'Hora', 'Acción', 'Módulo', 'Usuario', 'No. Empleado', 'Ubicación', 'Detalle', 'Valor Anterior', 'Valor Nuevo', 'Motivo', 'Fecha Aplicación'];
    const lines = filteredEvents.map((e) =>
      [
        e.id,
        e.fecha,
        e.hora,
        e.accion,
        e.modulo,
        e.usuario,
        e.numeroEmpleado,
        e.ubicacion,
        e.detalle,
        e.valorAnterior ?? '',
        e.valorNuevo ?? '',
        e.motivo,
        e.fechaAplicacion,
      ]
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(','),
    );

    const csvContent = '\uFEFF' + [headers.join(','), ...lines].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historial_auditoria_${filters.dateFrom}_a_${filters.dateTo}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage('Bitácora de auditoría exportada en formato CSV con éxito.');
  };

  return (
    <section className="his-page">
      <nav className="his-breadcrumb" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <span aria-hidden="true">›</span>
        <strong>Historial de Movimientos y Auditoría</strong>
      </nav>

      <header className="his-header">
        <div className="his-header__left">
          <span className="his-pill">CU-HIS-001: Auditoría Transversal</span>
          <h1 className="his-title">Consulta del historial</h1>
          <p className="his-subtitle">
            Consulta los movimientos y cambios realizados en la estructura.
          </p>
        </div>

        <div className="his-header__actions">
          <button
            type="button"
            className="his-btn his-btn--export"
            disabled={!canDownloadHistory || filteredEvents.length === 0}
            onClick={handleExportCsv}
            title={!canDownloadHistory ? 'Permiso HISTORY_DOWNLOAD requerido' : 'Descargar bitácora en CSV'}
          >
            Descargar CSV
          </button>
        </div>
      </header>

      {/* Barra de Filtros */}
      <div className="his-filters-card">
        <div className="his-filters-grid">
          <div className="his-field">
            <label htmlFor="his-from">Desde *:</label>
            <input
              id="his-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleDateChange(e.target.value, filters.dateTo)}
            />
          </div>

          <div className="his-field">
            <label htmlFor="his-to">Hasta *:</label>
            <input
              id="his-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleDateChange(filters.dateFrom, e.target.value)}
            />
          </div>

          <div className="his-field">
            <label htmlFor="his-loc">Ubicación / Formato:</label>
            <select
              id="his-loc"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="Todas">Todas las ubicaciones</option>
              <option value="Insurgentes">Liverpool Insurgentes</option>
              <option value="Santa Fe">Liverpool Santa Fe / PAC</option>
              <option value="Buenavista">Suburbia Buenavista</option>
              <option value="Corporativo">Corporativo</option>
            </select>
          </div>

          <div className="his-field">
            <label htmlFor="his-action">Tipo de Acción:</label>
            <select
              id="his-action"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            >
              <option value="Todas">Todas las acciones</option>
              <option value="CREAR_GRUPO">CREAR_GRUPO</option>
              <option value="MOVER_SECCION">MOVER_SECCION</option>
              <option value="ELIMINAR_GRUPO">ELIMINAR_GRUPO</option>
              <option value="ASIGNAR_EXCEPCION">ASIGNAR_EXCEPCION</option>
              <option value="EDITAR_ROL">EDITAR_ROL</option>
              <option value="PROGRAMAR_PUBLICACION">PROGRAMAR_PUBLICACION</option>
            </select>
          </div>

          <div className="his-field his-field--search">
            <label htmlFor="his-query">Buscar por Usuario o Detalle:</label>
            <div className="his-search-input-wrap">
              <SearchIcon />
              <input
                id="his-query"
                type="search"
                placeholder="Ej. Alejandro Martínez o EMP-001042"
                value={filters.userQuery}
                onChange={(e) => setFilters({ ...filters, userQuery: e.target.value })}
              />
              {filters.userQuery && (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={() => setFilters({ ...filters, userQuery: '' })}
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>
        </div>

        {dateError && (
          <p className="ge-modal__error" role="alert">
            {dateError}
          </p>
        )}
      </div>

      {/* Contenedor Principal: Tabla + Panel Lateral de Resumen */}
      <div className="his-content-layout">
        {/* Tabla de Movimientos */}
        <div className="his-table-section">
          {filteredEvents.length === 0 ? (
            <div className="ge-empty">
              <h3>No se encontraron registros de auditoría</h3>
              <p>Prueba ampliando el rango de fechas o modificando los filtros aplicados.</p>
              <button
                type="button"
                className="his-btn his-btn--secondary"
                onClick={() =>
                  setFilters({
                    dateFrom: '2026-10-01',
                    dateTo: '2026-10-31',
                    location: 'Todas',
                    action: 'Todas',
                    userQuery: '',
                  })
                }
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="his-table-wrapper">
              <table className="his-table">
                <thead>
                  <tr>
                    <th>Fecha / Hora</th>
                    <th>Acción</th>
                    <th>Módulo</th>
                    <th>Usuario Responsable</th>
                    <th>Ubicación / Depto</th>
                    <th>Detalle del Movimiento</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <strong>{ev.fecha}</strong>
                        <div className="his-subtext">{ev.hora} hrs</div>
                      </td>
                      <td>
                        <span className={`his-action-tag his-action-tag--${ev.accion.toLowerCase()}`}>
                          {ev.accion}
                        </span>
                      </td>
                      <td>{ev.modulo}</td>
                      <td>
                        <strong>{ev.usuario}</strong>
                        <div className="his-subtext">{ev.numeroEmpleado} · {ev.rol}</div>
                      </td>
                      <td>
                        <div>{ev.ubicacion}</div>
                        <div className="his-subtext">{ev.departamento}</div>
                      </td>
                      <td className="his-detail-cell">{ev.detalle}</td>
                      <td>
                        <button
                          type="button"
                          className="his-detail-btn"
                          onClick={() => setSelectedEvent(ev)}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Panel Lateral de Resumen Estadístico */}
        <aside className="his-summary-panel">
          <h2 className="his-summary-title">Resumen de Auditoría</h2>
          <div className="his-stat-box">
            <span>Movimientos registrados</span>
            <strong>{stats.totalMovements}</strong>
          </div>

          <div className="his-stat-box">
            <span>Usuarios activos en el periodo</span>
            <strong>{stats.usersCount}</strong>
          </div>

          <div className="his-stat-box">
            <span>Tipos de acción ejecutadas</span>
            <strong>{stats.actionsCount}</strong>
          </div>

          <div className="his-stat-box">
            <span>Ventana consultada</span>
            <small>{filters.dateFrom} al {filters.dateTo}</small>
          </div>

          <div className="his-legal-note">
            <span aria-hidden="true">🛡</span>
            <p>
              Todos los eventos son firmados criptográficamente y preservados en la bitácora central de seguridad conforme a la política corporativa de trazabilidad de Liverpool.
            </p>
          </div>
        </aside>
      </div>

      {/* Modal / Drawer: Detalle del Movimiento */}
      {selectedEvent && (
        <div
          className="ge-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
        >
          <div className="ge-modal ge-modal--wide" role="dialog" aria-labelledby="modal-ev-title">
            <div className="his-modal-header">
              <div>
                <span className="his-action-tag his-action-tag--highlight">
                  {selectedEvent.accion}
                </span>
                <h2 id="modal-ev-title" className="ge-modal__title">
                  Detalle del Evento #{selectedEvent.id}
                </h2>
                <p className="ge-modal__description">
                  {selectedEvent.modulo} · Registrado el {selectedEvent.fecha} a las {selectedEvent.hora} hrs
                </p>
              </div>
              <button
                type="button"
                className="ge-modal-close"
                onClick={() => setSelectedEvent(null)}
              >
                ✕
              </button>
            </div>

            <div className="his-modal-grid">
              <div>
                <span className="his-modal-label">Usuario que ejecutó la acción:</span>
                <strong>{selectedEvent.usuario}</strong> ({selectedEvent.numeroEmpleado})
                <div className="his-subtext">Puesto / Rol: {selectedEvent.rol}</div>
              </div>

              <div>
                <span className="his-modal-label">Ubicación y Departamento:</span>
                <strong>{selectedEvent.ubicacion}</strong>
                <div className="his-subtext">{selectedEvent.departamento}</div>
              </div>

              <div>
                <span className="his-modal-label">Fecha de Entrada en Vigor:</span>
                <strong>{selectedEvent.fechaAplicacion}</strong>
              </div>

              <div>
                <span className="his-modal-label">Motivo o Justificación Registrada:</span>
                <p className="his-motivo-box">{selectedEvent.motivo}</p>
              </div>
            </div>

            {/* Comparación Antes / Después */}
            <div className="his-diff-card">
              <h3>Comparación de Valores (Antes vs Después)</h3>
              <div className="his-diff-grid">
                <div className="his-diff-col his-diff-col--before">
                  <span className="his-diff-tag">Valor Anterior</span>
                  <div className="his-diff-content">
                    {selectedEvent.valorAnterior ?? 'Sin registro previo'}
                  </div>
                </div>

                <div className="his-diff-col his-diff-col--after">
                  <span className="his-diff-tag">Valor Nuevo / Resultante</span>
                  <div className="his-diff-content">
                    {selectedEvent.valorNuevo ?? 'Sin cambios adicionales'}
                  </div>
                </div>
              </div>
            </div>

            <div className="ge-modal__actions">
              <button
                type="button"
                className="ge-modal__submit"
                onClick={() => setSelectedEvent(null)}
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="gm-toast" role="status">
          <span>{toastMessage}</span>
          <button type="button" aria-label="Cerrar mensaje" onClick={() => setToastMessage('')}>
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
