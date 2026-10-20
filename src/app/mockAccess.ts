import { MOCK_ROLE_PERMISSIONS } from '../mocks/auth/mockPermissions';
import { getStoredSession } from '../shared/auth';
import type { GrantedPermissions } from '../shared/permissions';

export function getMockPermissions():
	| GrantedPermissions
	| undefined {
	const activeSession = getStoredSession();
	if (activeSession?.grantedPermissions) {
		return activeSession.grantedPermissions;
	}

	const shouldUseMockPermissions =
		import.meta.env.DEV &&
		import.meta.env.VITE_USE_MOCKS === 'true';

	if (!shouldUseMockPermissions) {
		return undefined;
	}

	return MOCK_ROLE_PERMISSIONS;
}