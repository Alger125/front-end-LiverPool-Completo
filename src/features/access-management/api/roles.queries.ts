import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { searchRoles } from './roles.api';
import { roleQueryKeys } from './roles.query-keys';
import type { SearchRolesParams } from '../../../generated/api';

export function useRolesQuery(params: SearchRolesParams = {}) {
	return useQuery({
		queryKey: roleQueryKeys.list(params),
		queryFn: () => searchRoles(params),
		// Refetch (pagina/orden/busqueda) no debe vaciar la tabla mientras llega la respuesta nueva.
		placeholderData: keepPreviousData,
	});
}
