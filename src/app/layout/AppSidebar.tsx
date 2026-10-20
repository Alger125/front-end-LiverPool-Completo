import { NavLink, type NavLinkRenderProps } from 'react-router-dom';

import { SECURITY_PERMISSION_CODES } from '../../features/access-management/model/permission.model';
import { useSession } from '../../shared/auth';
import { hasPermission } from '../../shared/permissions';
import { APP_ROUTES } from '../config/routes';

import './AppSidebar.css';

interface AppSidebarProps {
	isOpen?: boolean;
	onNavigate?: () => void;
}

function getNavigationClassName({ isActive }: NavLinkRenderProps): string {
	return isActive
		? 'app-sidebar__link app-sidebar__link--active'
		: 'app-sidebar__link';
}

export function AppSidebar({ isOpen = false, onNavigate }: AppSidebarProps) {
	const session = useSession();
	const grantedPermissions = session?.grantedPermissions ?? [];

	const canViewStructures =
		hasPermission(SECURITY_PERMISSION_CODES.STRUCTURE_VIEW, grantedPermissions) ||
		hasPermission(SECURITY_PERMISSION_CODES.GROUP_VIEW, grantedPermissions);

	const canViewRoles = hasPermission(
		SECURITY_PERMISSION_CODES.ROLE_VIEW,
		grantedPermissions,
	);

	const canViewReports =
		hasPermission(
			SECURITY_PERMISSION_CODES.REPORT_ROLE_VIEW,
			grantedPermissions,
		) ||
		hasPermission(
			SECURITY_PERMISSION_CODES.REPORT_GENERAL_VIEW,
			grantedPermissions,
		);

	const canViewHistory = hasPermission(
		SECURITY_PERMISSION_CODES.HISTORY_VIEW,
		grantedPermissions,
	);

	return (
		<aside
			aria-label="Navegación principal"
			className={`app-sidebar ${isOpen ? 'app-sidebar--open' : ''}`}
		>
			<div>
				<div className="app-sidebar__mobile-header">
					<span className="app-sidebar__mobile-brand">Liverpool · ZDeptos</span>
					<button
						aria-label="Cerrar menú lateral"
						className="app-sidebar__mobile-close"
						onClick={onNavigate}
						type="button"
					>
						✕
					</button>
				</div>

				<nav aria-label="Módulos" className="app-sidebar__navigation">
					<NavLink
						className={getNavigationClassName}
						end
						onClick={onNavigate}
						to={APP_ROUTES.home}
					>
						<span aria-hidden="true" className="app-sidebar__icon">
							⌂
						</span>
						<span>Inicio</span>
					</NavLink>

					{canViewStructures ? (
						<NavLink
							className={getNavigationClassName}
							onClick={onNavigate}
							to={APP_ROUTES.structures}
						>
							<span aria-hidden="true" className="app-sidebar__icon">
								▦
							</span>
							<span>Estructuras</span>
						</NavLink>
					) : null}

					{canViewRoles ? (
						<NavLink
							className={getNavigationClassName}
							onClick={onNavigate}
							to={APP_ROUTES.roles}
						>
							<span aria-hidden="true" className="app-sidebar__icon">
								⚿
							</span>
							<span>Roles y permisos</span>
						</NavLink>
					) : null}

					{canViewReports ? (
						<NavLink
							className={getNavigationClassName}
							onClick={onNavigate}
							to={APP_ROUTES.reports}
						>
							<span aria-hidden="true" className="app-sidebar__icon">
								▤
							</span>
							<span>Reportes</span>
						</NavLink>
					) : null}

					{canViewHistory ? (
						<NavLink
							className={getNavigationClassName}
							onClick={onNavigate}
							to={APP_ROUTES.history}
						>
							<span aria-hidden="true" className="app-sidebar__icon">
								↺
							</span>
							<span>Historial</span>
						</NavLink>
					) : null}
				</nav>
			</div>

			<div className="app-sidebar__footer">
				<div>ZDeptos v1.0</div>
				<div>{session?.user.business ?? 'Liverpool'} · SSO Activo</div>
			</div>
		</aside>
	);
}
