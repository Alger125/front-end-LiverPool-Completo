import { useQuery } from '@tanstack/react-query';

import { fetchPermissionCatalog } from './permissions.api';

export function usePermissionCatalogQuery() {
	return useQuery({
		queryKey: ['permission-catalog'],
		queryFn: fetchPermissionCatalog,
	});
}
