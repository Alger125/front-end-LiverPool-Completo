export const APP_ROUTES = {
	home: '/',
	login: '/login',
	logoutSuccess: '/logout-success',
	sessionExpired: '/session-expired',
	globalSearch: '/search',

	roles: '/roles',
	roleCreate: '/roles/create',

	structures: '/structures',
	structureOperations: '/structures/operations',
	structureCorporate: '/structures/corporate',

	reports: '/reports',
	history: '/history',
	initialLoads: '/initial-loads',

	accessManagement: '/access-management',
	roleAssignments: '/access-management/assignments',
	roleExceptions: '/access-management/exceptions',

	structureDepartmentGroups:
		'/structures/operations/departments/:departmentId/groups',
} as const;

export const APP_ROUTE_PATTERNS = {
	roleDetail: 'roles/:roleId',
	roleEdit: 'roles/:roleId/edit',
} as const;

export const ACCESS_MANAGEMENT_PATHS = {
	assignments: 'assignments',
	exceptions: 'exceptions',
} as const;

export type AccessManagementPathKey = keyof typeof ACCESS_MANAGEMENT_PATHS;

export function accessManagementPath(key: AccessManagementPathKey): string {
	return `${APP_ROUTES.accessManagement}/${ACCESS_MANAGEMENT_PATHS[key]}`;
}

export function roleDetailPath(roleId: string): string {
	return `${APP_ROUTES.roles}/${encodeURIComponent(roleId)}`;
}

export function roleEditPath(roleId: string): string {
	return `${roleDetailPath(roleId)}/edit`;
}

export function structureDepartmentGroupsPath(departmentId: string): string {
	return `/structures/operations/departments/${encodeURIComponent(
		departmentId,
	)}/groups`;
}