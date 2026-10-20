import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
	APP_ROUTES,
	roleDetailPath,
	roleEditPath,
} from '../../../../app/config/routes';
import type { RoleSummary } from '../../../../generated/api';
import { ApiError } from '../../../../shared/api';
import { emitUnauthorized } from '../../../../shared/auth';
import { EmptyState } from '../../../../shared/feedback/EmptyState';
import { ErrorState } from '../../../../shared/feedback/ErrorState';
import { ForbiddenState } from '../../../../shared/feedback/ForbiddenState';
import { LoadingState } from '../../../../shared/feedback/LoadingState';
import { SuccessToast } from '../../../../shared/feedback/SuccessToast';
import {
	PermissionGuard,
	type GrantedPermissions,
} from '../../../../shared/permissions';
import { SECURITY_PERMISSION_CODES } from '../../model/permission.model';
import { RoleDeleteDialog } from '../components/RoleDeleteDialog';
import { RolePagination } from '../components/RolePagination';
import { RoleSearch } from '../components/RoleSearch';
import { RoleTable } from '../components/RoleTable';
import { RoleTableSkeleton } from '../components/RoleTableSkeleton';
import { useRoleTable } from '../hooks/useRoleTable';

import './RoleListPage.css';

interface RoleListPageLocationState {
	successMessage?: string;
}

interface RoleListPageProps {
	grantedPermissions?: GrantedPermissions;
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message.trim().length > 0) {
		return error.message;
	}

	return 'Ocurrió un error inesperado al consultar los roles.';
}

export function RoleListPage({ grantedPermissions }: RoleListPageProps) {
	const location = useLocation();
	const navigate = useNavigate();

	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [rolePendingDelete, setRolePendingDelete] =
		useState<RoleSummary | null>(null);

	const {
		roles,
		search,
		setSearch,
		hasActiveFilters,
		clearFilters,
		sort,
		setSort,
		visiblePage,
		setVisiblePage,
		totalItems,
		totalPages,
		status,
		error,
		refetch,
		isFetching,
	} = useRoleTable();

	const apiError = error instanceof ApiError ? error : undefined;

	const isUnauthorized = status === 'error' && apiError?.status === 401;
	const isForbidden =
		status === 'error' && !isUnauthorized && apiError?.status === 403;
	const isInvalidRequest =
		status === 'error' && !isUnauthorized && apiError?.status === 400;

	const isTechnicalApiError =
		status === 'error' &&
		!isUnauthorized &&
		apiError !== undefined &&
		apiError.status !== 400 &&
		apiError.status !== 403;

	const isUnknownError =
		status === 'error' && !isUnauthorized && apiError === undefined;

	const isPending = status === 'pending';

	const isEmptyWithoutFilters =
		status === 'success' && roles.length === 0 && !hasActiveFilters;

	const isEmptyWithFilters =
		status === 'success' && roles.length === 0 && hasActiveFilters;

	const hasRoles = status === 'success' && roles.length > 0;

	useEffect(() => {
		if (isUnauthorized) {
			emitUnauthorized();
		}
	}, [isUnauthorized]);

	useEffect(() => {
		const navigationState = location.state as RoleListPageLocationState | null;
		const message = navigationState?.successMessage;

		if (!message) {
			return;
		}

		setSuccessMessage(message);

		navigate(location.pathname, {
			replace: true,
			state: null,
		});
	}, [location.pathname, location.state, navigate]);

	function handleCreateRole(): void {
		navigate(APP_ROUTES.roleCreate);
	}

	function handleOpenExceptions(): void {
		navigate(APP_ROUTES.roleExceptions);
	}

	function handleSearch(term: string): void {
		const normalizedTerm = term.trim();
		setSearch(normalizedTerm.length > 0 ? normalizedTerm : undefined);
	}

	function handleRetry(): void {
		void refetch();
	}

	function handleDeleted(deletedRole: RoleSummary): void {
		setRolePendingDelete(null);
		setSuccessMessage(
			`Rol "${deletedRole.name}" eliminado exitosamente. Las asignaciones activas fueron revocadas.`,
		);
		void refetch();
	}

	return (
		<section className="roles-page">
			{successMessage ? (
				<SuccessToast
					message={successMessage}
					onClose={() => {
						setSuccessMessage(null);
					}}
				/>
			) : null}

			<p className="roles-page__breadcrumb">
				Inicio / Roles y Permisos / Catálogo de Roles y Permisos
			</p>

			<header className="roles-page__header">
				<div>
					<h1 className="roles-page__title">Catálogo de roles y permisos</h1>
					<p className="roles-page__subtitle">
						Consulta, filtra y administra los perfiles de acceso y alcances
						organizacionales.
					</p>
				</div>

				<div className="roles-page__header-actions">
					<PermissionGuard
						grantedPermissions={grantedPermissions}
						requiredPermission={SECURITY_PERMISSION_CODES.ROLE_EXCEPTION_VIEW}
					>
						<button
							className="roles-page__exception-btn"
							onClick={handleOpenExceptions}
							type="button"
						>
							<svg
								aria-hidden="true"
								fill="currentColor"
								focusable="false"
								height="17"
								viewBox="0 0 24 24"
								width="17"
							>
								<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
							</svg>
							<span>Asignación por excepción</span>
						</button>
					</PermissionGuard>

					<PermissionGuard
						grantedPermissions={grantedPermissions}
						requiredPermission={SECURITY_PERMISSION_CODES.ROLE_CREATE}
					>
						<button
							className="roles-page__create-btn"
							onClick={handleCreateRole}
							type="button"
						>
							<svg
								aria-hidden="true"
								fill="currentColor"
								focusable="false"
								height="18"
								viewBox="0 0 24 24"
								width="18"
							>
								<path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z" />
							</svg>
							<span>Crear rol</span>
						</button>
					</PermissionGuard>
				</div>
			</header>

			<PermissionGuard
				fallback={<ForbiddenState message="Acceso no autorizado." />}
				grantedPermissions={grantedPermissions}
				requiredPermission={SECURITY_PERMISSION_CODES.ROLE_VIEW}
			>
				<RoleSearch initialValue={search} onSearch={handleSearch} />

				{isPending ? (
					<>
						<LoadingState label="Cargando roles…" />
						<RoleTableSkeleton />
					</>
				) : null}

				{isForbidden ? (
					<ForbiddenState message="Acceso no autorizado." />
				) : null}

				{isInvalidRequest ? (
					<div aria-live="assertive" className="roles-page__error" role="alert">
						<ErrorState message="No fue posible aplicar los filtros. Revisa los criterios de búsqueda." />
					</div>
				) : null}

				{isTechnicalApiError ? (
					<div aria-live="assertive" className="roles-page__error" role="alert">
						<ErrorState
							message={
								apiError?.message || 'No fue posible consultar los roles.'
							}
						/>
						<button
							className="roles-page__retry"
							onClick={handleRetry}
							type="button"
						>
							Reintentar
						</button>
					</div>
				) : null}

				{isUnknownError ? (
					<div aria-live="assertive" className="roles-page__error" role="alert">
						<ErrorState message={getErrorMessage(error)} />
						<button
							className="roles-page__retry"
							onClick={handleRetry}
							type="button"
						>
							Reintentar
						</button>
					</div>
				) : null}

				{isEmptyWithoutFilters ? (
					<EmptyState message="No hay roles registrados." />
				) : null}

				{isEmptyWithFilters ? (
					<div className="roles-page__empty">
						<EmptyState message="No se encontraron roles con los filtros seleccionados." />
						<button
							className="roles-page__clear-filters"
							onClick={clearFilters}
							type="button"
						>
							Limpiar filtros
						</button>
					</div>
				) : null}

				{hasRoles ? (
					<>
						{isFetching ? (
							<p
								aria-live="polite"
								className="roles-page__updating"
								role="status"
							>
								Actualizando…
							</p>
						) : null}

						<RoleTable
							grantedPermissions={grantedPermissions}
							onDelete={(role) => setRolePendingDelete(role)}
							onEdit={(role) => navigate(roleEditPath(role.id))}
							onSortChange={setSort}
							onView={(role) => navigate(roleDetailPath(role.id))}
							roles={roles}
							sort={sort}
						/>

						<RolePagination
							onPageChange={setVisiblePage}
							totalItems={totalItems}
							totalPages={totalPages}
							visiblePage={visiblePage}
						/>
					</>
				) : null}
			</PermissionGuard>

			<RoleDeleteDialog
				onCancel={() => setRolePendingDelete(null)}
				onDeleted={handleDeleted}
				role={rolePendingDelete}
			/>
		</section>
	);
}
