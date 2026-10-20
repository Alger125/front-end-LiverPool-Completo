import type { SearchRolesParams } from '../../../generated/api';

/** Every param is part of the key so search/status/page/sort never share cache. */
export const roleQueryKeys = {
	all: ['roles'] as const,
	lists: () => [...roleQueryKeys.all, 'list'] as const,
	list: (params: SearchRolesParams) => [...roleQueryKeys.lists(), params] as const,
	details: () => [...roleQueryKeys.all, 'detail'] as const,
	detail: (roleId: string) => [...roleQueryKeys.details(), roleId] as const,
	impact: (roleId: string) => [...roleQueryKeys.detail(roleId), 'impact'] as const,
};
