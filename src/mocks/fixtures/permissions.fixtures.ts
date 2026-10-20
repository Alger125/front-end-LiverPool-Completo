/**
 * Synthetic fixtures for the Permissions mocks. No real names, emails, or identifiers.
 * These shapes are NOT derived from a confirmed OpenAPI contract and may change.
 */
export const permissionFixtures = Object.freeze([
	Object.freeze({ id: 'perm-001', code: 'catalog.read', label: 'View catalog' }),
	Object.freeze({ id: 'perm-002', code: 'catalog.write', label: 'Edit catalog' }),
	Object.freeze({ id: 'perm-003', code: 'reports.export', label: 'Export reports' }),
]);

export type PermissionFixture = (typeof permissionFixtures)[number];
