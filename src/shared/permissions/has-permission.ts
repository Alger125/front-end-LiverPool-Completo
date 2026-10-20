import type { GrantedPermissions, Permission } from './permission.types';

export function hasPermission(
	permission: Permission | undefined,
	grantedPermissions: GrantedPermissions,
): boolean {
	return permission === undefined || grantedPermissions.includes(permission);
}