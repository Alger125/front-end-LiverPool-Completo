import { httpPost } from '../../../shared/api';
import type {
	CollaboratorDirectoryEntry,
	CreateRoleExceptionInput,
	RoleExceptionRecord,
} from '../model/role-exception.model';

export const COLLABORATOR_DIRECTORY: CollaboratorDirectoryEntry[] = [
	{
		id: 'col-884021',
		employeeNumber: 'EMP-884021',
		fullName: 'Roberto Méndez Alarcón',
		email: 'rmendez@liverpool.com.mx',
		nominalPosition: 'Coordinador de Planeación Comercial',
		departmentName: 'Caballeros y Calzado (210)',
		defaultLocation: 'Santa Fe (0042)',
		status: 'ACTIVE',
	},
	{
		id: 'col-410288',
		employeeNumber: 'EMP-410288',
		fullName: 'Mariana Vega Solís',
		email: 'mvega@liverpool.com.mx',
		nominalPosition: 'Jefatura de Departamento',
		departmentName: 'Damas y Accesorios (140)',
		defaultLocation: 'Perisur (0015)',
		status: 'ACTIVE',
	},
	{
		id: 'col-772310',
		employeeNumber: 'EMP-772310',
		fullName: 'Sofía Hernández Lara',
		email: 'shernandez@liverpool.com.mx',
		nominalPosition: 'Analista de Inteligencia Comercial',
		departmentName: 'Hogar y Electrónica (310)',
		defaultLocation: 'Polanco (0008)',
		status: 'ACTIVE',
	},
	{
		id: 'col-552190',
		employeeNumber: 'EMP-552190',
		fullName: 'Alejandro Torres Guzmán',
		email: 'atorres@suburbia.com.mx',
		nominalPosition: 'Supervisor de Operaciones',
		departmentName: 'Operaciones Tienda (105)',
		defaultLocation: 'Ubicación Norte',
		status: 'ACTIVE',
	},
	{
		id: 'col-009112',
		employeeNumber: 'EMP-009112',
		fullName: 'Carlos Ruiz Mondragón',
		email: 'cruiz@liverpool.com.mx',
		nominalPosition: 'Especialista Comercial',
		departmentName: 'Deportes (410)',
		defaultLocation: 'Insurgentes (0001)',
		status: 'INACTIVE',
	},
];

export const EXCEPTION_LOCATIONS = [
	{ code: 'LOC-0042', name: 'Santa Fe (0042)' },
	{ code: 'LOC-0015', name: 'Perisur (0015)' },
	{ code: 'LOC-0008', name: 'Polanco (0008)' },
	{ code: 'LOC-0001', name: 'Insurgentes (0001)' },
	{ code: 'LOC-CORP', name: 'Corporativo Santa Fe' },
	{ code: 'LOC-NORTE', name: 'Ubicación Norte (Suburbia)' },
] as const;

const INITIAL_EXCEPTIONS: RoleExceptionRecord[] = [
	{
		id: 'exc-001',
		collaboratorId: 'col-884021',
		employeeNumber: 'EMP-884021',
		collaboratorName: 'Roberto Méndez Alarcón',
		collaboratorEmail: 'rmendez@liverpool.com.mx',
		nominalPosition: 'Coordinador de Planeación Comercial',
		roleId: '3d377584-c0c5-4391-b4f9-b11ae93f4bfd',
		roleCode: 'STRUCTURE_ADMIN',
		roleName: 'Administrador de estructuras',
		locationCode: 'LOC-0042',
		locationName: 'Santa Fe (0042)',
		validFrom: '2026-10-01',
		validUntil: '2026-11-30',
		reason: 'Cobertura temporal de reestructura comercial Q4 en Santa Fe',
		status: 'ACTIVE',
		createdAt: '2026-10-01T09:00:00-06:00',
		createdBy: 'Laura Patricia Gómez',
	},
	{
		id: 'exc-002',
		collaboratorId: 'col-772310',
		employeeNumber: 'EMP-772310',
		collaboratorName: 'Sofía Hernández Lara',
		collaboratorEmail: 'shernandez@liverpool.com.mx',
		nominalPosition: 'Analista de Inteligencia Comercial',
		roleId: 'cc342a01-09d4-44f8-b7b1-c51e36339acc',
		roleCode: 'STRUCTURE_EDITOR',
		roleName: 'Editor de estructuras',
		locationCode: 'LOC-0008',
		locationName: 'Polanco (0008)',
		validFrom: '2026-10-05',
		validUntil: '2026-10-31',
		reason: 'Apoyo operativo en apertura de temporada decembrina',
		status: 'ACTIVE',
		createdAt: '2026-10-05T11:20:00-06:00',
		createdBy: 'Laura Patricia Gómez',
	},
];

const STORAGE_KEY = 'zdeptos.role.exceptions.v1';
let inMemoryExceptions: RoleExceptionRecord[] = structuredClone(
	INITIAL_EXCEPTIONS,
);

function readStoredExceptions(): RoleExceptionRecord[] {
	try {
		if (
			typeof window !== 'undefined' &&
			window.localStorage &&
			typeof window.localStorage.getItem === 'function'
		) {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			if (raw) {
				return JSON.parse(raw) as RoleExceptionRecord[];
			}
		}
	} catch {
		// Fallback to in-memory
	}
	return structuredClone(inMemoryExceptions);
}

function writeStoredExceptions(records: RoleExceptionRecord[]): void {
	inMemoryExceptions = structuredClone(records);
	try {
		if (
			typeof window !== 'undefined' &&
			window.localStorage &&
			typeof window.localStorage.setItem === 'function'
		) {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
		}
	} catch {
		// Ignore storage error
	}
}

export function resetRoleExceptionsStore(): void {
	writeStoredExceptions(INITIAL_EXCEPTIONS);
}

export function searchCollaborators(
	query: string,
): CollaboratorDirectoryEntry[] {
	const normalized = query.trim().toLocaleLowerCase('es-MX');
	if (!normalized) {
		return COLLABORATOR_DIRECTORY;
	}
	return COLLABORATOR_DIRECTORY.filter((entry) =>
		[
			entry.employeeNumber,
			entry.fullName,
			entry.email,
			entry.nominalPosition,
			entry.departmentName,
		].some((field) => field.toLocaleLowerCase('es-MX').includes(normalized)),
	);
}

export function listRoleExceptions(): RoleExceptionRecord[] {
	return readStoredExceptions();
}

export function createRoleException(
	input: CreateRoleExceptionInput,
): RoleExceptionRecord {
	const collaborator = COLLABORATOR_DIRECTORY.find(
		(c) => c.id === input.collaboratorId,
	);

	if (!collaborator) {
		throw new Error(
			'No se encontró el colaborador seleccionado en el directorio corporativo.',
		);
	}

	if (collaborator.status !== 'ACTIVE') {
		throw new Error(
			'El colaborador se encuentra inactivo en el directorio corporativo y no puede recibir asignaciones por excepción.',
		);
	}

	if (!input.validFrom || !input.validUntil) {
		throw new Error(
			'Debes especificar la fecha de inicio y la fecha de fin de la vigencia.',
		);
	}

	if (input.validUntil < input.validFrom) {
		throw new Error(
			'La fecha de fin de vigencia no puede ser anterior a la fecha de inicio.',
		);
	}

	if (input.reason.trim().length < 10) {
		throw new Error(
			'El motivo de la asignación por excepción es obligatorio (mínimo 10 caracteres).',
		);
	}

	const current = readStoredExceptions();
	const hasDuplicate = current.some(
		(exc) =>
			exc.status === 'ACTIVE' &&
			exc.collaboratorId === collaborator.id &&
			exc.roleId === input.roleId &&
			exc.locationCode === input.locationCode,
	);

	if (hasDuplicate) {
		throw new Error(
			'El colaborador ya cuenta con una asignación por excepción vigente para este mismo rol y ubicación.',
		);
	}

	const created: RoleExceptionRecord = {
		id: `exc-${Date.now()}`,
		collaboratorId: collaborator.id,
		employeeNumber: collaborator.employeeNumber,
		collaboratorName: collaborator.fullName,
		collaboratorEmail: collaborator.email,
		nominalPosition: collaborator.nominalPosition,
		roleId: input.roleId,
		roleCode: input.roleCode,
		roleName: input.roleName,
		locationCode: input.locationCode,
		locationName: input.locationName,
		validFrom: input.validFrom,
		validUntil: input.validUntil,
		reason: input.reason.trim(),
		status: 'ACTIVE',
		createdAt: new Date().toISOString(),
		createdBy: input.actorName ?? 'Administrador',
	};

	writeStoredExceptions([created, ...current]);

	void httpPost('/role-exceptions', {
		userId: '44fc25bd-d556-56da-926e-27dc3ea0eacc',
		roleId: input.roleId,
		accessScopeId: 'f62b081e-4cc2-518a-b840-a7afa915cd3d',
		effectiveFrom: input.validFrom,
		effectiveTo: input.validUntil,
		reason: input.reason.trim(),
	}).catch(() => {
		// Non-blocking sync when running in offline/test mode
	});

	return created;
}

export function revokeRoleException(
	exceptionId: string,
	revokedReason: string,
): RoleExceptionRecord {
	if (revokedReason.trim().length < 5) {
		throw new Error(
			'Captura un motivo de revocación de al menos 5 caracteres.',
		);
	}

	const current = readStoredExceptions();
	const index = current.findIndex((item) => item.id === exceptionId);

	if (index < 0) {
		throw new Error('La asignación por excepción seleccionada no existe.');
	}

	const updated: RoleExceptionRecord = {
		...current[index],
		status: 'REVOKED',
		revokedAt: new Date().toISOString(),
		revokedReason: revokedReason.trim(),
	};

	const next = [...current];
	next[index] = updated;
	writeStoredExceptions(next);

	if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(exceptionId)) {
		void httpPost(`/role-exceptions/${encodeURIComponent(exceptionId)}/revoke`, {
			reason: revokedReason.trim(),
		}).catch(() => {
			// Non-blocking sync
		});
	}

	return updated;
}

