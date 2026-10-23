import { Navigate, createBrowserRouter } from 'react-router-dom';

import { SECURITY_PERMISSION_CODES } from '../features/access-management/model/permission.model';
import { RoleExceptionsPage } from '../features/access-management/exceptions/pages/RoleExceptionsPage';
import {
	CreateRolePage,
	EditRolePage,
	RoleDetailPage,
	RoleListPage,
} from '../features/access-management/roles/pages';
import {
	LoginPage,
	SessionEndedPage,
} from '../features/authentication';
import { GestionEstructurasHome } from '../features/gestion-estructuras/components/GestionEstructurasHome';
import { StructureExplorerPage } from '../features/gestion-estructuras/pages/StructureExplorerPage';
import DepartmentGroupsPage from '../features/gestion-estructuras/pages/DepartmentGroupsPage.tsx';
import { GlobalSearchPage } from '../features/home/pages/GlobalSearchPage';
import { HomePage } from '../features/home/pages/HomePage';
import { useSession } from '../shared/auth';
import { RoutePermissionGuard } from '../shared/permissions';
import { APP_ROUTE_PATTERNS, APP_ROUTES } from './config/routes';
import { AppLayout } from './layout/AppLayout';
import { getMockPermissions } from './mockAccess';
import FuturePlanningPage from '../features/gestion-estructuras/pages/FuturePlanningPage';
import { HistoryPage } from '../features/history/pages/HistoryPage';
import { InitialLoadsPage } from '../features/initial-loads/pages/InitialLoadsPage';
import { ReportsHubPage } from '../features/reports/pages/ReportsHubPage';

function relativePath(absolutePath: string): string {
	return absolutePath.replace(/^\//, '');
}

function ConnectedRoleListPage() {
	const session = useSession();
	const grantedPermissions =
		session?.grantedPermissions ?? getMockPermissions();
	return <RoleListPage grantedPermissions={grantedPermissions} />;
}

export const router = createBrowserRouter([
	{
		path: APP_ROUTES.login,
		element: <LoginPage />,
	},
	{
		path: APP_ROUTES.logoutSuccess,
		element: <SessionEndedPage variant="logged-out" />,
	},
	{
		path: APP_ROUTES.sessionExpired,
		element: <SessionEndedPage variant="expired" />,
	},
	{
		path: APP_ROUTES.home,
		element: <AppLayout />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: relativePath(APP_ROUTES.globalSearch),
				element: (
					<RoutePermissionGuard
						moduleLabel="Búsqueda Global"
						requiredPermission={SECURITY_PERMISSION_CODES.GLOBAL_SEARCH_VIEW}
					>
						<GlobalSearchPage />
					</RoutePermissionGuard>
				),
			},
			{
				path: relativePath(APP_ROUTES.roles),
				element: (
					<RoutePermissionGuard
						moduleLabel="Roles y permisos"
						requiredPermission={SECURITY_PERMISSION_CODES.ROLE_VIEW}
					>
						<ConnectedRoleListPage />
					</RoutePermissionGuard>
				),
			},
			{
				path: relativePath(APP_ROUTES.roleCreate),
				element: (
					<RoutePermissionGuard
						moduleLabel="Crear Rol"
						requiredPermission={SECURITY_PERMISSION_CODES.ROLE_CREATE}
					>
						<CreateRolePage />
					</RoutePermissionGuard>
				),
			},
			{
				path: APP_ROUTE_PATTERNS.roleEdit,
				element: (
					<RoutePermissionGuard
						moduleLabel="Editar Rol"
						requiredPermission={SECURITY_PERMISSION_CODES.ROLE_UPDATE}
					>
						<EditRolePage />
					</RoutePermissionGuard>
				),
			},
			{
				path: APP_ROUTE_PATTERNS.roleDetail,
				element: (
					<RoutePermissionGuard
						moduleLabel="Detalle de Rol"
						requiredPermission={SECURITY_PERMISSION_CODES.ROLE_VIEW}
					>
						<RoleDetailPage />
					</RoutePermissionGuard>
				),
			},
			{
				path: relativePath(APP_ROUTES.roleExceptions),
				element: (
					<RoutePermissionGuard
						anyOfPermissions={[
							SECURITY_PERMISSION_CODES.ROLE_EXCEPTION_VIEW,
							SECURITY_PERMISSION_CODES.ROLE_VIEW,
						]}
						moduleLabel="Asignación por Excepción"
					>
						<RoleExceptionsPage />
					</RoutePermissionGuard>
				),
			},
			{
				path: relativePath(APP_ROUTES.structures),
				element: (
					<RoutePermissionGuard
						anyOfPermissions={[
							SECURITY_PERMISSION_CODES.STRUCTURE_VIEW,
							SECURITY_PERMISSION_CODES.GROUP_VIEW,
						]}
						moduleLabel="Gestión de Estructuras"
					>
						<GestionEstructurasHome />
					</RoutePermissionGuard>
				),
			},
			{
				path: relativePath(APP_ROUTES.structureOperations),
				element: (
					<RoutePermissionGuard
						anyOfPermissions={[
							SECURITY_PERMISSION_CODES.STRUCTURE_VIEW,
							SECURITY_PERMISSION_CODES.GROUP_VIEW,
						]}
						moduleLabel="Estructuras de Operaciones"
					>
						<StructureExplorerPage key="operations" />
					</RoutePermissionGuard>
				),
			},
			{
				path: relativePath(APP_ROUTES.structureCorporate),
				element: (
					<RoutePermissionGuard
						anyOfPermissions={[
							SECURITY_PERMISSION_CODES.STRUCTURE_VIEW,
							SECURITY_PERMISSION_CODES.GROUP_VIEW,
						]}
						moduleLabel="Estructura Corporativa"
					>
						<StructureExplorerPage key="corporate" corporate />
					</RoutePermissionGuard>
				),
			},
			{
				path: relativePath(APP_ROUTES.structureDepartmentGroups),
				element: (
					<RoutePermissionGuard
						anyOfPermissions={[
							SECURITY_PERMISSION_CODES.STRUCTURE_VIEW,
							SECURITY_PERMISSION_CODES.GROUP_VIEW,
						]}
						moduleLabel="Administración de Grupos"
					>
						<DepartmentGroupsPage />
					</RoutePermissionGuard>
				),
			},
			{
				path: relativePath(APP_ROUTES.structurePlanning),
				element: (
					<RoutePermissionGuard
						anyOfPermissions={[
							SECURITY_PERMISSION_CODES.STRUCTURE_VIEW,
							SECURITY_PERMISSION_CODES.GROUP_VIEW,
						]}
						moduleLabel="Planeación Futura"
					>
						<FuturePlanningPage />
					</RoutePermissionGuard>
				),
			},
			{
				path: relativePath(APP_ROUTES.reports),
				element: (
					<RoutePermissionGuard
						anyOfPermissions={[
							SECURITY_PERMISSION_CODES.REPORT_ROLE_VIEW,
							SECURITY_PERMISSION_CODES.REPORT_GENERAL_VIEW,
						]}
						moduleLabel="Reportes"
					>
						<ReportsHubPage />
					</RoutePermissionGuard>
				),
			},
			{
				path: relativePath(APP_ROUTES.history),
				element: (
					<RoutePermissionGuard
						moduleLabel="Historial"
						requiredPermission={SECURITY_PERMISSION_CODES.HISTORY_VIEW}
					>
						<HistoryPage />
					</RoutePermissionGuard>
				),
			},
			{
				path: relativePath(APP_ROUTES.initialLoads),
				element: (
					<RoutePermissionGuard
						anyOfPermissions={[
							SECURITY_PERMISSION_CODES.STRUCTURE_VIEW,
							SECURITY_PERMISSION_CODES.GROUP_VIEW,
						]}
						moduleLabel="Cargas Iniciales Masivas"
					>
						<InitialLoadsPage />
					</RoutePermissionGuard>
				),
			},
		],
	},
	{
		path: '*',
		element: <Navigate replace to={APP_ROUTES.home} />,
	},
]);
