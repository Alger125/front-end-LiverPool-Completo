/**
 * Shape of the real permission catalog data (module/action/displayOrder/
 * assignable/sensitive/status). Endpoint NOT confirmed yet (ambiguo #10).
 */
export interface PermissionCatalogEntry {
	code: string;
	module: string;
	action: string;
	displayName: string;
	description: string;
	displayOrder: number;
	assignable: boolean;
	sensitive: boolean;
	status: 'ACTIVE' | 'INACTIVE';
	notes: string | null;
}

export interface PermissionCatalogModule {
	code: string;
	displayName: string;
	description: string;
	displayOrder: number;
	permissions: PermissionCatalogEntry[];
}

export interface PermissionCatalogResponse {
	modules: PermissionCatalogModule[];
}
