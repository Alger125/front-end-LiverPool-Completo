import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '../../../app/config/routes';
import {
  ChartIcon,
  NodesIcon,
} from '../../../shared/components/AppIcons';

import '../styles/gestionEstructuras.css';

export function GestionEstructurasHome() {
  const navigate = useNavigate();

  return (
    <section className="ge-home">
      <header className="ge-home__header">
        <h1 className="ge-home__title">
          Gestión de estructuras comerciales
        </h1>

        <p className="ge-home__description">
          Administra las estructuras organizacionales de Operaciones y Corporativo, planea periodos futuros y gestiona cargas masivas.
        </p>
      </header>

      <div className="ge-home__options">
        <button
          type="button"
          className="ge-module-card"
          onClick={() => navigate(APP_ROUTES.structureOperations)}
        >
          <span className="ge-module-card__icon" aria-hidden="true">
            <NodesIcon />
          </span>

          <span className="ge-module-card__content">
            <strong className="ge-module-card__title">
              Operaciones (Tiendas / Almacenes)
            </strong>

            <span className="ge-module-card__description">
              Consulta y administra gerencias, departamentos, grupos y secciones en almacenes Liverpool y Suburbia.
            </span>
          </span>

          <span className="ge-module-card__arrow" aria-hidden="true">
            ›
          </span>
        </button>

        <button
          type="button"
          className="ge-module-card"
          onClick={() => navigate(APP_ROUTES.structureCorporate)}
        >
          <span className="ge-module-card__icon" aria-hidden="true">
            <ChartIcon />
          </span>

          <span className="ge-module-card__content">
            <strong className="ge-module-card__title">
              Estructura Corporativa
            </strong>

            <span className="ge-module-card__description">
              Consulta la jerarquía corporativa PAC, Hardline y Softline desde Dirección hasta Secciones.
            </span>
          </span>

          <span className="ge-module-card__arrow" aria-hidden="true">
            ›
          </span>
        </button>

        <button
          type="button"
          className="ge-module-card"
          onClick={() => navigate(APP_ROUTES.structurePlanning)}
        >
          <span className="ge-module-card__icon" aria-hidden="true">
            📅
          </span>

          <span className="ge-module-card__content">
            <strong className="ge-module-card__title">
              Planeación Futura y Publicaciones
            </strong>

            <span className="ge-module-card__description">
              Compara el mes actual vs siguiente, programa publicaciones futuras y revisa el calendario operativo.
            </span>
          </span>

          <span className="ge-module-card__arrow" aria-hidden="true">
            ›
          </span>
        </button>

        <button
          type="button"
          className="ge-module-card"
          onClick={() => navigate(APP_ROUTES.initialLoads)}
        >
          <span className="ge-module-card__icon" aria-hidden="true">
            📥
          </span>

          <span className="ge-module-card__content">
            <strong className="ge-module-card__title">
              Cargas Iniciales Masivas
            </strong>

            <span className="ge-module-card__description">
              Descarga la plantilla oficial vigente y procesa archivos de carga masiva de grupos y secciones.
            </span>
          </span>

          <span className="ge-module-card__arrow" aria-hidden="true">
            ›
          </span>
        </button>
      </div>
    </section>
  );
}