import { SECURITY_PERMISSION_CODES } from '../../features/access-management/model/permission.model';
import type {
	SecurityAuditEntry,
	SessionData,
	SsoScenarioId,
	UserIdentity,
} from './auth.types';

const SESSION_STORAGE_KEY = 'zdeptos.auth.session.v1';
const LOGGED_OUT_FLAG_KEY = 'zdeptos.auth.logged_out.v1';
const AUDIT_STORAGE_KEY = 'zdeptos.auth.audit.v1';
const SESSION_CHANNEL_NAME = 'zdeptos_session_channel';

const memoryStore = new Map<string, string>();
let hasUnsavedChangesFlag = false;
const sessionListeners = new Set<() => void>();

function safeGetItem(key: string): string | null {
	try {
		if (typeof window !== 'undefined' && window.localStorage) {
			return window.localStorage.getItem(key);
		}
	} catch {
		// Fallback to in-memory store when WebStorage is disabled (e.g., Vitest --no-webstorage)
	}
	return memoryStore.get(key) ?? null;
}

function safeSetItem(key: string, value: string): void {
	memoryStore.set(key, value);
	try {
		if (typeof window !== 'undefined' && window.localStorage) {
			window.localStorage.setItem(key, value);
		}
	} catch {
		// Fallback to in-memory store
	}
}

function safeRemoveItem(key: string): void {
	memoryStore.delete(key);
	try {
		if (typeof window !== 'undefined' && window.localStorage) {
			window.localStorage.removeItem(key);
		}
	} catch {
		// Fallback to in-memory store
	}
}

export const ALL_PLATFORM_PERMISSIONS: readonly string[] = Object.values(
	SECURITY_PERMISSION_CODES,
);

export const SSO_IDENTITIES: Record<
	Exclude<
		SsoScenarioId,
		| 'error_identidad'
		| 'error_sin_rol'
		| 'error_cuenta_inactiva'
		| 'error_sso_no_disponible'
		| 'error_autorizacion'
	>,
	{ user: UserIdentity; permissions: readonly string[] }
> = {
	admin_plataforma: {
		user: {
			userId: 'aocampo',
			employeeNumber: 'EMP-100245',
			fullName: 'Arturo Ocampo',
			firstName: 'Arturo',
			initials: 'AO',
			email: 'aocampo@liverpool.com.mx',
			primaryRoleName: 'Administrador de seguridad',
			activeRoleCodes: ['ROL-005'],
			hasExceptionRole: false,
			business: 'Liverpool',
			zone: 'Zona Centro',
			location: 'Liverpool Atizapán',
			scopeLabel: 'Negocio Completo — Liverpool / Suburbia / Corporativo',
			authorizedLocations: [
				'Liverpool Atizapán',
				'Liverpool Insurgentes',
				'Liverpool Polanco',
				'Liverpool Satélite',
				'Liverpool Perisur',
				'Suburbia Centro',
				'Corporativo único',
			],
			authorizedDepartments: [
				'Línea Blanca',
				'Damas',
				'Caballeros',
				'Belleza',
				'Calzado',
				'Infantil',
				'Accesorios',
				'Electrónica',
			],
			lastVisitLabel: '04/Sep/2026',
		},
		permissions: ALL_PLATFORM_PERMISSIONS,
	},
	gestor_ubicacion: {
		user: {
			userId: 'aramirez',
			employeeNumber: 'EMP-204810',
			fullName: 'Alejandra Ramírez',
			firstName: 'Alejandra',
			initials: 'AR',
			email: 'aramirez@liverpool.com.mx',
			primaryRoleName: 'Gestor de ubicación',
			activeRoleCodes: ['ROL-006'],
			hasExceptionRole: false,
			business: 'Liverpool',
			zone: 'Zona 2',
			location: 'Liverpool Atizapán',
			scopeLabel: 'Ubicación gestionada — Zona 2 / Liverpool Atizapán',
			authorizedLocations: ['Liverpool Atizapán', 'Liverpool Insurgentes'],
			authorizedDepartments: ['Línea Blanca', 'Damas', 'Caballeros', 'Belleza'],
			lastVisitLabel: '04/Sep/2026',
		},
		permissions: [
			SECURITY_PERMISSION_CODES.STRUCTURE_VIEW,
			SECURITY_PERMISSION_CODES.GROUP_VIEW,
			SECURITY_PERMISSION_CODES.GROUP_CREATE,
			SECURITY_PERMISSION_CODES.GROUP_UPDATE,
			SECURITY_PERMISSION_CODES.GROUP_INACTIVATE,
			SECURITY_PERMISSION_CODES.SECTION_VIEW,
			SECURITY_PERMISSION_CODES.SECTION_ASSIGN,
			SECURITY_PERMISSION_CODES.SECTION_MOVE,
			SECURITY_PERMISSION_CODES.SECTION_UNASSIGN,
			SECURITY_PERMISSION_CODES.REPORT_ROLE_VIEW,
			SECURITY_PERMISSION_CODES.REPORT_ROLE_DOWNLOAD,
			SECURITY_PERMISSION_CODES.GLOBAL_SEARCH_VIEW,
		],
	},
	usuario_reportes: {
		user: {
			userId: 'cruiz',
			employeeNumber: 'EMP-309112',
			fullName: 'Carlos Ruiz',
			firstName: 'Carlos',
			initials: 'CR',
			email: 'cruiz@liverpool.com.mx',
			primaryRoleName: 'Consulta de Reportes',
			activeRoleCodes: ['ROL-009'],
			hasExceptionRole: false,
			business: 'Liverpool',
			zone: 'Zona Centro',
			location: 'Liverpool Polanco',
			scopeLabel: 'Negocio = Liverpool (Solo Consulta y Reportes)',
			authorizedLocations: ['Liverpool Polanco', 'Liverpool Atizapán'],
			authorizedDepartments: ['Línea Blanca', 'Caballeros', 'Calzado'],
			lastVisitLabel: '04/Sep/2026',
		},
		permissions: [
			SECURITY_PERMISSION_CODES.REPORT_ROLE_VIEW,
			SECURITY_PERMISSION_CODES.REPORT_ROLE_DOWNLOAD,
			SECURITY_PERMISSION_CODES.REPORT_GENERAL_VIEW,
			SECURITY_PERMISSION_CODES.GLOBAL_SEARCH_VIEW,
		],
	},
	excepcion_activa: {
		user: {
			userId: 'atorres',
			employeeNumber: 'EMP-412098',
			fullName: 'Andrea Torres',
			firstName: 'Andrea',
			initials: 'AT',
			email: 'atorres@liverpool.com.mx',
			primaryRoleName: 'Gestor de estructura (Excepción)',
			activeRoleCodes: ['ROL-009', 'ROL-012'],
			hasExceptionRole: true,
			exceptionSummary:
				'Cobertura operativa temporal — Liverpool Atizapán (01/09/2026 → 30/09/2026)',
			business: 'Liverpool',
			zone: 'Zona 2',
			location: 'Liverpool Atizapán',
			scopeLabel: 'Excepción activa — Liverpool Atizapán / Grupo 001',
			authorizedLocations: ['Liverpool Atizapán'],
			authorizedDepartments: ['Línea Blanca', 'Damas'],
			lastVisitLabel: '04/Sep/2026',
		},
		permissions: [
			SECURITY_PERMISSION_CODES.STRUCTURE_VIEW,
			SECURITY_PERMISSION_CODES.GROUP_VIEW,
			SECURITY_PERMISSION_CODES.GROUP_UPDATE,
			SECURITY_PERMISSION_CODES.SECTION_VIEW,
			SECURITY_PERMISSION_CODES.SECTION_MOVE,
			SECURITY_PERMISSION_CODES.REPORT_ROLE_VIEW,
			SECURITY_PERMISSION_CODES.HISTORY_VIEW,
			SECURITY_PERMISSION_CODES.GLOBAL_SEARCH_VIEW,
		],
	},
};

export function createSessionFromProfile(
	profileId: keyof typeof SSO_IDENTITIES = 'admin_plataforma',
): SessionData {
	const profile = SSO_IDENTITIES[profileId];
	const now = Date.now();
	return {
		accessToken: `sso-jwt-${profileId}-${now}`,
		expiresAt: now + 3600 * 1000,
		authenticatedAt: new Date(now).toISOString(),
		user: profile.user,
		grantedPermissions: profile.permissions,
	};
}

function notifySessionListeners(): void {
	sessionListeners.forEach((listener) => listener());
}

export function subscribeToSessionChanges(listener: () => void): () => void {
	sessionListeners.add(listener);
	return () => {
		sessionListeners.delete(listener);
	};
}

export function getStoredSession(): SessionData | null {
	const loggedOut = safeGetItem(LOGGED_OUT_FLAG_KEY);
	if (loggedOut === 'true') {
		return null;
	}

	const raw = safeGetItem(SESSION_STORAGE_KEY);
	if (raw) {
		try {
			const parsed = JSON.parse(raw) as SessionData;
			if (parsed && parsed.accessToken && parsed.user) {
				return parsed;
			}
		} catch {
			// Ignore malformed session
		}
	}

	// Default active corporate SSO session (FA-01: Usuario con sesión corporativa activa)
	const defaultSession = createSessionFromProfile('admin_plataforma');
	safeSetItem(SESSION_STORAGE_KEY, JSON.stringify(defaultSession));
	return defaultSession;
}

export function saveStoredSession(session: SessionData): void {
	safeRemoveItem(LOGGED_OUT_FLAG_KEY);
	safeSetItem(SESSION_STORAGE_KEY, JSON.stringify(session));
	broadcastSessionEvent('SESSION_UPDATED');
	notifySessionListeners();
}

export function clearStoredSession(reason: 'MANUAL' | 'INACTIVITY' | 'EXPIRED' = 'MANUAL'): void {
	const current = getStoredSession();
	if (current) {
		recordSecurityAudit({
			userId: current.user.userId,
			userName: current.user.fullName,
			role: current.user.primaryRoleName,
			scope: current.user.scopeLabel,
			action: reason === 'MANUAL' ? 'LOGOUT_MANUAL' : `LOGOUT_${reason}`,
			entity: 'SESION_SSO',
			result: 'EXITOSO',
			detail:
				reason === 'MANUAL'
					? 'Cierre de sesión manual ejecutado por el usuario.'
					: 'Cierre de sesión automático por expiración o inactividad.',
		});
	}

	safeRemoveItem(SESSION_STORAGE_KEY);
	safeSetItem(LOGGED_OUT_FLAG_KEY, 'true');
	hasUnsavedChangesFlag = false;
	broadcastSessionEvent(reason === 'INACTIVITY' ? 'SESSION_EXPIRED' : 'SESSION_CLOSED');
	notifySessionListeners();
}

export function setHasUnsavedChanges(dirty: boolean): void {
	hasUnsavedChangesFlag = dirty;
}

export function getHasUnsavedChanges(): boolean {
	return hasUnsavedChangesFlag;
}

export function recordSecurityAudit(
	entry: Omit<SecurityAuditEntry, 'id' | 'timestamp'>,
): SecurityAuditEntry {
	const record: SecurityAuditEntry = {
		...entry,
		id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
		timestamp: new Date().toISOString(),
	};

	const existing = getSecurityAuditLog();
	const updated = [record, ...existing].slice(0, 100);
	safeSetItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
	return record;
}

export function getSecurityAuditLog(): SecurityAuditEntry[] {
	const raw = safeGetItem(AUDIT_STORAGE_KEY);
	if (!raw) {
		return [];
	}
	try {
		return JSON.parse(raw) as SecurityAuditEntry[];
	} catch {
		return [];
	}
}

export function appendAuditLogEntry(entry: {
	action: string;
	actorId: string;
	actorName: string;
	detail: string;
	module: string;
	outcome: 'SUCCESS' | 'DENIED' | 'ERROR';
}): SecurityAuditEntry {
	const current = getStoredSession();
	return recordSecurityAudit({
		userId: entry.actorId,
		userName: entry.actorName,
		role: current?.user.primaryRoleName ?? 'Administrador',
		scope: current?.user.scopeLabel ?? 'Corporativo',
		action: entry.action,
		entity: entry.module,
		result: entry.outcome === 'SUCCESS' ? 'EXITOSO' : 'DENEGADO',
		detail: entry.detail,
	});
}

function broadcastSessionEvent(type: 'SESSION_CLOSED' | 'SESSION_EXPIRED' | 'SESSION_UPDATED'): void {
	try {
		if (typeof BroadcastChannel !== 'undefined') {
			const channel = new BroadcastChannel(SESSION_CHANNEL_NAME);
			channel.postMessage({ type });
			channel.close();
		}
	} catch {
		// BroadcastChannel not supported in environment
	}
}

export function listenCrossTabSessionEvents(
	onRemoteLogout: (expired: boolean) => void,
): () => void {
	let channel: BroadcastChannel | null = null;
	try {
		if (typeof BroadcastChannel !== 'undefined') {
			channel = new BroadcastChannel(SESSION_CHANNEL_NAME);
			channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
				if (event.data?.type === 'SESSION_CLOSED') {
					notifySessionListeners();
					onRemoteLogout(false);
				} else if (event.data?.type === 'SESSION_EXPIRED') {
					notifySessionListeners();
					onRemoteLogout(true);
				} else if (event.data?.type === 'SESSION_UPDATED') {
					notifySessionListeners();
				}
			};
		}
	} catch {
		// Ignore
	}

	const handleStorage = (event: StorageEvent): void => {
		if (event.key === LOGGED_OUT_FLAG_KEY && event.newValue === 'true') {
			notifySessionListeners();
			onRemoteLogout(false);
		}
	};

	if (typeof window !== 'undefined') {
		window.addEventListener('storage', handleStorage);
	}

	return () => {
		if (channel) {
			channel.close();
		}
		if (typeof window !== 'undefined') {
			window.removeEventListener('storage', handleStorage);
		}
	};
}
