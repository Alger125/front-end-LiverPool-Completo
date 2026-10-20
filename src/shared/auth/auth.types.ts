import type { GrantedPermissions } from '../permissions';

export type SsoScenarioId =
	| 'admin_plataforma'
	| 'gestor_ubicacion'
	| 'usuario_reportes'
	| 'excepcion_activa'
	| 'error_identidad'
	| 'error_sin_rol'
	| 'error_cuenta_inactiva'
	| 'error_sso_no_disponible'
	| 'error_autorizacion';

export interface UserIdentity {
	userId: string;
	employeeNumber: string;
	fullName: string;
	firstName: string;
	initials: string;
	email: string;
	primaryRoleName: string;
	activeRoleCodes: string[];
	hasExceptionRole?: boolean;
	exceptionSummary?: string;
	business: 'Liverpool' | 'Suburbia' | 'Corporativo';
	zone: string;
	location: string;
	scopeLabel: string;
	authorizedLocations: string[];
	authorizedDepartments: string[];
	lastVisitLabel: string;
}

export interface SessionData {
	accessToken: string;
	sessionId?: string;
	expiresAt: number;
	authenticatedAt: string;
	user: UserIdentity;
	grantedPermissions: GrantedPermissions;
}

export interface SecurityAuditEntry {
	id: string;
	timestamp: string;
	userId: string;
	userName: string;
	role: string;
	scope: string;
	action: string;
	entity: string;
	result: 'EXITOSO' | 'DENEGADO' | 'ERROR';
	detail: string;
}
