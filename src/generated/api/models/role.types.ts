export type RoleStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface RoleSummary {
	id: string;
	code: string;
	name: string;
	description?: string | null;
	status: RoleStatus;
	protected: boolean;
	permissionCount: number;
	version: number;
	updatedAt: string;
}

export interface RolePageResponse {
	items: RoleSummary[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

export type RoleSortField = 'code' | 'name' | 'status' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';
/** Convenience alias for the `sort` param shape; not itself part of the raw contract. */
export type RoleSortParam = `${RoleSortField},${SortDirection}`;

export interface SearchRolesParams {
	search?: string;
	status?: RoleStatus;
	page?: number;
	pageSize?: number;
	sort?: RoleSortParam;
}

export const DEFAULT_ROLE_SEARCH_PARAMS = {
	page: 0,
	pageSize: 20,
	sort: 'name,asc',
} as const satisfies SearchRolesParams;
