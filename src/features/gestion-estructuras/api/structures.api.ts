import {
	httpDelete,
	httpGet,
	httpPatch,
	httpPost,
	httpPut,
} from '../../../shared/api';

export const DEFAULT_DEMO_LOCATION_ID =
	'f62b081e-4cc2-518a-b840-a7afa915cd3d';
export const DEFAULT_DEMO_DEPARTMENT_ID =
	'7882a45f-8ad2-5009-8d9e-5f6f81671fc8';

const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEPARTMENT_ID_MAP: Record<string, string> = {
	'dep-perfumeria': '7882a45f-8ad2-5009-8d9e-5f6f81671fc8',
	'dep-1': 'cb2e72d5-963b-56a1-b87d-207091e01957',
	'dep-electronica': 'cb2e72d5-963b-56a1-b87d-207091e01957',
	'dep-damas': '7882a45f-8ad2-5009-8d9e-5f6f81671fc8',
	'dep-2': '7882a45f-8ad2-5009-8d9e-5f6f81671fc8',
	'dep-caballeros': 'dc1bc79d-b0a8-59d6-8900-d9354513f82f',
	'dep-3': 'dc1bc79d-b0a8-59d6-8900-d9354513f82f',
	'dep-hogar': 'fd21fa9c-1420-59dc-a970-71b408190ba3',
};

export function resolveBackendDepartmentUuid(
	departmentId?: string,
): string {
	if (!departmentId) {
		return DEFAULT_DEMO_DEPARTMENT_ID;
	}
	if (UUID_REGEX.test(departmentId)) {
		return departmentId;
	}
	return DEPARTMENT_ID_MAP[departmentId] ?? DEFAULT_DEMO_DEPARTMENT_ID;
}

export interface GeographyZoneDto {
	id: string;
	code: string;
	name: string;
}

export interface GeographyLocationDto {
	id: string;
	code: string;
	name: string;
	formatCode?: string;
}

export interface BackendCommercialGroupDto {
	id: string;
	code: string;
	displayCode?: string;
	name: string;
	status: string;
	sectionsCount?: number;
	sections?: Array<{
		id: string;
		code: string;
		name: string;
		isAnchor: boolean;
		assignmentOrigin: string;
	}>;
	collaborators?: Array<{
		id: string;
		employeeNumber: string;
		fullName: string;
		position: string;
		anchorSectionCode: string;
	}>;
}

export interface BackendAvailableSectionDto {
	id: string;
	code: string;
	name: string;
	isAnchorCandidate?: boolean;
}

export interface BackendComprasPacTreeResponse {
	structureType: 'COMPRAS' | 'PAC';
	decisionRef: string;
	requiresOperationalGroups: boolean;
	excludeNonCommercial: boolean;
	excludedNonCommercialUnitsCount: number;
	baseDepartmentsApplied: string[];
	nodes: Array<{
		unitCode: string;
		displayName: string;
		structureType: 'COMPRAS' | 'PAC';
		isCommercial: boolean;
		requiresGroups: boolean;
		leader: {
			employeeId: string;
			name: string;
			positionTitle: string;
		};
		directSectionsCount: number;
		directSections: Array<{
			code: string;
			name: string;
			buyerName: string;
			isAnchor: boolean;
		}>;
	}>;
}

export async function fetchGeographyZones(): Promise<GeographyZoneDto[]> {
	return httpGet<GeographyZoneDto[]>('/geography/zones');
}

export async function fetchZoneLocations(
	zoneId: string,
): Promise<GeographyLocationDto[]> {
	return httpGet<GeographyLocationDto[]>(
		`/geography/zones/${encodeURIComponent(zoneId)}/locations`,
	);
}

export async function fetchStoreTree(
	locationId: string = DEFAULT_DEMO_LOCATION_ID,
	period?: string,
): Promise<unknown> {
	return httpGet('/structures/tree', {
		locationId,
		period,
	});
}

export async function fetchComprasPacTree(
	structureType: 'COMPRAS' | 'PAC',
): Promise<BackendComprasPacTreeResponse> {
	return httpGet<BackendComprasPacTreeResponse>(
		'/structures/compras-pac/tree',
		{
			structureType,
			excludeNonCommercial: true,
		},
	);
}

export async function fetchDepartmentGroupsBackend(
	departmentId?: string,
): Promise<BackendCommercialGroupDto[]> {
	const resolvedId = resolveBackendDepartmentUuid(departmentId);
	return httpGet<BackendCommercialGroupDto[]>(
		`/structures/departments/${encodeURIComponent(resolvedId)}/groups`,
	);
}

export async function fetchAvailableSectionsBackend(
	departmentId?: string,
): Promise<BackendAvailableSectionDto[]> {
	const resolvedId = resolveBackendDepartmentUuid(departmentId);
	return httpGet<BackendAvailableSectionDto[]>(
		`/structures/departments/${encodeURIComponent(resolvedId)}/available-sections`,
	);
}

export async function createGroupBackend(
	departmentId: string | undefined,
	name: string,
	version?: number,
): Promise<unknown> {
	const resolvedId = resolveBackendDepartmentUuid(departmentId);
	return httpPost(
		`/structures/departments/${encodeURIComponent(resolvedId)}/groups`,
		{ name },
		version !== undefined ? { 'If-Match': String(version) } : undefined,
	);
}

export async function renameGroupBackend(
	groupId: string,
	name: string,
	version?: number,
): Promise<unknown> {
	if (!UUID_REGEX.test(groupId)) {
		return null;
	}
	return httpPut(
		`/structures/groups/${encodeURIComponent(groupId)}`,
		{ name },
		version !== undefined ? { 'If-Match': String(version) } : undefined,
	);
}

export async function deleteGroupBackend(
	groupId: string,
	version?: number,
): Promise<unknown> {
	if (!UUID_REGEX.test(groupId)) {
		return null;
	}
	return httpDelete(
		`/structures/groups/${encodeURIComponent(groupId)}`,
		undefined,
		version !== undefined ? { 'If-Match': String(version) } : undefined,
	);
}

export async function assignSectionBackend(
	groupId: string,
	sectionId: string,
	version?: number,
): Promise<unknown> {
	if (!UUID_REGEX.test(groupId) || !UUID_REGEX.test(sectionId)) {
		return null;
	}
	return httpPost(
		`/structures/groups/${encodeURIComponent(groupId)}/sections`,
		{ sectionId },
		version !== undefined ? { 'If-Match': String(version) } : undefined,
	);
}

export async function unassignSectionBackend(
	groupId: string,
	sectionId: string,
	version?: number,
): Promise<unknown> {
	if (!UUID_REGEX.test(groupId) || !UUID_REGEX.test(sectionId)) {
		return null;
	}
	return httpDelete(
		`/structures/groups/${encodeURIComponent(groupId)}/sections/${encodeURIComponent(sectionId)}`,
		undefined,
		version !== undefined ? { 'If-Match': String(version) } : undefined,
	);
}

export async function moveSectionBackend(
	departmentId: string | undefined,
	sectionId: string,
	targetGroupId: string,
	version?: number,
): Promise<unknown> {
	const resolvedDeptId = resolveBackendDepartmentUuid(departmentId);
	if (!UUID_REGEX.test(sectionId) || !UUID_REGEX.test(targetGroupId)) {
		return null;
	}
	return httpPatch(
		`/structures/departments/${encodeURIComponent(resolvedDeptId)}/sections/move`,
		{ sectionId, targetGroupId },
		version !== undefined ? { 'If-Match': String(version) } : undefined,
	);
}

export async function publishDepartmentBackend(
	departmentId: string | undefined,
	period: string = '2026-10',
	notes?: string,
	version?: number,
): Promise<unknown> {
	const resolvedDeptId = resolveBackendDepartmentUuid(departmentId);
	return httpPost(
		`/structures/departments/${encodeURIComponent(resolvedDeptId)}/publish`,
		{ period, notes },
		version !== undefined ? { 'If-Match': String(version) } : undefined,
	);
}

export async function createScheduledChangeBackend(params: {
	departmentId?: string;
	targetPeriod: string;
	effectiveDate: string;
	changeType:
		| 'GROUP_CREATE'
		| 'GROUP_RENAME'
		| 'SECTION_MOVE'
		| 'SECTION_ASSIGN'
		| 'SECTION_UNASSIGN';
	proposedGroupName?: string;
}): Promise<unknown> {
	const resolvedDeptId = resolveBackendDepartmentUuid(params.departmentId);
	return httpPost('/structures/scheduled-changes', {
		departmentId: resolvedDeptId,
		targetPeriod: params.targetPeriod,
		effectiveDate: params.effectiveDate,
		changeType: params.changeType,
		proposedGroupName: params.proposedGroupName,
	});
}
