interface RolePaginationProps {
	visiblePage: number;
	totalPages: number;
	totalItems: number;
	onPageChange: (visiblePage: number) => void;
}

/** Works only with the 1-based `visiblePage` — the API's 0-based `page` never leaks here. */
export function RolePagination({
	visiblePage,
	totalPages,
	totalItems,
	onPageChange,
}: RolePaginationProps) {
	const isFirstPage = visiblePage <= 1;
	const isLastPage = visiblePage >= totalPages;

	return (
		<nav aria-label="Paginacion de roles">
			<p aria-live="polite">
				{totalItems} {totalItems === 1 ? 'rol' : 'roles'} · Página {visiblePage} de {totalPages}
			</p>
			<button
				disabled={isFirstPage}
				onClick={() => onPageChange(visiblePage - 1)}
				type="button"
			>
				Anterior
			</button>
			<button disabled={isLastPage} onClick={() => onPageChange(visiblePage + 1)} type="button">
				Siguiente
			</button>
		</nav>
	);
}
