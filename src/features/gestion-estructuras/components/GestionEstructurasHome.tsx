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
          Gestión de estructuras
        </h1>

        <p className="ge-home__description">
          Selecciona el tipo de estructura que deseas consultar.
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
              Operaciones
            </strong>

            <span className="ge-module-card__description">
              Consulta las estructuras organizacionales de operaciones.
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
              Corporativo
            </strong>

            <span className="ge-module-card__description">
              Consulta la estructura jerárquica corporativa.
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