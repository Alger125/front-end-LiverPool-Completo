/**
 * Synthetic fixtures for the Roles mocks. No real names, emails, or identifiers.
 * Shape matches the confirmed RoleSummary contract.
 */
export const roleFixtures = Object.freeze([
	Object.freeze({
		id: '3d377584-c0c5-4391-b4f9-b11ae93f4bfd',
		code: 'STRUCTURE_ADMIN',
		name: 'Administrador de estructuras',
		description: 'Administra grupos y secciones.',
		status: 'ACTIVE',
		protected: false,
		permissionCount: 4,
		version: 3,
		updatedAt: '2026-09-22T10:30:00-06:00',
	}),
	Object.freeze({
		id: '8a1f9e3c-2b4d-4a7f-9c6e-5d0f1a2b3c4d',
		code: 'COMMERCIAL_GROUP_MANAGER',
		name: 'Gerente de grupo comercial',
		description: 'Supervisa la operacion de un grupo comercial.',
		status: 'ACTIVE',
		protected: true,
		permissionCount: 12,
		version: 5,
		updatedAt: '2026-09-01T09:15:00-06:00',
	}),
	Object.freeze({
		id: 'f6b2c4d8-7e1a-4c9b-8f3d-2a1e0b9c8d7f',
		code: 'READ_ONLY_AUDITOR',
		name: 'Auditor de solo lectura',
		description: null,
		status: 'INACTIVE',
		protected: false,
		permissionCount: 0,
		version: 1,
		updatedAt: '2026-05-20T11:00:00-06:00',
	}),
]);

export type RoleFixture = (typeof roleFixtures)[number];
