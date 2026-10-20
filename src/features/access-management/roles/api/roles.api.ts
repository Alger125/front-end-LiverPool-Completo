import {
	ApiError,
	buildAuthHeaders,
	type ProblemDetails,
} from '../../../../shared/api';
import type { PermissionCatalogEntry } from '../../model/permission-catalog.model';
import type { CreateRoleFormValues } from '../schemas/create-role.schema';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export interface CreatedRole {
	id: string;
	code: string;
	name: string;
	description: string;
	status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
	protected: boolean;
	permissionCount: number;
	version: number;
	updatedAt: string;
}

export interface RoleDetailResponse extends CreatedRole {
	permissions: PermissionCatalogEntry[];
}

export interface RoleImpactResponse {
	roleId: string;
	protected: boolean;
	activeAssignments: number;
	activeExceptions: number;
	canDelete: boolean;
	warnings: string[];
}

export interface UpdateRolePayload {
	name: string;
	description: string;
	permissionCodes: string[];
	version: number;
}

export interface DeleteRolePayload {
	version: number;
	reason: string;
}

export type RoleConditionField = 'Puesto' | 'Ubicación' | 'Negocio' | 'Zona';

export interface RoleRuleCondition {
	id: string;
	field: RoleConditionField;
	operator: '=' | 'IN';
	value: string;
}

export type ModuleScopeLevel =
	| 'Nacional'
	| 'Regional'
	| 'Por Ubicación'
	| 'Por Departamento';

export interface RoleExtendedMetadata {
	conditions: RoleRuleCondition[];
	moduleScopes: Record<string, ModuleScopeLevel>;
}

const DEFAULT_METADATA_BY_CODE: Record<string, RoleExtendedMetadata> = {
	STRUCTURE_ADMIN: {
		conditions: [
			{
				id: 'cond-1',
				field: 'Puesto',
				operator: '=',
				value: 'Jefatura de Departamento',
			},
			{
				id: 'cond-2',
				field: 'Ubicación',
				operator: '=',
				value: 'Ubicación Centro',
			},
			{
				id: 'cond-3',
				field: 'Negocio',
				operator: '=',
				value: 'Liverpool',
			},
		],
		moduleScopes: {
			COMMERCIAL_GROUPS: 'Por Ubicación',
			SECTIONS: 'Por Ubicación',
			SECURITY_ROLES: 'Por Ubicación',
			REPORTS_ROLE: 'Por Ubicación',
			REPORTS_GENERAL: 'Por Ubicación',
			AUDIT_HISTORY: 'Por Ubicación',
		},
	},
	SYSTEM_ADMIN: {
		conditions: [
			{
				id: 'cond-sys-1',
				field: 'Puesto',
				operator: '=',
				value: 'Administrador de Plataforma',
			},
			{
				id: 'cond-sys-2',
				field: 'Negocio',
				operator: '=',
				value: 'Corporativo Liverpool / Suburbia',
			},
		],
		moduleScopes: {
			COMMERCIAL_GROUPS: 'Nacional',
			SECTIONS: 'Nacional',
			SECURITY_ROLES: 'Nacional',
			REPORTS_ROLE: 'Nacional',
			REPORTS_GENERAL: 'Nacional',
			AUDIT_HISTORY: 'Nacional',
		},
	},
	STRUCTURE_EDITOR: {
		conditions: [
			{
				id: 'cond-ed-1',
				field: 'Puesto',
				operator: '=',
				value: 'Analista de Operaciones',
			},
			{
				id: 'cond-ed-2',
				field: 'Ubicación',
				operator: '=',
				value: 'Ubicación Norte',
			},
			{
				id: 'cond-ed-3',
				field: 'Negocio',
				operator: '=',
				value: 'Suburbia',
			},
		],
		moduleScopes: {
			COMMERCIAL_GROUPS: 'Por Departamento',
			SECTIONS: 'Por Departamento',
			SECURITY_ROLES: 'Por Departamento',
			REPORTS_ROLE: 'Por Departamento',
			REPORTS_GENERAL: 'Por Departamento',
			AUDIT_HISTORY: 'Por Departamento',
		},
	},
};

const inMemoryRoleMetadata = new Map<string, RoleExtendedMetadata>();
const METADATA_STORAGE_KEY = 'zdeptos.role.extended.metadata.v1';

function readStoredMetadataMap(): Record<string, RoleExtendedMetadata> {
	try {
		if (
			typeof window !== 'undefined' &&
			window.localStorage &&
			typeof window.localStorage.getItem === 'function'
		) {
			const raw = window.localStorage.getItem(METADATA_STORAGE_KEY);
			if (raw) {
				return JSON.parse(raw) as Record<string, RoleExtendedMetadata>;
			}
		}
	} catch {
		// Fallback to in-memory
	}
	return Object.fromEntries(inMemoryRoleMetadata.entries());
}

export function saveRoleExtendedMetadata(
	roleKey: string,
	metadata: RoleExtendedMetadata,
): void {
	inMemoryRoleMetadata.set(roleKey, metadata);
	try {
		if (
			typeof window !== 'undefined' &&
			window.localStorage &&
			typeof window.localStorage.setItem === 'function'
		) {
			const current = readStoredMetadataMap();
			current[roleKey] = metadata;
			window.localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(current));
		}
	} catch {
		// Ignore storage error
	}
}

export function getRoleExtendedMetadata(
	roleId: string,
	roleCode?: string,
): RoleExtendedMetadata {
	const stored = readStoredMetadataMap();
	if (stored[roleId]) {
		return stored[roleId];
	}
	if (roleCode && stored[roleCode]) {
		return stored[roleCode];
	}
	if (roleCode && DEFAULT_METADATA_BY_CODE[roleCode]) {
		return structuredClone(DEFAULT_METADATA_BY_CODE[roleCode]);
	}
	return {
		conditions: [
			{
				id: 'cond-default-1',
				field: 'Puesto',
				operator: '=',
				value: 'Jefatura de Departamento',
			},
			{
				id: 'cond-default-2',
				field: 'Negocio',
				operator: '=',
				value: 'Liverpool',
			},
		],
		moduleScopes: {
			COMMERCIAL_GROUPS: 'Por Ubicación',
			SECTIONS: 'Por Ubicación',
			SECURITY_ROLES: 'Por Ubicación',
			REPORTS_ROLE: 'Por Ubicación',
			REPORTS_GENERAL: 'Por Ubicación',
			AUDIT_HISTORY: 'Por Ubicación',
		},
	};
}

export function formatResultingRule(conditions: RoleRuleCondition[]): string {
	if (!conditions || conditions.length === 0) {
		return 'Alcance Nacional (Sin restricción por puesto o ubicación)';
	}
	return conditions
		.filter((item) => item.value.trim().length > 0)
		.map((item) => `${item.field} ${item.operator} "${item.value.trim()}"`)
		.join(' AND ');
}

async function readProblem(response: Response): Promise<ProblemDetails | null> {
	try {
		const data = (await response.json()) as Record<string, unknown>;
		return {
			type: typeof data.type === 'string' ? data.type : 'about:blank',
			title: String(data.title ?? data.error ?? 'Error'),
			status: typeof data.status === 'number' ? data.status : response.status,
			detail: Array.isArray(data.message)
				? data.message.join(', ')
				: String(data.detail ?? data.message ?? 'No fue posible procesar la solicitud.'),
			instance: typeof data.instance === 'string' ? data.instance : '',
			code: typeof data.code === 'string' ? data.code : 'ERROR',
			timestamp:
				typeof data.timestamp === 'string'
					? data.timestamp
					: new Date().toISOString(),
			correlationId:
				typeof data.correlationId === 'string' ? data.correlationId : '',
			errors: Array.isArray(data.errors) ? data.errors : undefined,
		};
	} catch {
		return null;
	}
}

export async function syncRoleSegmentationBackend(
	roleId: string,
	conditions: RoleRuleCondition[],
	moduleScopes?: Record<string, ModuleScopeLevel>,
): Promise<void> {
	try {
		const dimensionMap: Record<RoleConditionField, string> = {
			Puesto: 'POSITION',
			Ubicación: 'LOCATION',
			Negocio: 'DIVISION',
			Zona: 'ZONE',
		};
		const rules = conditions
			.filter((c) => c.value.trim().length > 0)
			.map((c) => ({
				dimension: dimensionMap[c.field] ?? 'POSITION',
				operator: c.operator === 'IN' ? 'IN' : 'EQUALS',
				values: c.value
					.split(',')
					.map((v) => v.trim())
					.filter(Boolean),
			}));

		if (rules.length === 0) return;

		const firstScope = moduleScopes
			? Object.values(moduleScopes)[0]
			: 'Por Ubicación';
		const scopeLevel =
			firstScope === 'Nacional'
				? 'GLOBAL'
				: firstScope === 'Regional'
					? 'ZONE'
					: firstScope === 'Por Departamento'
						? 'DEPARTMENT'
						: 'LOCATION';

		await fetch(
			`${API_BASE_URL}/roles/${encodeURIComponent(roleId)}/segmentation`,
			{
				method: 'PUT',
				headers: buildAuthHeaders({
					'Content-Type': 'application/json',
				}),
				body: JSON.stringify({
					scopeLevel,
					rules,
				}),
			},
		);
	} catch {
		// Non-blocking sync when running in offline/test mode
	}
}

export async function createRole(
	values: CreateRoleFormValues,
): Promise<CreatedRole> {
	const response = await fetch(`${API_BASE_URL}/roles`, {
		method: 'POST',
		headers: buildAuthHeaders({
			'Content-Type': 'application/json',
		}),
		body: JSON.stringify({
			name: values.name.trim(),
			description: values.description.trim(),
			permissionCodes: values.permissionCodes,
		}),
	});
	if (!response.ok) {
		const problem = await readProblem(response);

		throw new ApiError(
			response.status,
			problem?.detail ?? problem?.title ?? 'No fue posible crear el rol.',
			problem ?? undefined,
		);
	}

	const created = (await response.json()) as CreatedRole;

	const conditions: RoleRuleCondition[] = [];
	if (values.jobFunctionCodes?.length) {
		conditions.push({
			id: 'cond-job',
			field: 'Puesto',
			operator: '=',
			value: values.jobFunctionCodes.join(', '),
		});
	}
	if (values.locationCodes?.length) {
		conditions.push({
			id: 'cond-loc',
			field: 'Ubicación',
			operator: '=',
			value: values.locationCodes.join(', '),
		});
	}
	if (values.businessCodes?.length) {
		conditions.push({
			id: 'cond-bus',
			field: 'Negocio',
			operator: '=',
			value: values.businessCodes.join(', '),
		});
	}

	if (conditions.length > 0) {
		const scopeLabel: ModuleScopeLevel = values.scopeDepartmentCodes?.length
			? 'Por Departamento'
			: values.scopeLocationCodes?.length
				? 'Por Ubicación'
				: values.zoneCodes?.length
					? 'Regional'
					: 'Nacional';
		const moduleScopes: Record<string, ModuleScopeLevel> = {
			COMMERCIAL_GROUPS: scopeLabel,
			SECTIONS: scopeLabel,
			SECURITY_ROLES: scopeLabel,
			REPORTS_ROLE: scopeLabel,
			REPORTS_GENERAL: scopeLabel,
			AUDIT_HISTORY: scopeLabel,
		};
		saveRoleExtendedMetadata(created.id, {
			conditions,
			moduleScopes,
		});
		void syncRoleSegmentationBackend(created.id, conditions, moduleScopes);
	}

	return created;
}

export async function getRoleDetail(
	roleId: string,
): Promise<RoleDetailResponse> {
	const response = await fetch(
		`${API_BASE_URL}/roles/${encodeURIComponent(roleId)}`,
		{
			headers: buildAuthHeaders(),
		},
	);

	if (!response.ok) {
		const problem = await readProblem(response);
		throw new ApiError(
			response.status,
			problem?.detail ??
				problem?.title ??
				'No fue posible consultar el detalle del rol.',
			problem ?? undefined,
		);
	}

	return (await response.json()) as RoleDetailResponse;
}

export async function updateRole(
	roleId: string,
	payload: UpdateRolePayload,
): Promise<RoleDetailResponse> {
	const response = await fetch(
		`${API_BASE_URL}/roles/${encodeURIComponent(roleId)}`,
		{
			method: 'PUT',
			headers: buildAuthHeaders({
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify({
				name: payload.name.trim(),
				description: payload.description.trim(),
				permissionCodes: payload.permissionCodes,
				version: payload.version,
			}),
		},
	);

	if (!response.ok) {
		const problem = await readProblem(response);
		throw new ApiError(
			response.status,
			problem?.detail ??
				problem?.title ??
				'No fue posible actualizar el rol.',
			problem ?? undefined,
		);
	}

	return (await response.json()) as RoleDetailResponse;
}

export async function getRoleImpact(
	roleId: string,
): Promise<RoleImpactResponse> {
	const response = await fetch(
		`${API_BASE_URL}/roles/${encodeURIComponent(roleId)}/impact`,
		{
			headers: buildAuthHeaders(),
		},
	);

	if (!response.ok) {
		const problem = await readProblem(response);
		throw new ApiError(
			response.status,
			problem?.detail ??
				problem?.title ??
				'No fue posible consultar el impacto del rol.',
			problem ?? undefined,
		);
	}

	return (await response.json()) as RoleImpactResponse;
}

export async function deleteRole(
	roleId: string,
	payload: DeleteRolePayload,
): Promise<void> {
	const response = await fetch(
		`${API_BASE_URL}/roles/${encodeURIComponent(roleId)}`,
		{
			method: 'DELETE',
			headers: buildAuthHeaders({
				'Content-Type': 'application/json',
			}),
			body: JSON.stringify({
				version: payload.version,
				reason: payload.reason.trim(),
			}),
		},
	);

	if (!response.ok) {
		const problem = await readProblem(response);
		throw new ApiError(
			response.status,
			problem?.detail ??
				problem?.title ??
				'No fue posible eliminar el rol.',
			problem ?? undefined,
		);
	}
}