import type { ReactNode } from 'react';

import { hasPermission } from './has-permission';
import type { GrantedPermissions, Permission } from './permission.types';

interface PermissionGuardProps {
	children: ReactNode;
	fallback?: ReactNode;
	grantedPermissions?: GrantedPermissions;
	requiredPermission?: Permission;
}

export function PermissionGuard({
	children,
	fallback = null,
	grantedPermissions = [],
	requiredPermission,
}: PermissionGuardProps) {
	return hasPermission(requiredPermission, grantedPermissions) ? children : fallback;
}
