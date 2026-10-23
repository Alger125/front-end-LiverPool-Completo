import { StructureComparison, OperationalCalendar, PendingStructureChanges } from '../components/PlanningReferenceViews';
import { SHOW_DEMO_CONTROLS } from '../../../app/config/demo';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { appendAuditLogEntry, useSession } from '../../../shared/auth';
import {
  CloseIcon,
  PlusIcon,
  SearchIcon,
} from '../../../shared/components/AppIcons';

import {
  MOCK_CALENDAR_MILESTONES,
  MOCK_CONCURRENCY_STATE,
  MOCK_FUTURE_PUBLICATIONS,
  MOCK_STRUCTURE_DIFFS,
} from '../mocks/futurePlanning.mocks';
import type {
  OperationalCalendarMilestone,
  ScheduledFuturePublication,
  StructureDiffItem,
} from '../types/futurePlanning.types';

import '../styles/futurePlanning.css';

type PlanningTab = 'compare' | 'publications' | 'calendar' | 'pending';

export default function FuturePlanningPage() {
  const session = useSession();

  const [planningSaved, setPlanningSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<PlanningTab>('compare');
  const [currentPeriod, setCurrentPeriod] = useState<'Octubre 2026' | 'Noviembre 2026'>('Octubre 2026');
  const [filterDepartment, setFilterDepartment] = useState('Todos');
  const [search, setSearch] = useState('');
  const [isPeriodLocked, setIsPeriodLocked] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [showConcurrencyModal, setShowConcurrencyModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const [publications, setPublications] = useState<ScheduledFuturePublication[]>(
    MOCK_FUTURE_PUBLICATIONS,
  );
  const [diffItems] = useState<StructureDiffItem[]>(MOCK_STRUCTURE_DIFFS);
  const [milestones] = useState<OperationalCalendarMilestone[]>(
    MOCK_CALENDAR_MILESTONES,
  );

  // Formulario de nueva publicación futura (CU-ADM-006)
  const [newDepartment, setNewDepartment] = useState('Departamento Perfumería y Cosméticos');
  const [newSection, setNewSection] = useState('Sección 102 — Coctel y Evento Social');
  const [newSourceGroup, setNewSourceGroup] = useState('Grupo 001 — Gala y Noche');
  const [newTargetGroup, setNewTargetGroup] = useState('Grupo 002 — Casual y Tendencia');
  const [newDate, setNewDate] = useState('2026-11-01');
  const [newTime, setNewTime] = useState('00:00');
  const [newNotes, setNewNotes] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  const filteredDiffs = useMemo(() => {
    return diffItems.filter((item) => {
      if (filterDepartment !== 'Todos' && !item.departmentName.includes(filterDepartment)) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.sectionName.toLowerCase().includes(q) ||
        item.currentResponsible.toLowerCase().includes(q) ||
        item.futureResponsible.toLowerCase().includes(q) ||
        item.currentGroup.toLowerCase().includes(q) ||
        item.futureGroup.toLowerCase().includes(q)
      );
    });
  }, [diffItems, filterDepartment, search]);

  const handleCreatePublication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotes.trim()) {
      setScheduleError('Por favor escribe una justificación o nota operativa.');
      return;
    }
    const today = new Date();
    const scheduled = new Date(newDate);
    const diffMonths = (scheduled.getFullYear() - today.getFullYear()) * 12 + (scheduled.getMonth() - today.getMonth());
    if (diffMonths < 0 || diffMonths > 6) {
      setScheduleError('La fecha de publicación programada debe encontrarse dentro de la ventana de 6 meses.');
      return;
    }

    const newItem: ScheduledFuturePublication = {
      id: `pub-${Date.now()}`,
      departmentId: 'dep-custom',
      departmentName: newDepartment,
      sectionId: 'sec-custom',
      sectionName: newSection,
      sourceGroupId: 'grp-src',
      sourceGroupName: newSourceGroup,
      targetGroupId: 'grp-dst',
      targetGroupName: newTargetGroup,
      scheduledDate: newDate,
      scheduledTime: newTime,
      notes: newNotes.trim(),
      author: session?.user.fullName ?? 'Administrador de Estructuras',
      status: 'Programada',
      impactedCollaborators: ['Colaborador de sección', 'Jefe de Departamento'],
    };

    setPublications((prev) => [newItem, ...prev]);
    setShowScheduleModal(false);
    setNewNotes('');
    setScheduleError('');
    setSuccessToast(`Publicación programada exitosamente para el ${newDate}.`);

    appendAuditLogEntry({
      action: 'FUTURE_PUBLICATION_SCHEDULED',
      actorId: session?.user.employeeNumber ?? 'EMP-001',
      actorName: session?.user.fullName ?? 'Administrador',
      module: 'STRUCTURES_PLANNING',
      outcome: 'SUCCESS',
      detail: `Programación de publicación futura para ${newSection} hacia ${newTargetGroup} en ${newDate}`,
    });
  };

  const handleCancelPublication = (id: string, sectionName: string) => {
    if (isPeriodLocked) {
      setShowLockedModal(true);
      return;
    }
    setPublications((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Cancelada' as const } : p)),
    );
    setSuccessToast(`Publicación programada para ${sectionName} ha sido cancelada.`);

    appendAuditLogEntry({
      action: 'FUTURE_PUBLICATION_CANCELLED',
      actorId: session?.user.employeeNumber ?? 'EMP-001',
      actorName: session?.user.fullName ?? 'Administrador',
      module: 'STRUCTURES_PLANNING',
      outcome: 'SUCCESS',
      detail: `Cancelación de publicación programada ${id} para ${sectionName}`,
    });
  };

  return (
    <section className="fp-page">
      <nav className="fp-breadcrumb" aria-label="Ruta de navegación">
        <Link to="/structures">Gestión de estructuras</Link>
        <span aria-hidden="true">›</span>
        <strong>Planeación Futura y Publicaciones</strong>
      </nav>

      {/* Banner de Cierre de Periodo (CU-ADM-007) */}
      {isPeriodLocked && (
        <div className="fp-alert-banner fp-alert-banner--locked" role="alert">
          <div className="fp-alert-banner__content">
            <span className="fp-lock-icon" aria-hidden="true">
              🔒
            </span>
            <div>
              <strong>Edición deshabilitada: Periodo cerrado por cálculo de planes</strong>
              <p>
                El calendario operativo indica que el periodo comercial de Octubre 2026 ha concluido su ciclo de captura. Los cambios solo pueden ser consultados en modo solo lectura.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="fp-sim-btn"
            onClick={() => setIsPeriodLocked(false)}
          >
            Reabrir periodo (Simulador)
          </button>
        </div>
      )}

      {/* Cabecera Principal con Conmutador de Periodo (CU-ADM-005) */}
      <header className="fp-header">
        <div className="fp-header__left">
          <div className="fp-header__badges">
            <span className="fp-badge fp-badge--primary">Planeación Paralela (Mes Actual / Siguiente)</span>
            <span className={`fp-badge ${isPeriodLocked ? 'fp-badge--locked' : 'fp-badge--active'}`}>
              {isPeriodLocked ? '🔒 Periodo Bloqueado' : '● Periodo de Captura Activo'}
            </span>
          </div>
          <h1 className="fp-title">Planeación Futura y Publicaciones Estructurales</h1>
          <p className="fp-subtitle">
            Compara la estructura vigente contra la planificación de Mes+1, administra publicaciones programadas y verifica el calendario operativo.
          </p>
        </div>

        <div className="fp-header__actions">
          {/* Conmutador de Periodo Vigente vs Planificación */}
          <div className="fp-period-toggle">
            <button
              type="button"
              className={`fp-period-btn ${currentPeriod === 'Octubre 2026' ? 'fp-period-btn--active' : ''}`}
              onClick={() => setCurrentPeriod('Octubre 2026')}
            >
              Mes Actual (Octubre 2026)
            </button>
            <button
              type="button"
              className={`fp-period-btn ${currentPeriod === 'Noviembre 2026' ? 'fp-period-btn--active' : ''}`}
              onClick={() => setCurrentPeriod('Noviembre 2026')}
            >
              Planificación (Noviembre 2026)
            </button>
          </div>

          <button
            type="button"
            className="fp-action-btn fp-action-btn--primary"
            onClick={() => {
              if (isPeriodLocked) {
                setShowLockedModal(true);
              } else {
                setShowScheduleModal(true);
              }
            }}
          >
            <PlusIcon />
            Programar publicación futura
          </button>

          {SHOW_DEMO_CONTROLS && <>
          <button
            type="button"
            className="fp-action-btn fp-action-btn--secondary"
            title="Simular bloqueo de periodo para probar CU-ADM-007"
            onClick={() => setIsPeriodLocked(!isPeriodLocked)}
          >
            {isPeriodLocked ? 'Desbloquear periodo' : 'Simular cierre de periodo (🔒)'}
          </button>

          <button
            type="button"
            className="fp-action-btn fp-action-btn--secondary"
            title="Probar detección de concurrencia y conflicto 409 (CU-ADM-008)"
            onClick={() => setShowConcurrencyModal(true)}
          >
            Probar Concurrencia 409
          </button></>}
        </div>
      </header>

      {/* Pestañas de Vista (CU-ADM-005) */}
      <div className="fp-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'compare'}
          className={`fp-tab ${activeTab === 'compare' ? 'fp-tab--active' : ''}`}
          onClick={() => setActiveTab('compare')}
        >
          1. Comparar estructura actual y futura ({filteredDiffs.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'publications'}
          className={`fp-tab ${activeTab === 'publications' ? 'fp-tab--active' : ''}`}
          onClick={() => setActiveTab('publications')}
        >
          2. Cambios futuros programados ({publications.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'calendar'}
          className={`fp-tab ${activeTab === 'calendar' ? 'fp-tab--active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          3. Calendario operativo y avisos ({milestones.length})
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'pending'} className={`fp-tab ${activeTab === 'pending' ? 'fp-tab--active' : ''}`} onClick={() => setActiveTab('pending')}>Cambios futuros pendientes</button>
      </div>
      {activeTab === 'pending' && <PendingStructureChanges items={diffItems} saved={planningSaved} onSave={() => { setPlanningSaved(true); setSuccessToast('Planificación guardada.'); }} />}

      {/* =====================================================================
          TAB 1: COMPARAR ESTRUCTURA ACTUAL Y FUTURA (CU-ADM-005)
         ===================================================================== */}
      {activeTab === 'compare' && (
        <div className="fp-compare-container">
          <div className="fp-filters-bar">
            <div className="fp-filter-group">
              <label htmlFor="dept-filter">Departamento:</label>
              <select
                id="dept-filter"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="Todos">Todos los departamentos</option>
                <option value="Perfumería">Perfumería y Cosméticos</option>
                <option value="Vestidos">Vestidos de Fiesta</option>
                <option value="Damas">Damas y Calzado</option>
                <option value="Multimedia">Multimedia y Pantallas</option>
              </select>
            </div>

            <div className="fp-search-box">
              <SearchIcon />
              <input
                type="search"
                value={search}
                placeholder="Buscar sección, grupo o responsable..."
                aria-label="Buscar cambios estructurales"
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>

          <StructureComparison items={filteredDiffs} />
        </div>
      )}

      {/* =====================================================================
          TAB 2: PUBLICACIONES FUTURAS PROGRAMADAS (CU-ADM-006)
         ===================================================================== */}
      {activeTab === 'publications' && (
        <div className="fp-publications-container">
          <div className="fp-pub-header">
            <div>
              <h2>Bandeja de Publicaciones Programadas</h2>
              <p>Revisa, edita notas o cancela movimientos programados antes de su entrada en vigor automática.</p>
            </div>
            <button
              type="button"
              className="fp-action-btn fp-action-btn--primary"
              onClick={() => {
                if (isPeriodLocked) {
                  setShowLockedModal(true);
                } else {
                  setShowScheduleModal(true);
                }
              }}
            >
              <PlusIcon />
              Nueva Publicación
            </button>
          </div>

          <div className="fp-pub-list">
            {publications.map((item) => (
              <article key={item.id} className="fp-pub-card">
                <div className="fp-pub-card__left">
                  <div className="fp-pub-card__meta">
                    <span className="fp-badge fp-badge--primary">{item.departmentName}</span>
                    <span className={`fp-status-badge fp-status-badge--${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                    <time>Programado: {item.scheduledDate} a las {item.scheduledTime} hrs</time>
                  </div>
                  <h3 className="fp-pub-card__title">
                    {item.sectionName}
                  </h3>
                  <p className="fp-pub-card__route">
                    De: <strong>{item.sourceGroupName}</strong> → Hacia: <strong>{item.targetGroupName}</strong>
                  </p>
                  <p className="fp-pub-card__notes">
                    <strong>Motivo/Notas:</strong> {item.notes}
                  </p>
                  <small>
                    Registrado por: {item.author} · Colaboradores impactados: {item.impactedCollaborators.join(', ')}
                  </small>
                </div>

                <div className="fp-pub-card__actions">
                  {item.status !== 'Cancelada' && (
                    <button
                      type="button"
                      className="fp-danger-btn"
                      disabled={isPeriodLocked}
                      onClick={() => handleCancelPublication(item.id, item.sectionName)}
                    >
                      Cancelar publicación
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: CALENDARIO OPERATIVO Y AVISOS (CU-ADM-005)
         ===================================================================== */}
      {activeTab === 'calendar' && (
        <div className="fp-calendar-container"><OperationalCalendar period={currentPeriod} milestones={milestones} /></div>
      )}

      {/* =====================================================================
          MODAL: PROGRAMAR PUBLICACIÓN FUTURA (CU-ADM-006)
         ===================================================================== */}
      {showScheduleModal && (
        <div
          className="ge-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowScheduleModal(false);
          }}
        >
          <div className="ge-modal ge-modal--wide" role="dialog" aria-labelledby="modal-sched-title">
            <h2 id="modal-sched-title" className="ge-modal__title">
              Programar Publicación Futura (CU-ADM-006)
            </h2>
            <p className="ge-modal__description">
              Configura el traslado de sección y la fecha exacta en la que se aplicará el cambio en producción.
            </p>

            <form onSubmit={handleCreatePublication} noValidate>
              <div className="fp-form-group">
                <label htmlFor="modal-dept">Departamento comercial:</label>
                <input
                  id="modal-dept"
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                />
              </div>

              <div className="fp-form-group">
                <label htmlFor="modal-sec">Sección a mover:</label>
                <input
                  id="modal-sec"
                  type="text"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                />
              </div>

              <div className="fp-form-row">
                <div className="fp-form-group">
                  <label htmlFor="modal-src">Grupo Origen:</label>
                  <input
                    id="modal-src"
                    type="text"
                    value={newSourceGroup}
                    onChange={(e) => setNewSourceGroup(e.target.value)}
                  />
                </div>
                <div className="fp-form-group">
                  <label htmlFor="modal-dst">Grupo Destino:</label>
                  <input
                    id="modal-dst"
                    type="text"
                    value={newTargetGroup}
                    onChange={(e) => setNewTargetGroup(e.target.value)}
                  />
                </div>
              </div>

              <div className="fp-form-row">
                <div className="fp-form-group">
                  <label htmlFor="modal-date">Fecha de vigencia (Máximo 6 meses):</label>
                  <input
                    id="modal-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="fp-form-group">
                  <label htmlFor="modal-time">Hora de aplicación:</label>
                  <input
                    id="modal-time"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="fp-form-group">
                <label htmlFor="modal-notes">Notas / Justificación de la publicación *:</label>
                <textarea
                  id="modal-notes"
                  rows={3}
                  value={newNotes}
                  placeholder="Ej. Reorganización por remodelación de piso de venta para campaña navideña"
                  onChange={(e) => {
                    setNewNotes(e.target.value);
                    if (scheduleError) setScheduleError('');
                  }}
                />
              </div>

              {scheduleError && <p className="ge-modal__error">{scheduleError}</p>}

              <div className="ge-modal__actions">
                <button
                  type="button"
                  className="ge-modal__cancel"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="ge-modal__submit">
                  Confirmar y programar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: PERIODO CERRADO (CU-ADM-007)
         ===================================================================== */}
      {showLockedModal && (
        <div
          className="ge-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowLockedModal(false);
          }}
        >
          <div className="ge-modal" role="dialog" aria-labelledby="modal-lock-title">
            <h2 id="modal-lock-title" className="ge-modal__title">
              🔒 Periodo Comercial Cerrado
            </h2>
            <p className="ge-modal__description">
              El calendario operativo indica que el cálculo de planes de venta ha comenzado.
            </p>
            <div className="fp-modal-info-box">
              <span>Regla de negocio (CU-ADM-007):</span>
              <strong>
                No es posible realizar movimientos ni editar grupos en un periodo con estatus cerrado. Las modificaciones deben realizarse con fecha programada para el siguiente periodo comercial habilitado.
              </strong>
            </div>
            <div className="ge-modal__actions">
              <button
                type="button"
                className="ge-modal__submit"
                onClick={() => setShowLockedModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CONFLICTO DE CONCURRENCIA 409 (CU-ADM-008)
         ===================================================================== */}
      {showConcurrencyModal && (
        <div
          className="ge-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowConcurrencyModal(false);
          }}
        >
          <div className="ge-modal ge-modal--wide" role="dialog" aria-labelledby="modal-conc-title">
            <h2 id="modal-conc-title" className="ge-modal__title">
              ⚠️ Información actualizada por otro usuario (409)
            </h2>
            <p className="ge-modal__description">
              No fue posible guardar los cambios departamentales porque otro usuario guardó una modificación previa.
            </p>
            <div className="fp-concurrency-box">
              <div className="fp-concurrency-row">
                <span>Versión consultada por ti:</span>
                <strong>v{MOCK_CONCURRENCY_STATE.localVersion}</strong>
              </div>
              <div className="fp-concurrency-row">
                <span>Versión vigente en el servidor:</span>
                <strong className="fp-highlight-version">v{MOCK_CONCURRENCY_STATE.remoteVersion}</strong>
              </div>
              <div className="fp-concurrency-row">
                <span>Último usuario modificador:</span>
                <span>{MOCK_CONCURRENCY_STATE.lastModifiedBy}</span>
              </div>
              <div className="fp-concurrency-row">
                <span>Fecha y hora de actualización:</span>
                <span>{MOCK_CONCURRENCY_STATE.lastModifiedDate}</span>
              </div>
            </div>
            <p className="fp-concurrency-hint">
              Presiona <strong>Actualizar información</strong> para recargar la versión más reciente del departamento e integrar tus cambios sin sobrescribir el trabajo ajeno.
            </p>
            <div className="ge-modal__actions">
              <button
                type="button"
                className="ge-modal__cancel"
                onClick={() => setShowConcurrencyModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ge-modal__submit"
                onClick={() => {
                  setShowConcurrencyModal(false);
                  setSuccessToast('Datos departamentales sincronizados con la versión vigente v15.');
                }}
              >
                Actualizar información
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de Éxito */}
      {successToast && (
        <div className="gm-toast" role="status">
          <span>{successToast}</span>
          <button type="button" aria-label="Cerrar mensaje" onClick={() => setSuccessToast('')}>
            <CloseIcon />
          </button>
        </div>
      )}
    </section>
  );
}
