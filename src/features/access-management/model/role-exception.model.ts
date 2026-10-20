export interface CollaboratorDirectoryEntry {
	id: string;
	employeeNumber: string;
	fullName: string;
	email: string;
	nominalPosition: string;
	departmentName: string;
	defaultLocation: string;
	status: 'ACTIVE' | 'INACTIVE';
}

export type RoleExceptionStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface RoleExceptionRecord {
	id: string;
	collaboratorId: string;
	employeeNumber: string;
	collaboratorName: string;
	collaboratorEmail: string;
	nominalPosition: string;
	roleId: string;
	roleCode: string;
	roleName: string;
	locationCode: string;
	locationName: string;
	validFrom: string;
	validUntil: string;
	reason: string;
	status: RoleExceptionStatus;
	createdAt: string;
	createdBy: string;
	revokedAt?: string;
	revokedReason?: string;
}

export interface CreateRoleExceptionInput {
	collaboratorId: string;
	roleId: string;
	roleCode: string;
	roleName: string;
	locationCode: string;
	locationName: string;
	validFrom: string;
	validUntil: string;
	reason: string;
	actorName?: string;
}
