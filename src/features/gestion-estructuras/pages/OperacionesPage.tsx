import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { EstructurasFilters } from '../components/EstructurasFilters';
import { EstructurasTable } from '../components/EstructurasTable';

import {
  BUSINESS_FORMATS,
  MONTHS,
  YEARS,
  ZONES,
} from '../constants/gestionEstructuras.constants';
import { fetchGeographyZones, fetchStoreTree } from '../api/structures.api';
import { MOCK_OPERACIONES } from '../mocks/gestionEstructuras.mocks';
import type {
  OperationsChild,
  StructureSummary,
} from '../types/gestionEstructuras.types';

import '../styles/gestionEstructuras.css';

function collectChildText(child: OperationsChild): string {
  const nested = (child.hijos ?? []).map(collectChildText).join(' ');
  return `${child.nombre} ${child.responsable} ${child.resumen} ${nested}`;
}

function collectSummaryText(row: StructureSummary): string {
  const childrenText = (row.hijos ?? []).map(collectChildText).join(' ');
  return `${row.nombre} ${row.responsable} ${row.resumen} ${childrenText}`;
}

function collectFuturePublications(
  rows: StructureSummary[],
): OperationsChild[] {
  const result: OperationsChild[] = [];
  const visit = (node: OperationsChild) => {
    if (node.publicacionFutura) {
      result.push(node);
    }
    for (const child of node.hijos ?? []) {
      visit(child);
    }
  };
  for (const row of rows) {
    for (const child of row.hijos ?? []) {
      visit(child);
    }
  }
  return result;
}

export default function OperacionesPage() {
  const navigate = useNavigate();
  const [businessFormat, setBusinessFormat] = useState<string>('Todos');
  const [zone, setZone] = useState<string>('Zona 1 (Metropolitana)');
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('Octubre');
  const [search, setSearch] = useState('');
  const [showFutureModal, setShowFutureModal] = useState(false);

  useEffect(() => {
    void fetchGeographyZones().catch(() => {});
    void fetchStoreTree('f62b081e-4cc2-518a-b840-a7afa915cd3d', '2026-10').catch(() => {});
  }, [zone]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return MOCK_OPERACIONES.filter((row) => {
      if (businessFormat !== 'Todos') {
        const matchesFormat =
          row.negocio?.toLowerCase() === businessFormat.toLowerCase() ||
          row.nombre
            .toLowerCase()
            .startsWith(businessFormat.toLowerCase());
        if (!matchesFormat) {
          return false;
        }
      }

      if (!normalizedSearch) {
        return true;
      }

      return collectSummaryText(row).toLowerCase().includes(normalizedSearch);
    });
  }, [businessFormat, search]);

  const futurePublications = useMemo(
    () => collectFuturePublications(MOCK_OPERACIONES),
    [],
  );

  return (
    <section className="ge-page">
      <div className="ge-page-topbar">
        <div className="ge-page-topbar__left">
          <nav className="ge-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/structures">Gestión de estructuras</Link>
            <span aria-hidden="true">›</span>
            <span>Operaciones (Tiendas / Almacenes)</span>
          </nav>
          <h1 className="ge-page__title">Estructura Comercial de Operaciones</h1>
          <p className="ge-page__description">
            Consulta y administra gerencias, departamentos, grupos y secciones (incluyendo Secciones Ancla 🔒 y responsables titulares o heredados).
          </p>
        </div>

        <div className="ge-page-topbar__right">
          <button
            type="button"
            className="ge-switch-view-btn"
            onClick={() => navigate('/structures/corporate')}
          >
            Ir a Estructura Corporativa →
          </button>
        </div>
      </div>

      <EstructurasFilters
        variant="operaciones"
        businessFormat={businessFormat}
        businessFormats={['Todos', ...BUSINESS_FORMATS]}
        onBusinessFormatChange={setBusinessFormat}
        zone={zone}
        zones={ZONES}
        onZoneChange={setZone}
        year={year}
        years={YEARS}
        onYearChange={setYear}
        month={month}
        months={MONTHS}
        onMonthChange={setMonth}
        searchValue={search}
        onSearchChange={setSearch}
        futurePublicationsCount={futurePublications.length}
        onViewFuturePublications={() => setShowFutureModal(true)}
      />

      <EstructurasTable
        rows={filteredRows}
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
            aria-labelledby="future-ops-modal-title"
          >
            <div className="ge-history-header">
              <div>
                <h2 id="future-ops-modal-title" className="ge-modal__title">
                  Publicaciones futuras programadas — Operaciones
                </h2>
                <p className="ge-modal__description">
                  Cambios organizacionales con fecha de entrada en vigor programada para los siguientes periodos comerciales.
                </p>
              </div>
            </div>

            <div className="ge-history-list">
              {futurePublications.map((item) => (
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
                          `/structures/operations/departments/${deptId}/groups?groupId=${encodeURIComponent(item.id)}&deptName=${encodeURIComponent(item.parentDepartmentName ?? item.nombre)}`,
                        );
                      }}
                    >
                      Administrar en contenedor de grupos →
                    </button>
                  </div>
                </article>
              ))}
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