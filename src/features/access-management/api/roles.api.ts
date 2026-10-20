import { httpGet } from '../../../shared/api';
import type { RolePageResponse, SearchRolesParams } from '../../../generated/api';

/**
 * GET /api/v1/roles — operationId: searchRoles, permission: ROLE_VIEW.
 * `search`: string, max 100 chars, matches code/name/description (NOT id/UUID).
 * Base URL comes from `env.apiBaseUrl`; only the resource path is declared here.
 */
export async function searchRoles(params: SearchRolesParams = {}): Promise<RolePageResponse> {
	return httpGet<RolePageResponse>('/roles', {
		search: params.search,
		status: params.status,
		page: params.page,
		pageSize: params.pageSize,
		sort: params.sort,
	});
}
