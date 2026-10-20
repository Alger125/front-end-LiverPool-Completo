import { useState } from 'react';

import { useRolesQuery } from '../../api/roles.queries';
import { DEFAULT_ROLE_SEARCH_PARAMS, type RoleSortParam } from '../../../../generated/api';

/** Contrato confirmado: page es 0-based (min 0, default 0); pageSize min 1, max 100, default 20. */
const DEFAULT_API_PAGE = DEFAULT_ROLE_SEARCH_PARAMS.page;
const DEFAULT_PAGE_SIZE = DEFAULT_ROLE_SEARCH_PARAMS.pageSize;

/**
 * El mapeo pagina visible (1-based) <-> pagina API (0-based) vive solo aqui:
 * el resto de la UI trabaja unicamente con `visiblePage`.
 */
export function useRoleTable() {
  const [search, setSearchState] = useState<string | undefined>(undefined);
  const [apiPage, setApiPage] = useState<number>(DEFAULT_API_PAGE);
  const [sort, setSort] = useState<RoleSortParam>(DEFAULT_ROLE_SEARCH_PARAMS.sort);

  const rolesQuery = useRolesQuery({
    search,
    page: apiPage,
    pageSize: DEFAULT_PAGE_SIZE,
    sort,
  });

  function setSearch(term: string | undefined) {
    setSearchState(term);
    // DoD: una nueva busqueda restablece la pagina a la primera (API page 0).
    setApiPage(DEFAULT_API_PAGE);
  }

  function setVisiblePage(visiblePage: number) {
    setApiPage(Math.max(DEFAULT_API_PAGE, visiblePage - 1));
  }

  // Hoy solo `search` es filtrable desde la UI; `status` se sumara cuando exista su selector.
  const hasActiveFilters = Boolean(search);

  function clearFilters() {
    setSearch(undefined);
  }

  return {
    ...rolesQuery,
    roles: rolesQuery.data?.items ?? [],
    search,
    setSearch,
    hasActiveFilters,
    clearFilters,
    sort,
    setSort,
    visiblePage: apiPage + 1,
    setVisiblePage,
    totalItems: rolesQuery.data?.totalItems ?? 0,
    totalPages: rolesQuery.data?.totalPages ?? 1,
  };
}
