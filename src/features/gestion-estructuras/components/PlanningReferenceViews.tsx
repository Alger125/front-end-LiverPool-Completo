import type {
  OperationalCalendarMilestone,
  StructureDiffItem,
} from '../types/futurePlanning.types';
import '../styles/planningReference.css';

export function StructureComparison({ items }: { items: StructureDiffItem[] }) {
  const currentGroups = [...new Set(items.map((item) => item.currentGroup))];
  const futureGroups = [...new Set(items.map((item) => item.futureGroup))];
  function groupCards(groups: string[], future: boolean) {
    return groups.map((group) => {
      const sections = items.filter(
        (item) => (future ? item.futureGroup : item.currentGroup) === group
      );
      const changed = future && sections.some((item) => item.status !== 'Vigente');
      return (
        <article
          className={`planning-group ${changed ? 'planning-group--changed' : ''}`}
          key={group}
        >
          <header>
            <strong>{group}</strong>
            <span
              className={changed ? 'planning-status planning-status--changed' : 'planning-status'}
            >
              {changed ? 'Modificado' : 'Vigente'}
            </span>
          </header>
          <small>Secciones</small>
          <div className="planning-group__sections">
            {sections.map((section) => (
              <span
                key={section.id}
                title={future ? section.futureResponsible : section.currentResponsible}
              >
                {section.sectionName}
                {section.isAnchor ? ' ▣' : ''}
              </span>
            ))}
          </div>
        </article>
      );
    });
  }
  if (!items.length)
    return (
      <p role="status" className="planning-empty">
        No se encontraron cambios con los filtros seleccionados.
      </p>
    );
  return (
    <div className="planning-comparison">
      <section className="planning-period">
        <header>
          <h2>Octubre 2026 | Actual</h2>
          <span className="planning-status">Vigente</span>
        </header>
        {groupCards(currentGroups, false)}
      </section>
      <span className="planning-comparison__arrow" aria-hidden="true">
        ➜
      </span>
      <section className="planning-period">
        <header>
          <h2>Noviembre 2026 | Planificación</h2>
          <span className="planning-status planning-status--future">En edición</span>
        </header>
        {groupCards(futureGroups, true)}
        <p className="planning-period__note">
          Los cambios se aplicarán en su fecha de publicación.
        </p>
      </section>
    </div>
  );
}

export function OperationalCalendar({
  period,
  milestones,
}: {
  period: string;
  milestones: OperationalCalendarMilestone[];
}) {
  const month = period.startsWith('Noviembre') ? 10 : 9;
  const offset = new Date(2026, month, 1).getDay();
  const days = new Date(2026, month + 1, 0).getDate();
  return (
    <div className="planning-calendar-layout">
      <section className="planning-calendar">
        <h2>{period} | Ventana de planificación</h2>
        <div className="planning-calendar__days">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
            <span key={i}>{day}</span>
          ))}
        </div>
        <div className="planning-calendar__grid">
          {Array.from({ length: offset }, (_, i) => (
            <span aria-hidden="true" key={`empty-${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const milestone = milestones.find((m) => m.day === i + 1);
            return (
              <div
                key={i}
                className={`${i + 1 >= 27 ? 'is-closing' : ''} ${milestone ? 'has-milestone' : ''}`}
                title={milestone ? `${milestone.title}: ${milestone.description}` : undefined}
              >
                <span>{i + 1}</span>
                {milestone && <small>{milestone.title}</small>}
              </div>
            );
          })}
        </div>
        <p className="planning-calendar__legend">27–31: Ventana de cierre y validación</p>
      </section>
      <aside className="planning-calendar__notices">
        <article>
          <h3>Aviso permanente</h3>
          <p>Los cambios se aplican en su fecha de publicación programada.</p>
        </article>
        <article className="is-warning">
          <h3>Recordatorio de cierre</h3>
          <p>Termina la captura y valida los cambios antes del cierre del periodo.</p>
        </article>
        <article className="is-danger">
          <h3>Periodo cerrado</h3>
          <p>
            El calendario operativo controla las ediciones. Las consultas permanecen disponibles.
          </p>
        </article>
      </aside>
    </div>
  );
}

export function PendingStructureChanges({
  items,
  saved,
  onSave,
}: {
  items: StructureDiffItem[];
  saved: boolean;
  onSave: () => void;
}) {
  const changes = items.filter((item) => item.status !== 'Vigente');
  return (
    <div className="planning-pending">
      <section className="planning-pending__list">
        <h2>Cambios pendientes | Noviembre 2026</h2>
        {changes.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.sectionName}</strong>
              <p>
                {item.currentGroup} → {item.futureGroup}
              </p>
            </div>
            <span className="planning-status planning-status--changed">{item.status}</span>
          </article>
        ))}
        {!changes.length && <p role="status">No hay cambios pendientes.</p>}
      </section>
      <aside className="planning-pending__summary">
        <h2>Resumen de impacto</h2>
        <ul>
          <li>{changes.length} cambios pendientes</li>
          <li>{new Set(changes.map((item) => item.futureGroup)).size} grupos afectados</li>
          <li>
            {new Set(changes.flatMap((item) => item.impactedCollaborators)).size} colaboradores
            impactados
          </li>
          <li>Aplicación: Noviembre 2026</li>
        </ul>
        <p>La estructura actual permanece vigente hasta la fecha de aplicación.</p>
        <button type="button" disabled={saved || !changes.length} onClick={onSave}>
          {saved ? 'Planificación guardada' : 'Guardar planificación'}
        </button>
      </aside>
    </div>
  );
}
