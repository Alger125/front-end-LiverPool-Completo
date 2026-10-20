import { useState } from 'react';

import { SECURITY_PERMISSION_CODES } from '../../access-management/model/permission.model';
import { useSession } from '../../../shared/auth';
import { hasPermission } from '../../../shared/permissions';

import { ReportByRoleWizard } from '../components/ReportByRoleWizard';
import { ReportGeneralWizard } from '../components/ReportGeneralWizard';

import '../styles/reports.css';

type ActiveReportView = 'hub' | 'role-report' | 'general-report';

export function ReportsHubPage() {
  const session = useSession();
  const grantedPermissions = session?.grantedPermissions ?? [];

  const canViewRoleReport = hasPermission(
    SECURITY_PERMISSION_CODES.REPORT_ROLE_VIEW,
    grantedPermissions,
  );
  const canDownloadRoleReport = hasPermission(
    SECURITY_PERMISSION_CODES.REPORT_ROLE_DOWNLOAD,
    grantedPermissions,
  );

  const canViewGeneralReport = hasPermission(
    SECURITY_PERMISSION_CODES.REPORT_GENERAL_VIEW,
    grantedPermissions,
  );
  const canDownloadGeneralReport = hasPermission(
    SECURITY_PERMISSION_CODES.REPORT_GENERAL_DOWNLOAD,
    grantedPermissions,
  );

  const [activeView, setActiveView] = useState<ActiveReportView>('hub');

  if (activeView === 'role-report') {
    return (
      <ReportByRoleWizard
        onBackToHub={() => setActiveView('hub')}
        canDownload={canDownloadRoleReport}
      />
    );
  }

  if (activeView === 'general-report') {
    return (
      <ReportGeneralWizard
        onBackToHub={() => setActiveView('hub')}
        canDownload={canDownloadGeneralReport}
      />
    );
  }

  return (
    <section className="rep-hub">
      <header className="rep-hub__header">
        <div className="rep-hub__title-wrap">
          <span className="rep-pill rep-pill--primary">Módulo de Reportes Oficiales</span>
          <h1 className="rep-hub__title">Centro de Reportes y Extracción de Estructuras</h1>
          <p className="rep-hub__description">
            Genera consultas y exportaciones consolidadas en formatos CSV y TXT según los permisos asignados a tu rol.
          </p>
        </div>
      </header>

      <div className="rep-hub__grid">
        {/* Tarjeta 1: Reporte por Rol (CU-EST-002) */}
        <article className="rep-card">
          <div className="rep-card__icon" aria-hidden="true">
            📋
          </div>
          <div className="rep-card__body">
            <div className="rep-card__badges">
              <span className="rep-pill">CU-EST-002</span>
              {canDownloadRoleReport ? (
                <span className="rep-pill rep-pill--success">Exportación CSV / TXT Habilitada</span>
              ) : (
                <span className="rep-pill">Solo Vista Previa</span>
              )}
            </div>
            <h2 className="rep-card__title">Reporte por Rol y Periodo</h2>
            <p className="rep-card__description">
              Consulta de colaboradores, puestos oficiales, responsabilidades titulares o heredadas y asignaciones por excepción filtradas por mes y año comercial.
            </p>
            <ul className="rep-card__features">
              <li>✓ Configuración por Mes y Año acotados al alcance</li>
              <li>✓ Selección por bloques (Estructura, Puestos y Relaciones)</li>
              <li>✓ Identificación de Secciones Ancla (🔒) y vacantes</li>
            </ul>
          </div>
          <div className="rep-card__footer">
            <button
              type="button"
              className="rep-btn rep-btn--primary"
              disabled={!canViewRoleReport}
              onClick={() => setActiveView('role-report')}
            >
              Iniciar Generación de Reporte por Rol →
            </button>
          </div>
        </article>

        {/* Tarjeta 2: Reporte General (CU-EST-003) */}
        <article className="rep-card">
          <div className="rep-card__icon" aria-hidden="true">
            📊
          </div>
          <div className="rep-card__body">
            <div className="rep-card__badges">
              <span className="rep-pill">CU-EST-003</span>
              {canDownloadGeneralReport ? (
                <span className="rep-pill rep-pill--success">Exportación CSV / TXT Habilitada</span>
              ) : (
                <span className="rep-pill">Solo Vista Previa</span>
              )}
            </div>
            <h2 className="rep-card__title">Reporte General por Rango de Fechas</h2>
            <p className="rep-card__description">
              Extracción histórica y transversal de estructuras comerciales, gerencias, departamentos, grupos y colaboradores en ventanas de tiempo personalizadas (hasta 1 año).
            </p>
            <ul className="rep-card__features">
              <li>✓ Rango flexible de Fecha Inicio a Fecha Fin</li>
              <li>✓ Catálogo autorizado de columnas personalizables</li>
              <li>✓ Conciliación de vigencias y estatus de asignación</li>
            </ul>
          </div>
          <div className="rep-card__footer">
            <button
              type="button"
              className="rep-btn rep-btn--primary"
              disabled={!canViewGeneralReport}
              onClick={() => setActiveView('general-report')}
            >
              Iniciar Generación de Reporte General →
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
