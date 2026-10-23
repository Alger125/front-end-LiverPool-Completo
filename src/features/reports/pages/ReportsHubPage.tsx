import { ReportsIcon } from '../../../shared/components/AppIcons';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SECURITY_PERMISSION_CODES } from '../../access-management/model/permission.model';
import { useSession } from '../../../shared/auth';
import { hasPermission } from '../../../shared/permissions';
import { ReportByRoleWizard } from '../components/ReportByRoleWizard';
import { ReportGeneralWizard } from '../components/ReportGeneralWizard';
import '../styles/reports.css';

type ActiveReportView = 'hub' | 'role-report' | 'general-report';
export function ReportsHubPage() {
  const session = useSession();
  const permissions = session?.grantedPermissions ?? [];
  const [view, setView] = useState<ActiveReportView>('hub');
  if (view === 'role-report')
    return (
      <ReportByRoleWizard
        onBackToHub={() => setView('hub')}
        canDownload={hasPermission(SECURITY_PERMISSION_CODES.REPORT_ROLE_DOWNLOAD, permissions)}
      />
    );
  if (view === 'general-report')
    return (
      <ReportGeneralWizard
        onBackToHub={() => setView('hub')}
        canDownload={hasPermission(SECURITY_PERMISSION_CODES.REPORT_GENERAL_DOWNLOAD, permissions)}
      />
    );
  return (
    <section className="rep-hub">
      <nav className="reference-breadcrumb" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link> / Reportes
      </nav>
      <h1 className="rep-hub__title">Consulta Módulo de Reportes</h1>
      <p className="rep-hub__description">Selecciona el tipo de reporte que deseas consultar.</p>
      <div className="rep-hub__grid">
        {hasPermission(SECURITY_PERMISSION_CODES.REPORT_ROLE_VIEW, permissions) && (
          <button type="button" className="reference-module" onClick={() => setView('role-report')}>
            <span className="reference-module__icon" aria-hidden="true">
              <ReportsIcon />
            </span>
            <strong>Reportes por Rol</strong>
            <span>Histórico y operación</span>
          </button>
        )}
        {hasPermission(SECURITY_PERMISSION_CODES.REPORT_GENERAL_VIEW, permissions) && (
          <button
            type="button"
            className="reference-module"
            onClick={() => setView('general-report')}
          >
            <span className="reference-module__icon" aria-hidden="true">
              <ReportsIcon />
            </span>
            <strong>Reportes General</strong>
            <span>Histórico y operación</span>
          </button>
        )}
      </div>
    </section>
  );
}
