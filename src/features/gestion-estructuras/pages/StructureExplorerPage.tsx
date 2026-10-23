import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MOCK_CORPORATIVO,
  MOCK_CORPORATIVO_BY_STRUCTURE,
  MOCK_OPERACIONES,
  MOCK_NODE_HISTORY,
} from '../mocks/gestionEstructuras.mocks';
import type { StructureNode, OperationsChild } from '../types/gestionEstructuras.types';
import OperacionesPage from './OperacionesPage';
import CorporativoPage from './CorporativoPage';
import '../styles/structureExplorer.css';

const referenceNodes: StructureNode[] = [
  {
    id: 'atizapan-management',
    nivel: 'gerencia',
    nombre: 'Gerencia Comercial',
    responsable: 'Ana Torres',
    resumen: '2 departamentos',
    hijos: [
      {
        id: 'dep-linea-blanca',
        nivel: 'departamento',
        nombre: 'Departamento Línea Blanca',
        responsable: 'Jazmín Cruz',
        resumen: '3 Grupos',
        hijos: [
          {
            id: 'group-001',
            nivel: 'grupo',
            nombre: 'Grupo 001',
            responsable: 'Jazmín Cruz',
            esHeredado: true,
            resumen: '2 secciones',
            parentDepartmentId: 'dep-linea-blanca',
            parentDepartmentName: 'Departamento Línea Blanca',
            hijos: [
              {
                id: 'refrigeracion',
                nivel: 'seccion',
                nombre: 'Refrigeración',
                responsable: 'Jazmín Cruz',
                esAncla: true,
                resumen: 'Sección Ancla',
              },
              {
                id: 'lavado',
                nivel: 'seccion',
                nombre: 'Lavado',
                responsable: 'Jazmín Cruz',
                resumen: 'Sección gestionada',
              },
            ],
          },
          {
            id: 'group-002',
            nivel: 'grupo',
            nombre: 'Grupo 002',
            responsable: 'Jazmín Cruz',
            esHeredado: true,
            resumen: 'Sin secciones',
            parentDepartmentId: 'dep-linea-blanca',
            parentDepartmentName: 'Departamento Línea Blanca',
          },
          {
            id: 'group-003',
            nivel: 'grupo',
            nombre: 'Grupo 003',
            responsable: 'Jazmín Cruz',
            resumen: 'Sin secciones',
            parentDepartmentId: 'dep-linea-blanca',
            parentDepartmentName: 'Departamento Línea Blanca',
          },
        ],
      },
      {
        id: 'dep-hogar',
        nivel: 'departamento',
        nombre: 'Departamento Hogar',
        responsable: 'Laura Gómez',
        resumen: 'Sin grupos',
      },
    ],
  },
];
function convertNode(node: OperationsChild): StructureNode {
  return { ...node, nivel: node.nivel ?? 'gerencia', hijos: node.hijos.map(convertNode) };
}
function initialPath(nodes: StructureNode[]): Set<string> {
  const ids = new Set<string>();
  let current: StructureNode | undefined = nodes[0];
  while (current) {
    ids.add(current.id);
    current = current.hijos?.[0];
  }
  return ids;
}

export function StructureExplorerPage({ corporate = false }: { corporate?: boolean }) {
  const navigate = useNavigate();
  const [zone, setZone] = useState('Zona Centro');
  const [location, setLocation] = useState('atizapan');
  const [period, setPeriod] = useState('2026-08');
  const [structure, setStructure] = useState('PAC');
  const [applied, setApplied] = useState({ zone, location, period, structure });
  const [view, setView] = useState<'diagram' | 'table'>('diagram');
  const [expanded, setExpanded] = useState(() =>
    initialPath(corporate ? MOCK_CORPORATIVO : referenceNodes)
  );
  const [showAllChildren, setShowAllChildren] = useState<Set<string>>(new Set());
  const [historyNode, setHistoryNode] = useState<StructureNode | null>(null);
  const [publicationsOpen, setPublicationsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<StructureNode | null>(null);
  const operation = MOCK_OPERACIONES.find((row) => row.id === applied.location);
  const nodes = corporate
    ? (MOCK_CORPORATIVO_BY_STRUCTURE[applied.structure] ?? MOCK_CORPORATIVO)
    : operation
      ? operation.hijos.map(convertNode)
      : referenceNodes;
  function consult(nextStructure = structure) {
    const nextNodes = corporate
      ? (MOCK_CORPORATIVO_BY_STRUCTURE[nextStructure] ?? MOCK_CORPORATIVO)
      : (MOCK_OPERACIONES.find((row) => row.id === location)?.hijos.map(convertNode) ??
        referenceNodes);
    setApplied({ zone, location, period, structure: nextStructure });
    setExpanded(initialPath(nextNodes));
    setSelectedNode(null);
  }
  function manage(node: StructureNode) {
    const deptId = node.nivel === 'departamento' ? node.id : node.parentDepartmentId;
    if (!deptId) return;
    navigate(
      `/structures/operations/departments/${encodeURIComponent(deptId)}/groups?deptName=${encodeURIComponent(node.parentDepartmentName ?? node.nombre)}${node.nivel === 'grupo' ? `&groupId=${encodeURIComponent(node.id)}` : ''}${corporate ? '&origin=corporate' : ''}&manager=${encodeURIComponent(node.responsable)}`
    );
  }
  function renderNode(node: StructureNode) {
    const children = node.hijos ?? [];
    const open = expanded.has(node.id);
    return (
      <li
        key={node.id}
        className={`structure-chart__branch structure-chart__branch--${node.nivel}`}
      >
        <div className="structure-chart__row">
          <button
            type="button"
            className={`structure-chart__node structure-chart__node--${node.nivel}${selectedNode?.id === node.id ? ' is-selected' : ''}`}
            aria-expanded={children.length ? open : undefined}
            onClick={() => {
              setSelectedNode(node);
              setExpanded((current) => {
                const next = new Set(current);
                if (next.has(node.id)) next.delete(node.id);
                else next.add(node.id);
                return next;
              });
            }}
          >
            {node.nombre}
            {node.esAncla && (
              <span className="structure-chart__anchor" title="Sección Ancla protegida">
                {' '}
                ▣
              </span>
            )}
          </button>
          {node.nivel !== 'seccion' && (
            <>
              <button
                type="button"
                className="structure-chart__count"
                aria-label={`Mostrar niveles de ${node.nombre}`}
                aria-pressed={showAllChildren.has(node.id)}
                onClick={() => {
                  setExpanded((current) => new Set([...current, node.id]));
                  setShowAllChildren((current) => {
                    const next = new Set(current);
                    if (next.has(node.id)) next.delete(node.id);
                    else next.add(node.id);
                    return next;
                  });
                }}
              >
                {node.resumen}
              </button>
              <span className="structure-chart__responsible">
                {node.esVacante ? 'Vacante' : `${node.responsable} - Responsable`}
                {node.esHeredado ? ' (heredado)' : ''}
              </span>
            </>
          )}
        </div>
        {open && children.length > 0 && (
          <ul
            className={
              children.every((child) => child.nivel === 'seccion')
                ? 'structure-chart__sections'
                : ''
            }
          >
            {(children.every((child) => child.nivel === 'seccion') || showAllChildren.has(node.id)
              ? children
              : children.slice(0, 1)
            ).map(renderNode)}
          </ul>
        )}
      </li>
    );
  }
  return (
    <section className="structure-explorer">
      <nav className="reference-breadcrumb" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> / <Link to="/structures">Gestión de Estructuras</Link>
      </nav>
      <header className="structure-explorer__header">
        <h1>
          {corporate
            ? 'Navegar de Zona a Ubicación'
            : applied.location.includes('suburbia')
              ? 'Estructura para Suburbia'
              : 'Gestión de Estructura para Liverpool'}
        </h1>
        <button
          type="button"
          className="structure-explorer__view"
          onClick={() => setView(view === 'diagram' ? 'table' : 'diagram')}
        >
          {view === 'diagram' ? 'Vista de tabla' : 'Vista de organigrama'}
        </button>
      </header>
      {view === 'table' ? (
        corporate ? (
          <CorporativoPage />
        ) : (
          <OperacionesPage />
        )
      ) : (
        <>
          <form
            className="structure-explorer__filters"
            onSubmit={(e) => {
              e.preventDefault();
              consult();
            }}
          >
            <label>
              Zona
              <select value={zone} onChange={(e) => setZone(e.target.value)}>
                <option>Zona Centro</option>
                <option>Zona 1 (Metropolitana)</option>
                <option>Zona 2 (Centro)</option>
                <option>Zona 3 (Norte)</option>
              </select>
            </label>
            <label>
              Ubicación
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                {corporate ? (
                  <option value="atizapan">Corporativo único</option>
                ) : (
                  <>
                    <option value="atizapan">Liverpool - Atizapán</option>
                    {MOCK_OPERACIONES.filter(
                      (row) => zone === 'Zona Centro' || zone === row.zona
                    ).map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.nombre}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </label>
            <label>
              Periodo
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                {Array.from({ length: 36 }, (_, i) => {
                  const date = new Date(2025, i, 1);
                  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  return (
                    <option key={value} value={value}>
                      {new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(
                        date
                      )}
                    </option>
                  );
                })}
              </select>
            </label>
            <button className="structure-explorer__consult" type="submit">
              Consultar
            </button>
            <button
              className="structure-explorer__future"
              type="button"
              onClick={() => setPublicationsOpen(true)}
            >
              Consulta
              <br />
              Publicaciones futuras
            </button>
          </form>
          {corporate && (
            <div
              className="structure-explorer__formats"
              role="group"
              aria-label="Estructura corporativa"
            >
              {['PAC', 'Hardline', 'Softline'].map((format) => (
                <button
                  type="button"
                  key={format}
                  aria-pressed={applied.structure === format}
                  onClick={() => {
                    setStructure(format);
                    consult(format);
                  }}
                >
                  {format}
                </button>
              ))}
            </div>
          )}
          <div className="structure-chart" aria-label="Organigrama de la estructura comercial">
            <ul>{nodes.map(renderNode)}</ul>
          </div>
          {selectedNode && (
            <div className="structure-explorer__selection">
              <span>
                <strong>{selectedNode.nombre}</strong> · {selectedNode.responsable} ·{' '}
                {selectedNode.resumen}
              </span>
              <div>
                <button type="button" onClick={() => setHistoryNode(selectedNode)}>
                  Ver historial
                </button>
                {(selectedNode.nivel === 'departamento' || selectedNode.parentDepartmentId) && (
                  <button type="button" onClick={() => manage(selectedNode)}>
                    Administrar grupos y secciones
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {publicationsOpen && (
        <div className="ge-modal-backdrop">
          <section
            className="ge-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="explorer-publications"
          >
            <h2 id="explorer-publications">Publicaciones futuras programadas</h2>
            <p>Consulta los cambios estructurales y su fecha de aplicación en la planeación.</p>
            <div className="ge-modal__actions">
              <button type="button" onClick={() => setPublicationsOpen(false)}>
                Cerrar
              </button>
              <button
                type="button"
                className="ge-modal__submit"
                onClick={() => navigate('/structures/planning')}
              >
                Ver publicaciones
              </button>
            </div>
          </section>
        </div>
      )}
      {historyNode && (
        <div className="ge-modal-backdrop">
          <section
            className="ge-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="explorer-history"
          >
            <h2 id="explorer-history">Historial: {historyNode.nombre}</h2>
            {MOCK_NODE_HISTORY.map((entry) => (
              <p key={entry.id}>
                <strong>{entry.accion}</strong> · {entry.fecha}
                <br />
                {entry.detalle}
              </p>
            ))}
            <button type="button" onClick={() => setHistoryNode(null)}>
              Cerrar historial
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
