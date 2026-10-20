import { httpGet } from '../../../shared/api';
import type { PermissionCatalogResponse } from '../model/permission-catalog.model';

/**
 * Connects to GET /api/v1/permissions/grouped (Feature 01 Backend contract).
 */
export async function fetchPermissionCatalog(): Promise<PermissionCatalogResponse> {
	return httpGet<PermissionCatalogResponse>('/permissions/grouped');
}

