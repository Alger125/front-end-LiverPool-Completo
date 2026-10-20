import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { EstructurasFilters } from '../components/EstructurasFilters';
import { StructureTreeTable } from '../components/StructureTreeTable.tsx';
import {
  CORPORATE_STRUCTURES,
  MONTHS,
  YEARS,
} from '../constants/gestionEstructuras.constants';
import { fetchComprasPacTree } from '../api/structures.api';
import {
  MOCK_CORPORATIVO,
  MOCK_CORPORATIVO_BY_STRUCTURE,
} from '../mocks/gestionEstructuras.mocks';
import type { StructureNode } from '../types/gestionEstructuras.types';
import { filterStructureTree } from '../utils/filterStructureTree';

import '../styles/gestionEstructuras.css';

function collectCorporateFutureNodes(nodes: StructureNode[]): StructureNode[] {
  const result: StructureNode[] = [];
  const visit = (node: StructureNode) => {
    if (node.publicacionFutura) {
      result.push(node);
    }
    for (const child of node.hijos ?? []) {
      visit(child);
    }
  };
  nodes.forEach(visit);
  return result;
}

export default function CorporativoPage() {
  const navigate = useNavigate();
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('Octubre');
  const [structure, setStructure] = useState('PAC');
  const [search, setSearch] = useState('');
  const [showFutureModal, setShowFutureModal] = useState(false);

  useEffect(() => {
    const type = structure === 'COMPRAS' ? 'COMPRAS' : 'PAC';
    void fetchComprasPacTree(type).catch(() => {});
  }, [structure]);

  const activeStructureTree = useMemo(
    () => MOCK_CORPORATIVO_BY_STRUCTURE[structure] ?? MOCK_CORPORATIVO,
    [structure],
  );

  const filteredNodes = useMemo(
    () => filterStructureTree(activeStructureTree, search),
    [activeStructureTree, search],
  );

  const futurePublications = useMemo(
    () => collectCorporateFutureNodes(activeStructureTree),
    [activeStructureTree],
  );

  return (
    <section className="ge-page">
      <div className="ge-page-topbar">
        <div className="ge-page-topbar__left">
          <nav className="ge-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/structures">Gestión de estructuras</Link>
            <span aria-hidden="true">›</span>
            <span>Corporativo ({structure})</span>
          </nav>
          <h1 className="ge-page__title">Estructura Comercial Corporativa</h1>
          <p className="ge-page__description">
            Navega desde Dirección y Gerencia hasta Departamentos, Grupos y Secciones (con indicadores de Sección Ancla 🔒, herencia de responsable y vacantes).
          </p>
        </div>

        <div className="ge-page-topbar__right">
          <button
            type="button"
            className="ge-switch-view-btn"
            onClick={() => navigate('/structures/operations')}
          >
            Ir a Estructura de Operaciones →
          </button>
        </div>
      </div>

      <EstructurasFilters
        variant="corporativo"
        year={year}
        years={YEARS}
        onYearChange={setYear}
        month={month}
        months={MONTHS}
        onMonthChange={setMonth}
        structure={structure}
        structures={CORPORATE_STRUCTURES}
        onStructureChange={setStructure}
        searchValue={search}
        onSearchChange={setSearch}
        futurePublicationsCount={futurePublications.length}
        onViewFuturePublications={() => setShowFutureModal(true)}
      />

      <StructureTreeTable
        nodes={filteredNodes}
        forceOpen={search.trim().length > 0}
      />

      {showFutureModal && (
        <div
          className="ge-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowFutureModal(false);
            }
          }}
        >
          <div
            className="ge-modal ge-modal--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="future-corp-modal-title"
          >
            <div className="ge-history-header">
              <div>
                <h2 id="future-corp-modal-title" className="ge-modal__title">
                  Publicaciones futuras programadas — Corporativo ({structure})
                </h2>
                <p className="ge-modal__description">
                  Movimientos y creaciones de grupos comerciales programados para el próximo periodo en la estructura {structure}.
                </p>
              </div>
            </div>

            <div className="ge-history-list">
              {futurePublications.length === 0 ? (
                <p className="ge-empty">
                  No hay publicaciones futuras registradas para la estructura {structure}.
                </p>
              ) : (
                futurePublications.map((item) => (
                  <article key={item.id} className="ge-history-item">
                    <div className="ge-history-item__top">
                      <span className="ge-history-item__action">
                        {item.nombre} ({item.resumen})
                      </span>
                      <time className="ge-history-item__date">
                        Vigencia: {item.publicacionFutura}
                      </time>
                    </div>
                    <p className="ge-history-item__detail">
                      Responsable asignado: <strong>{item.responsable}</strong>
                      {item.parentDepartmentName
                        ? ` · Departamento padre: ${item.parentDepartmentName}`
                        : ''}
                    </p>
                    <div style={{ marginTop: '8px' }}>
                      <button
                        type="button"
                        className="ge-inline-link-btn"
                        onClick={() => {
                          setShowFutureModal(false);
                          const deptId = item.parentDepartmentId ?? item.id;
                          navigate(
                            `/structures/operations/departments/${deptId}/groups?groupId=${encodeURIComponent(item.id)}&deptName=${encodeURIComponent(item.parentDepartmentName ?? item.nombre)}&origin=corporate`,
                          );
                        }}
                      >
                        Administrar grupo y secciones →
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="ge-modal__actions">
              <button
                type="button"
                className="ge-modal__submit"
                onClick={() => setShowFutureModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}