import { LINEA_BLANCA_GROUPS, LINEA_BLANCA_SECTIONS } from '../mocks/referenceGroups.mocks';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { appendAuditLogEntry, useSession } from '../../../shared/auth';
import {
  CloseIcon,
  PlusIcon,
  SearchIcon,
} from '../../../shared/components/AppIcons';

import { CreateGroupModal } from '../components/CreateGroupModal';
import {
  assignSectionBackend,
  createGroupBackend,
  deleteGroupBackend,
  fetchDepartmentGroupsBackend,
  moveSectionBackend,
  publishDepartmentBackend,
  renameGroupBackend,
  unassignSectionBackend,
} from '../api/structures.api';
import {
  MOCK_AVAILABLE_SECTIONS,
  MOCK_GROUPS,
  MOCK_SCHEDULED_PUBLICATIONS,
} from '../mocks/groupManagement.mocks';
import type {
  CommercialGroup,
  PendingSectionMovement,
  ScheduledPublicationItem,
} from '../types/groupManagement.types';

import '../styles/groupManagement.css';

type ActiveWorkspaceTab = 'sections' | 'table' | 'move';

function formatDepartmentLabel(
  departmentId: string | undefined,
  deptNameParam: string | null,
): string {
  if (deptNameParam && deptNameParam.trim()) {
    return deptNameParam.trim();
  }
  if (!departmentId) {
    return 'Departamento Belleza';
  }
  const map: Record<string, string> = {
    'dep-perfumeria': 'Departamento Perfumería y Cosméticos',
    'dep-damas': 'Departamento Damas y Calzado',
    'dep-caballeros': 'Departamento Caballeros',
    'dep-electronica': 'Departamento Multimedia y Pantallas',
    'dep-hogar': 'Departamento Muebles y Hogar',
    'corp-dep-perfumeria': 'Depto. 101 - Perfumería y Cosméticos',
    'corp-dep-calzado': 'Depto. 204 - Calzado y Marroquinería',
    'corp-dep-computo': 'Depto. 502 - Cómputo y Telefonía',
    'corp-dep-vestir-dama': 'Depto. 301 - Ropa Exterior Dama',
  };
  return map[departmentId] ?? 'Departamento Belleza';
}

export default function DepartmentGroupsPage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const [searchParams] = useSearchParams();
  const session = useSession();

  const initialGroupParam = searchParams.get('groupId');
  const availableSections = departmentId === 'dep-linea-blanca' ? LINEA_BLANCA_SECTIONS : MOCK_AVAILABLE_SECTIONS;
  const initialGroups = departmentId === 'dep-linea-blanca' ? LINEA_BLANCA_GROUPS : MOCK_GROUPS;
  const deptNameParam = searchParams.get('deptName');
  const managerParam = searchParams.get('manager');
  const originParam = searchParams.get('origin');

  const departmentLabel = formatDepartmentLabel(departmentId, deptNameParam);
  const managerLabel = managerParam || 'Alejandro Martínez Soto';
  const isCorporateOrigin =
    originParam === 'corporate' ||
    Boolean(departmentId?.startsWith('corp-'));

  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>(initialGroupParam ? 'sections' : 'table');
  const [groups, setGroups] = useState<CommercialGroup[]>(initialGroups);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    if (
      initialGroupParam &&
      initialGroups.some((g) => g.id === initialGroupParam)
    ) {
      return initialGroupParam;
    }
    return 'group-004';
  });

  useEffect(() => {
    if (
      initialGroupParam &&
      groups.some((group) => group.id === initialGroupParam)
    ) {
      setSelectedGroupId(initialGroupParam);
    }
  }, [initialGroupParam, groups]);

  useEffect(() => {
    fetchDepartmentGroupsBackend(departmentId)
      .then((backendGroups) => {
        if (backendGroups && backendGroups.length > 0) {
          const mapped: CommercialGroup[] = backendGroups.map((bg) => ({
            id: bg.id,
            name: bg.name,
            description: bg.displayCode
              ? `${bg.displayCode} - Grupo Operativo`
              : 'Grupo comercial',
            sectionIds: (bg.sections ?? []).map((s) => s.id),
            anchorSectionIds: (bg.sections ?? [])
              .filter((s) => s.isAnchor)
              .map((s) => s.id),
            responsables: (bg.collaborators ?? []).map((c) => c.fullName),
            esHeredado: (bg.collaborators ?? []).length === 0,
            updatedAt: 'Hoy · Base de Datos PostgreSQL',
            anchoredCollaboratorsCount: (bg.collaborators ?? []).length,
          }));
          setGroups(mapped);
          if (mapped[0] && !initialGroupParam) {
            setSelectedGroupId(mapped[0].id);
          }
        }
      })
      .catch(() => {
        // Fallback to initial mock groups in test or offline environment
      });
  }, [departmentId, initialGroupParam]);

  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('Octubre');
  const [modalOpen, setModalOpen] = useState(false);
  const [renameTargetGroup, setRenameTargetGroup] =
    useState<CommercialGroup | null>(null);
  const [deleteTargetGroup, setDeleteTargetGroup] =
    useState<CommercialGroup | null>(null);
  const [unsavedChangesCount, setUnsavedChangesCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [scheduledPublications, setScheduledPublications] = useState<
    ScheduledPublicationItem[]
  >(MOCK_SCHEDULED_PUBLICATIONS);

  // Estado para CU-ADM-004: Mover secciones entre grupos
  const [sourceGroupId, setSourceGroupId] = useState<string>('group-001');
  const [targetGroupId, setTargetGroupId] = useState<string>('group-004');
  const [pendingMovements, setPendingMovements] = useState<
    PendingSectionMovement[]
  >([]);
  const [confirmMoveModalOpen, setConfirmMoveModalOpen] = useState(false);

  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) ?? groups[0];

  const allAssignedSectionIds = useMemo(() => {
    const set = new Set<string>();
    for (const group of groups) {
      for (const secId of group.sectionIds) {
        set.add(secId);
      }
    }
    return set;
  }, [groups]);

  const filteredSections = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return availableSections;
    }

    return availableSections.filter((section) =>
      `${section.name} ${section.description} ${section.code ?? ''}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [search, availableSections]);

  const selectedSections = useMemo(
    () =>
      availableSections.filter((section) =>
        selectedGroup?.sectionIds.includes(section.id),
      ),
    [selectedGroup, availableSections],
  );

  const handleCreateGroup = (name: string, description?: string) => {
    const nextNumber = groups.length + 1;

    const newGroup: CommercialGroup = {
      id: `group-${String(nextNumber).padStart(3, '0')}`,
      name,
      description:
        description || 'Nuevo contenedor comercial de secciones',
      sectionIds: [],
      anchorSectionIds: [],
      responsables: [managerLabel],
      esHeredado: true,
      updatedAt: 'Hoy · 19 Oct 2026',
      anchoredCollaboratorsCount: 0,
    };

    setGroups((current) => [...current, newGroup]);
    setSelectedGroupId(newGroup.id);
    setModalOpen(false);
    setUnsavedChangesCount((c) => c + 1);
    setSuccessMessage('Grupo creado con éxito');

    void createGroupBackend(departmentId, name).catch(() => {});

    appendAuditLogEntry({
      action: 'GROUP_CREATED',
      actorId: session?.user.employeeNumber ?? 'EMP-001',
      actorName: session?.user.fullName ?? 'Administrador',
      module: 'STRUCTURES_GROUPS',
      outcome: 'SUCCESS',
      detail: `Creación de grupo comercial ${newGroup.name} en ${departmentLabel}`,
    });
  };

  const handleRenameGroup = (newName: string, newDescription?: string) => {
    if (!renameTargetGroup) return;

    setGroups((current) =>
      current.map((group) =>
        group.id === renameTargetGroup.id
          ? {
              ...group,
              name: newName,
              description: newDescription ?? group.description,
              updatedAt: 'Hoy · 19 Oct 2026',
            }
          : group,
      ),
    );
    void renameGroupBackend(renameTargetGroup.id, newName).catch(() => {});
    setRenameTargetGroup(null);
    setUnsavedChangesCount((c) => c + 1);
    setSuccessMessage(`Grupo actualizado a "${newName}"`);
  };

  const handleAssignSection = (sectionId: string) => {
    if (!selectedGroup) return;

    setGroups((current) =>
      current.map((group) => {
        if (group.id === selectedGroup.id) {
          if (group.sectionIds.includes(sectionId)) {
            return group;
          }
          return {
            ...group,
            sectionIds: [...group.sectionIds, sectionId],
            updatedAt: 'Hoy · 19 Oct 2026',
          };
        }
        // Si estaba en otro grupo y no era ancla, se reasigna limpiamente
        if (
          group.sectionIds.includes(sectionId) &&
          !group.anchorSectionIds?.includes(sectionId)
        ) {
          return {
            ...group,
            sectionIds: group.sectionIds.filter((id) => id !== sectionId),
          };
        }
        return group;
      }),
    );

    void assignSectionBackend(selectedGroup.id, sectionId).catch(() => {});

    setUnsavedChangesCount((c) => c + 1);
    const secObj = availableSections.find((s) => s.id === sectionId);
    setSuccessMessage(
      `Sección "${secObj?.name ?? sectionId}" asignada a ${selectedGroup.name}`,
    );
  };

  const handleUnassignSection = (sectionId: string) => {
    if (!selectedGroup) return;

    if (selectedGroup.anchorSectionIds?.includes(sectionId)) {
      setSuccessMessage(
        'Movimiento no permitido: Las secciones Ancla (🔒) no pueden quedar sin grupo asignado.',
      );
      return;
    }

    setGroups((current) =>
      current.map((group) => {
        if (group.id !== selectedGroup.id) {
          return group;
        }
        return {
          ...group,
          sectionIds: group.sectionIds.filter((id) => id !== sectionId),
          updatedAt: 'Hoy · 19 Oct 2026',
        };
      }),
    );

    void unassignSectionBackend(selectedGroup.id, sectionId).catch(() => {});

    setUnsavedChangesCount((c) => c + 1);
    const secObj = availableSections.find((s) => s.id === sectionId);
    setSuccessMessage(
      `Sección "${secObj?.name ?? sectionId}" desasignada y devuelta a disponibles.`,
    );
  };

  const handleSaveChanges = () => {
    const newPub: ScheduledPublicationItem = {
      id: `sched-${Date.now()}`,
      effectiveDate: `01 ${period} 2026`,
      summary: `Actualización de secciones en ${selectedGroup?.name ?? 'grupos del departamento'}`,
      groupName: selectedGroup?.name ?? 'Grupo comercial',
      author: session?.user.fullName ?? 'Administrador de Estructuras',
      status: 'Programada',
    };
    setScheduledPublications((prev) => [newPub, ...prev]);
    setUnsavedChangesCount(0);
    setSuccessMessage(
      `Cambios guardados y programados exitosamente para el periodo ${period} 2026.`,
    );

    void publishDepartmentBackend(
      departmentId,
      '2026-10',
      `Publicación de ${selectedGroup?.name ?? 'departamento'}`,
    ).catch(() => {});
  };

  // Validación de elegibilidad para eliminar grupo (CU-ADM-003)
  const deleteEligibility = useMemo(() => {
    if (!deleteTargetGroup) {
      return { allowed: false, reason: '' };
    }
    if (groups.length <= 1) {
      return {
        allowed: false,
        reason:
          'No es posible eliminar el único grupo activo del departamento. El departamento debe conservar al menos un grupo comercial.',
      };
    }
    const anchorIds = deleteTargetGroup.anchorSectionIds ?? [];
    if (anchorIds.length > 0) {
      const anchorNames = availableSections.filter((s) =>
        anchorIds.includes(s.id),
      )
        .map((s) => s.name)
        .join(', ');
      return {
        allowed: false,
        reason: `El ${deleteTargetGroup.name} contiene la Sección Ancla (${anchorNames}) con colaboradores anclados y constituye el núcleo operativo del departamento.`,
      };
    }
    return { allowed: true, reason: '' };
  }, [deleteTargetGroup, groups.length, availableSections]);

  const handleConfirmDeleteGroup = () => {
    if (!deleteTargetGroup || !deleteEligibility.allowed) {
      return;
    }

    const releasedCount = deleteTargetGroup.sectionIds.length;
    const deletedName = deleteTargetGroup.name;
    const deletedId = deleteTargetGroup.id;
    const remainingGroups = groups.filter(
      (g) => g.id !== deleteTargetGroup.id,
    );

    setGroups(remainingGroups);
    if (selectedGroupId === deleteTargetGroup.id && remainingGroups[0]) {
      setSelectedGroupId(remainingGroups[0].id);
    }
    setDeleteTargetGroup(null);
    setSuccessMessage(
      `${deletedName} eliminado con éxito. ${releasedCount} sección(es) volvieron a estar disponibles.`,
    );

    void deleteGroupBackend(deletedId).catch(() => {});

    appendAuditLogEntry({
      action: 'GROUP_DELETED',
      actorId: session?.user.employeeNumber ?? 'EMP-001',
      actorName: session?.user.fullName ?? 'Administrador',
      module: 'STRUCTURES_GROUPS',
      outcome: 'SUCCESS',
      detail: `Eliminación de ${deletedName} en ${departmentLabel} (${releasedCount} secciones liberadas)`,
    });
  };

  // Funciones para CU-ADM-004: Mover secciones entre grupos
  const sourceGroup = groups.find((g) => g.id === sourceGroupId) ?? groups[0];
  const targetGroup =
    groups.find((g) => g.id === targetGroupId) ??
    groups[1] ??
    groups[0];

  const handleStageMoveSection = (sectionId: string) => {
    if (!sourceGroup || !targetGroup || sourceGroup.id === targetGroup.id) {
      return;
    }

    const section = availableSections.find((s) => s.id === sectionId);
    if (!section) return;

    // Verificar si ya está en cambios pendientes
    if (pendingMovements.some((m) => m.sectionId === sectionId)) {
      return;
    }

    const movement: PendingSectionMovement = {
      id: `move-${sectionId}-${Date.now()}`,
      sectionId: section.id,
      sectionName: section.name,
      sourceGroupId: sourceGroup.id,
      sourceGroupName: sourceGroup.name,
      targetGroupId: targetGroup.id,
      targetGroupName: targetGroup.name,
      impactedCollaborators: section.anchoredCollaborators ?? [
        managerLabel,
      ],
    };

    setPendingMovements((prev) => [...prev, movement]);
  };

  const handleRevertPendingMovement = (movementId: string) => {
    setPendingMovements((prev) => prev.filter((m) => m.id !== movementId));
  };

  const handleConfirmAllMovements = () => {
    if (pendingMovements.length === 0) return;

    for (const move of pendingMovements) {
      void moveSectionBackend(
        departmentId,
        move.sectionId,
        move.targetGroupId,
      ).catch(() => {});
    }

    setGroups((current) =>
      current.map((group) => {
        let nextSectionIds = [...group.sectionIds];
        let nextAnchorIds = [...(group.anchorSectionIds ?? [])];

        for (const move of pendingMovements) {
          if (group.id === move.sourceGroupId) {
            nextSectionIds = nextSectionIds.filter(
              (id) => id !== move.sectionId,
            );
            nextAnchorIds = nextAnchorIds.filter(
              (id) => id !== move.sectionId,
            );
          }
          if (
            group.id === move.targetGroupId &&
            !nextSectionIds.includes(move.sectionId)
          ) {
            nextSectionIds.push(move.sectionId);
          }
        }

        return {
          ...group,
          sectionIds: nextSectionIds,
          anchorSectionIds: nextAnchorIds,
          updatedAt: 'Hoy · 19 Oct 2026',
        };
      }),
    );

    const movedCount = pendingMovements.length;
    setPendingMovements([]);
    setConfirmMoveModalOpen(false);
    setSuccessMessage(
      `Se aplicaron ${movedCount} movimiento(s) de secciones entre grupos con éxito.`,
    );

    appendAuditLogEntry({
      action: 'SECTIONS_MOVED_BETWEEN_GROUPS',
      actorId: session?.user.employeeNumber ?? 'EMP-001',
      actorName: session?.user.fullName ?? 'Administrador',
      module: 'STRUCTURES_GROUPS',
      outcome: 'SUCCESS',
      detail: `Movimiento confirmado de ${movedCount} sección(es) entre grupos comerciales en ${departmentLabel}`,
    });
  };

  return (
    <section className="gm-page">
      <nav className="gm-breadcrumb" aria-label="Ruta de navegación">
        <Link to="/structures">Gestión de estructuras</Link>
        <span aria-hidden="true">›</span>

        <Link
          to={
            isCorporateOrigin
              ? '/structures/corporate'
              : '/structures/operations'
          }
        >
          {isCorporateOrigin
            ? 'Estructura Corporativa'
            : 'Liverpool Insurgentes'}
        </Link>

        <span aria-hidden="true">›</span>
        <span>
          {isCorporateOrigin
            ? 'Dirección Comercial'
            : 'Gerencia Almacén 1L'}
        </span>
        <span aria-hidden="true">›</span>
        <strong>{departmentLabel}</strong>
      </nav>

      {/* Cabecera contextual del Departamento (CU-ADM-001 / CU-ADM-002) */}
      <header className="gm-dept-header">
        <div className="gm-dept-header__info">
          <div className="gm-dept-header__badges">
            <span className="gm-pill gm-pill--primary">
              Contenedor de Grupos Comerciales
            </span>
            <span className="gm-pill">
              Responsable titular: <strong>{managerLabel}</strong>
            </span>
            <span className="gm-pill">
              {groups.length} grupos · {allAssignedSectionIds.size} secciones asignadas
            </span>
          </div>
          <h1 className="gm-dept-header__title">{activeTab === 'table' ? 'Administración de Grupos' : activeTab === 'sections' ? 'Editar Grupo' : 'Movimiento de Secciones entre Grupos'}</h1>
          <p className="gm-dept-header__subtitle">
            {departmentLabel} · {managerLabel}
          </p>
        </div>

        <div className="gm-dept-header__actions">
          <button
            type="button"
            className="gm-header-btn gm-header-btn--secondary"
            onClick={() => setModalOpen(true)}
          >
            <PlusIcon />
            Nuevo grupo
          </button>

          <button
            type="button"
            className="gm-header-btn gm-header-btn--primary"
            onClick={handleSaveChanges}
          >
            Guardar cambios
            {unsavedChangesCount > 0 && (
              <span className="gm-header-btn__badge">
                {unsavedChangesCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Pestañas de modo de trabajo: CU-ADM-002, CU-ADM-001, CU-ADM-004 */}
      <div className="gm-tabs" role="tablist" aria-label="Modos de administración de grupos">
        <button
          type="button"
          role="tab"
          aria-label="1. Administrar Grupos y Secciones"
          aria-selected={activeTab === 'sections'}
          className={
            activeTab === 'sections'
              ? 'gm-tab gm-tab--active'
              : 'gm-tab'
          }
          onClick={() => setActiveTab('sections')}
        >
          Editar grupos y secciones
        </button>

        <button
          type="button"
          role="tab"
          aria-label="2. Tabla Contenedora y Publicaciones"
          aria-selected={activeTab === 'table'}
          className={
            activeTab === 'table' ? 'gm-tab gm-tab--active' : 'gm-tab'
          }
          onClick={() => setActiveTab('table')}
        >
          Grupos y publicaciones
        </button>

        <button
          type="button"
          role="tab"
          aria-label="3. Mover Secciones entre Grupos"
          aria-selected={activeTab === 'move'}
          className={
            activeTab === 'move' ? 'gm-tab gm-tab--active' : 'gm-tab'
          }
          onClick={() => setActiveTab('move')}
        >
          Mover secciones entre grupos
          {pendingMovements.length > 0 && (
            <span className="gm-tab__badge">{pendingMovements.length}</span>
          )}
        </button>
      </div>

      {/* Barra de herramientas común */}
      <div className="gm-toolbar">
        <div className="gm-today">
          <span>Hoy</span>
          <strong>10 Septiembre 2026</strong>
        </div>

        <label className="gm-period">
          <span>Periodo</span>

          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="Septiembre">Septiembre</option>
            <option value="Octubre">Octubre</option>
            <option value="Noviembre">Noviembre</option>
            <option value="Diciembre">Diciembre</option>
          </select>
        </label>

        <div className="gm-search">
          <SearchIcon />

          <input
            type="search"
            value={search}
            placeholder="Buscar secciones"
            aria-label="Buscar secciones"
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setSearch('')}
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          VISTA 1: EDITOR DE 3 COLUMNAS (CU-ADM-002 Y CU-ADM-003)
         ===================================================================== */}
      {activeTab === 'sections' && (
        <div className="gm-columns">
          <section className="gm-column gm-column--groups">
            <h2>Grupos</h2>

            <div className="gm-group-list">
              {groups.map((group) => {
                const hasAnchor = (group.anchorSectionIds?.length ?? 0) > 0;
                const isSelected = group.id === selectedGroupId;

                return (
                  <div
                    key={group.id}
                    className={
                      isSelected
                        ? 'gm-group-card gm-group-card--selected'
                        : 'gm-group-card'
                    }
                  >
                    <button
                      type="button"
                      className={
                        isSelected
                          ? 'gm-group gm-group--selected'
                          : 'gm-group'
                      }
                      aria-pressed={isSelected}
                      onClick={() => setSelectedGroupId(group.id)}
                    >
                      <div className="gm-group__main">
                        <span className="gm-group__title">{group.name}</span>
                        <span className="gm-group__meta">
                          {group.sectionIds.length} secc.
                          {hasAnchor ? ' · 🔒 Ancla' : ''}
                        </span>
                      </div>
                      <span className="gm-group__menu" aria-hidden="true">
                        ⋮
                      </span>
                    </button>

                    <div className="gm-group-card__actions">
                      <button
                        type="button"
                        className="gm-mini-btn"
                        title={`Renombrar ${group.name}`}
                        aria-label={`Renombrar ${group.name}`}
                        onClick={() => setRenameTargetGroup(group)}
                      >
                        <span aria-hidden="true">✎</span>
                      </button>

                      <button
                        type="button"
                        className="gm-mini-btn gm-mini-btn--danger"
                        title={`Eliminar ${group.name}`}
                        aria-label={`Eliminar ${group.name}`}
                        onClick={() => setDeleteTargetGroup(group)}
                      >
                        <span aria-hidden="true">⌫</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="gm-create-button"
              onClick={() => setModalOpen(true)}
            >
              <PlusIcon />
              Crear nuevo grupo
            </button>
          </section>

          <section className="gm-column gm-column--selected">
            <div className="gm-column__header-row">
              <h2>
                Secciones de {selectedGroup?.name ?? 'grupo seleccionado'}
              </h2>
              {selectedGroup?.description && (
                <p className="gm-column__subtitle">
                  {selectedGroup.description}
                </p>
              )}
            </div>

            {selectedSections.length === 0 ? (
              <div className="gm-empty">
                <div className="gm-empty__box" aria-hidden="true">
                  ◇
                </div>

                <p>
                  No hay secciones para este grupo, agrégalas desde el
                  panel derecho.
                </p>
              </div>
            ) : (
              <ul className="gm-selected-sections">
                {selectedSections.map((section) => {
                  const isAnchor = Boolean(
                    selectedGroup?.anchorSectionIds?.includes(section.id),
                  );

                  return (
                    <li key={section.id} className="gm-selected-section-item">
                      <div className="gm-selected-section-item__info">
                        <div className="gm-selected-section-item__top">
                          <strong>{section.name}</strong>
                          {isAnchor && (
                            <span
                              className="gm-anchor-badge"
                              title="Sección Ancla protegida: no puede quedar huérfana ni desasignarse"
                            >
                              🔒 Sección Ancla
                            </span>
                          )}
                        </div>
                        <span className="gm-selected-section-item__desc">
                          {section.description}
                        </span>
                      </div>

                      <div className="gm-selected-section-item__actions">
                        <button
                          type="button"
                          className="gm-mini-btn"
                          onClick={() => {
                            if (selectedGroup) {
                              setSourceGroupId(selectedGroup.id);
                              const fallbackTarget =
                                groups.find(
                                  (g) => g.id !== selectedGroup.id,
                                )?.id ?? selectedGroup.id;
                              setTargetGroupId(fallbackTarget);
                            }
                            setActiveTab('move');
                          }}
                        >
                          ⇄ Mover
                        </button>

                        <button
                          type="button"
                          className="gm-mini-btn gm-mini-btn--danger"
                          disabled={isAnchor}
                          title={
                            isAnchor
                              ? 'Las secciones Ancla no pueden ser desasignadas'
                              : `Quitar ${section.name} de ${selectedGroup?.name}`
                          }
                          aria-label={`Quitar ${section.name} de ${selectedGroup?.name}`}
                          onClick={() => handleUnassignSection(section.id)}
                        >
                          {isAnchor ? 'Protegida' : 'Quitar'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="gm-column gm-column--available">
            <h2>Secciones disponibles</h2>

            <div className="gm-section-list">
              {filteredSections.map((section) => {
                const alreadyInSelected = Boolean(
                  selectedGroup?.sectionIds.includes(section.id),
                );
                const ownerGroup = groups.find((g) =>
                  g.sectionIds.includes(section.id),
                );

                return (
                  <article key={section.id} className="gm-section-card">
                    <span
                      className="gm-section-card__drag"
                      aria-hidden="true"
                    >
                      ⠿
                    </span>

                    <div className="gm-section-card__content">
                      <strong>{section.name}</strong>
                      <span>
                        {section.description}
                        {ownerGroup
                          ? ` · En ${ownerGroup.name}`
                          : ' · Disponible sin asignar'}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={alreadyInSelected}
                      aria-label={`Agregar ${section.name} a ${selectedGroup?.name}`}
                      title={
                        alreadyInSelected
                          ? `Ya pertenece a ${selectedGroup?.name}`
                          : `Agregar ${section.name} a ${selectedGroup?.name}`
                      }
                      onClick={() => handleAssignSection(section.id)}
                    >
                      <PlusIcon />
                    </button>
                  </article>
                );
              })}

              {filteredSections.length === 0 && (
                <p className="gm-no-results">
                  No se encontraron secciones.
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          VISTA 2: TABLA DE ADMINISTRACIÓN DE GRUPOS Y PUBLICACIONES (CU-ADM-001)
         ===================================================================== */}
      {activeTab === 'table' && (
        <div className="gm-table-workspace">
          <div className="gm-table-card">
            <div className="gm-table-card__header">
              <div>
                <h2>{departmentLabel}</h2>
                <p>
                  Grupos, secciones y responsables del departamento.
                </p>
              </div>
              <button
                type="button"
                className="gm-header-btn gm-header-btn--secondary"
                onClick={() => setModalOpen(true)}
              >
                <PlusIcon />
                Crear grupo
              </button>
            </div>

            <div className="gm-table-scroll">
              <table className="gm-containers-table">
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Descripción</th>
                    <th>Secciones asignadas</th>
                    <th>Responsables</th>
                    <th>Actualización</th>
                    <th>Publicación futura</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => {
                    const groupSections = availableSections.filter((s) =>
                      group.sectionIds.includes(s.id),
                    );
                    const primaryResp =
                      group.responsables?.[0] ?? managerLabel;
                    const extraRespCount = Math.max(
                      0,
                      (group.responsables?.length ?? 1) - 1,
                    );

                    return (
                      <tr key={group.id}>
                        <td>
                          <strong>{group.name}</strong>
                          {(group.anchorSectionIds?.length ?? 0) > 0 && (
                            <div>
                              <span className="gm-anchor-badge">
                                🔒 Con Sección Ancla
                              </span>
                            </div>
                          )}
                        </td>
                        <td>{group.description ?? 'Contenedor comercial'}</td>
                        <td><span className="gm-section-count" title={groupSections.map(section => section.name).join(', ')}>{groupSections.length}</span></td>
                        <td>
                          <div className="gm-resp-box">
                            <span>{primaryResp}</span>
                            {extraRespCount > 0 && (
                              <span
                                className="gm-resp-more"
                                title={group.responsables?.slice(1).join(', ')}
                              >
                                +{extraRespCount}
                              </span>
                            )}
                            {group.esHeredado && (
                              <span className="gm-inherited-tag">
                                ↳ Heredado
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{group.updatedAt ?? '15 Oct 2026'}</td>
                        <td>
                          {group.futurePublicationDate ? (
                            <span className="gm-future-tag">
                              📅 {group.futurePublicationDate}
                            </span>
                          ) : (
                            <span className="gm-muted">Vigente</span>
                          )}
                        </td>
                        <td>
                          <div className="gm-table-actions">
                            <button
                              type="button"
                              className="gm-mini-btn"
                              onClick={() => {
                                setSelectedGroupId(group.id);
                                setActiveTab('sections');
                              }}
                            >
                              Secciones
                            </button>
                            <button
                              type="button"
                              className="gm-mini-btn"
                              aria-label={`Renombrar ${group.name}`}
                        onClick={() => setRenameTargetGroup(group)}
                            >
                              <span aria-hidden="true">✎</span>
                            </button>
                            <button
                              type="button"
                              className="gm-mini-btn gm-mini-btn--danger"
                              aria-label={`Eliminar ${group.name}`}
                        onClick={() => setDeleteTargetGroup(group)}
                            >
                              <span aria-hidden="true">⌫</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bandeja inferior de Publicaciones Programadas (CU-ADM-001) */}
          <div className="gm-scheduled-tray">
            <h3>Publicaciones programadas</h3>
            <div className="gm-table-scroll"><table className="gm-containers-table"><thead><tr><th>Grupo</th><th>Movimiento programado</th><th>Fecha de aplicación</th><th>Programado por</th><th>Estado</th></tr></thead><tbody>
              {scheduledPublications.map(item => <tr key={item.id}><td><strong>{item.groupName}</strong></td><td>{item.summary}</td><td>{item.effectiveDate}</td><td>{item.author}</td><td><span className="gm-scheduled-status">{item.status}</span></td></tr>)}
            </tbody></table></div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VISTA 3: MOVER SECCIONES ENTRE GRUPOS (CU-ADM-004)
         ===================================================================== */}
      {activeTab === 'move' && (
        <div className="gm-move-workspace">
          <div className="gm-move-grid">
            {/* Panel Grupo Origen */}
            <div className="gm-move-panel">
              <label className="gm-move-select-label">
                <span>Grupo Origen</span>
                <select
                  aria-label="Seleccionar Grupo Origen"
                  value={sourceGroup?.id ?? ''}
                  onChange={(e) => setSourceGroupId(e.target.value)}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.sectionIds.length} secciones)
                    </option>
                  ))}
                </select>
              </label>

              <div className="gm-move-list">
                {sourceGroup?.sectionIds.length === 0 ? (
                  <p className="gm-muted">
                    Este grupo origen no tiene secciones asignadas.
                  </p>
                ) : (
                  sourceGroup?.sectionIds.map((secId) => {
                    const sec = availableSections.find(
                      (s) => s.id === secId,
                    );
                    if (!sec) return null;
                    const isStaged = pendingMovements.some(
                      (m) => m.sectionId === secId,
                    );
                    const isAnchor = Boolean(
                      sourceGroup.anchorSectionIds?.includes(secId),
                    );

                    return (
                      <div key={sec.id} className="gm-move-item">
                        <div>
                          <strong>{sec.name}</strong>
                          {isAnchor && (
                            <span className="gm-anchor-badge">
                              🔒 Ancla
                            </span>
                          )}
                          <p>{sec.description}</p>
                        </div>

                        <button
                          type="button"
                          className="gm-mini-btn"
                          disabled={
                            isStaged ||
                            isAnchor ||
                            sourceGroup.id === targetGroup?.id
                          }
                          title={
                            isAnchor
                              ? 'La Sección Ancla no puede moverse y dejar al grupo sin ancla'
                              : sourceGroup.id === targetGroup?.id
                                ? 'Selecciona un grupo destino distinto al origen'
                                : 'Mover sección al grupo destino'
                          }
                          onClick={() => handleStageMoveSection(sec.id)}
                        >
                          {isStaged
                            ? 'En bandeja →'
                            : isAnchor
                              ? '🔒 Fija'
                              : 'Mover al destino →'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Panel Grupo Destino */}
            <div className="gm-move-panel">
              <label className="gm-move-select-label">
                <span>Grupo Destino</span>
                <select
                  aria-label="Seleccionar Grupo Destino"
                  value={targetGroup?.id ?? ''}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.sectionIds.length} secciones)
                    </option>
                  ))}
                </select>
              </label>

              {sourceGroup?.id === targetGroup?.id && (
                <p className="ge-modal__error" role="alert">
                  Selecciona un Grupo Destino diferente al Grupo Origen para realizar movimientos.
                </p>
              )}

              <div className="gm-move-list">
                {targetGroup?.sectionIds.map((secId) => {
                  const sec = availableSections.find(
                    (s) => s.id === secId,
                  );
                  if (!sec) return null;
                  return (
                    <div
                      key={sec.id}
                      className="gm-move-item gm-move-item--dest"
                    >
                      <div>
                        <strong>{sec.name}</strong>
                        <p>Actualmente en {targetGroup.name}</p>
                      </div>
                      <span className="gm-pill">Actual</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bandeja inferior de Cambios pendientes de guardar (CU-ADM-004) */}
          <div className="gm-pending-tray">
            <div className="gm-pending-tray__header">
              <div>
                <h3>
                  Cambios pendientes de guardar ({pendingMovements.length})
                </h3>
                <p>
                  Revisa las secciones que cambiarán de grupo antes de confirmar el impacto en colaboradores anclados.
                </p>
              </div>

              <button
                type="button"
                className="gm-header-btn gm-header-btn--primary"
                disabled={pendingMovements.length === 0}
                onClick={() => setConfirmMoveModalOpen(true)}
              >
                Confirmar movimientos ({pendingMovements.length})
              </button>
            </div>

            {pendingMovements.length === 0 ? (
              <p className="gm-muted">
                No hay movimientos en espera. Usa el botón &ldquo;Mover al destino →&rdquo; en el panel izquierdo para agregar secciones.
              </p>
            ) : (
              <ul className="gm-pending-list">
                {pendingMovements.map((move) => (
                  <li key={move.id} className="gm-pending-item">
                    <div>
                      <strong>{move.sectionName}</strong>
                      <span>
                        {move.sourceGroupName} →{' '}
                        <strong>{move.targetGroupName}</strong>
                      </span>
                      <small>
                        Colaboradores anclados impactados:{' '}
                        {move.impactedCollaborators.join(', ')}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="gm-mini-btn"
                      onClick={() => handleRevertPendingMovement(move.id)}
                    >
                      ← Regresar al origen
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="gm-toast" role="status">
          <span>{successMessage}</span>

          <button
            type="button"
            aria-label="Cerrar mensaje"
            onClick={() => setSuccessMessage('')}
          >
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Modal para Crear Grupo (CU-ADM-002) */}
      <CreateGroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateGroup}
        parentDepartmentName={departmentLabel}
        existingGroupNames={groups.map((g) => g.name)}
        mode="create"
      />

      {/* Modal para Renombrar Grupo (CU-ADM-002) */}
      <CreateGroupModal
        open={Boolean(renameTargetGroup)}
        onClose={() => setRenameTargetGroup(null)}
        onCreate={handleRenameGroup}
        parentDepartmentName={departmentLabel}
        existingGroupNames={groups.map((g) => g.name)}
        mode="rename"
        initialName={renameTargetGroup?.name ?? ''}
        initialDescription={renameTargetGroup?.description ?? ''}
      />

      {/* Modal de Eliminación / Validación de Elegibilidad (CU-ADM-003) */}
      {deleteTargetGroup && (
        <div
          className="ge-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteTargetGroup(null);
            }
          }}
        >
          <div
            className="ge-modal ge-modal--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-group-modal-title"
          >
            {!deleteEligibility.allowed ? (
              <>
                <h2
                  id="delete-group-modal-title"
                  className="ge-modal__title"
                >
                  Movimiento no permitido
                </h2>
                <p className="ge-modal__description">
                  {deleteEligibility.reason}
                </p>
                <div className="gm-modal-parent-box">
                  <span>Regla de negocio (CU-ADM-003):</span>
                  <strong>
                    Los grupos que contienen Secciones Ancla (🔒) o que representan el único contenedor del departamento están protegidos contra eliminación.
                  </strong>
                </div>
                <div className="ge-modal__actions">
                  <button
                    type="button"
                    className="ge-modal__submit"
                    onClick={() => setDeleteTargetGroup(null)}
                  >
                    Entendido
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2
                  id="delete-group-modal-title"
                  className="ge-modal__title"
                >
                  ¿Estás seguro de eliminar {deleteTargetGroup.name}?
                </h2>
                <p className="ge-modal__description">
                  Al confirmar esta acción,{' '}
                  <strong>
                    {deleteTargetGroup.sectionIds.length} secciones volverán a estar disponibles
                  </strong>{' '}
                  en el panel de secciones del departamento para ser asignadas a otros grupos.
                </p>
                <div className="ge-modal__actions">
                  <button
                    type="button"
                    className="ge-modal__cancel"
                    onClick={() => setDeleteTargetGroup(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="ge-modal__submit"
                    onClick={handleConfirmDeleteGroup}
                  >
                    Eliminar grupo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Movimientos de Secciones (CU-ADM-004) */}
      {confirmMoveModalOpen && (
        <div
          className="ge-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setConfirmMoveModalOpen(false);
            }
          }}
        >
          <div
            className="ge-modal ge-modal--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-move-modal-title"
          >
            <h2 id="confirm-move-modal-title" className="ge-modal__title">
              Confirmar movimientos de secciones
            </h2>
            <p className="ge-modal__description">
              Estás por transferir{' '}
              <strong>{pendingMovements.length} sección(es)</strong> entre grupos comerciales. Los siguientes colaboradores anclados verán reflejado el ajuste en su contenedor:
            </p>

            <ul className="gm-pending-list">
              {pendingMovements.map((move) => (
                <li key={move.id} className="gm-pending-item">
                  <div>
                    <strong>{move.sectionName}</strong>
                    <span>
                      {move.sourceGroupName} →{' '}
                      <strong>{move.targetGroupName}</strong>
                    </span>
                    <small>
                      Colaboradores impactados:{' '}
                      {move.impactedCollaborators.join(', ')}
                    </small>
                  </div>
                </li>
              ))}
            </ul>

            <div className="ge-modal__actions">
              <button
                type="button"
                className="ge-modal__cancel"
                onClick={() => setConfirmMoveModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ge-modal__submit"
                onClick={handleConfirmAllMovements}
              >
                Confirmar y aplicar movimientos
              </button>
            </div>
          </div>
        </div>
      )}

      <span className="ge-visually-hidden">
        Departamento seleccionado: {departmentId}
      </span>
    </section>
  );
}