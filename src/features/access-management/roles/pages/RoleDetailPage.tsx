import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
	APP_ROUTES,
	roleEditPath,
} from '../../../../app/config/routes';
import { ErrorState } from '../../../../shared/feedback/ErrorState';
import { LoadingState } from '../../../../shared/feedback/LoadingState';
import { formatDateTime } from '../../../../shared/utils';
import {
	formatResultingRule,
	getRoleDetail,
	getRoleExtendedMetadata,
	getRoleImpact,
	type RoleDetailResponse,
	type RoleImpactResponse,
} from '../api/roles.api';
import { RoleDeleteDialog } from '../components/RoleDeleteDialog';

import './RoleListPage.css';
import './RoleDetailAndEdit.css';

const STATUS_LABELS: Record<RoleDetailResponse['status'], string> = {
	ACTIVE: 'Activo',
	INACTIVE: 'Inactivo',
	DELETED: 'Eliminado',
};

const MODULE_LABELS: Record<string, string> = {
	SECURITY_ROLES: 'Seguridad - Roles y Permisos',
	COMMERCIAL_GROUPS: 'Grupos Comerciales',
	SECTIONS: 'Secciones Comerciales',
	REPORTS_ROLE: 'Reporte por Rol',
	REPORTS_GENERAL: 'Reporte General',
	AUDIT_HISTORY: 'Historial y Auditoría',
};

export default function RoleDetailPage() {
	const { roleId = '' } = useParams<{ roleId: string }>();
	const navigate = useNavigate();

	const [role, setRole] = useState<RoleDetailResponse | null>(null);
	const [impact, setImpact] = useState<RoleImpactResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	useEffect(() => {
		if (!roleId) {
			setError('Identificador de rol no válido.');
			setIsLoading(false);
			return;
		}

		let isCancelled = false;
		setIsLoading(true);
		setError(null);

		Promise.all([
			getRoleDetail(roleId),
			getRoleImpact(roleId).catch(() => null),
		])
			.then(([detailData, impactData]) => {
				if (!isCancelled) {
					setRole(detailData);
					setImpact(impactData);
				}
			})
			.catch((err: unknown) => {
				if (!isCancelled) {
					setError(
						err instanceof Error
							? err.message
							: 'No fue posible consultar el detalle del rol.',
					);
				}
			})
			.finally(() => {
				if (!isCancelled) {
					setIsLoading(false);
				}
			});

		return () => {
			isCancelled = true;
		};
	}, [roleId]);

	if (isLoading) {
		return (
			<main className="role-workspace">
				<LoadingState label="Cargando detalle del rol…" />
			</main>
		);
	}

	if (error || !role) {
		return (
			<main className="role-workspace">
				<ErrorState message={error ?? 'El rol solicitado no fue encontrado.'} />
				<div style={{ marginTop: 16 }}>
					<button
						className="role-workspace__btn role-workspace__btn--secondary"
						onClick={() => navigate(APP_ROUTES.roles)}
						type="button"
					>
						Volver al catálogo
					</button>
				</div>
			</main>
		);
	}

	const metadata = getRoleExtendedMetadata(role.id, role.code);
	const resultingRule = formatResultingRule(metadata.conditions);

	const permissionsByModule = role.permissions.reduce<
		Record<string, RoleDetailResponse['permissions']>
	>((acc, perm) => {
		const mod = perm.module || 'GENERAL';
		if (!acc[mod]) {
			acc[mod] = [];
		}
		acc[mod].push(perm);
		return acc;
	}, {});

	const moduleKeys = Object.keys(permissionsByModule);

	return (
		<main className="role-workspace">
			<p className="role-workspace__breadcrumb">
				Inicio / Roles y Permisos / Catálogo de Roles y Permisos / Detalle del Rol
			</p>

			<header className="role-workspace__header">
				<div className="role-workspace__title-group">
					<div className="role-workspace__badges">
						<span className="role-workspace__code-badge">
							ID Rol: {role.code}
						</span>
						<span
							className={`roles-table__status roles-table__status--${role.status.toLowerCase()}`}
						>
							{STATUS_LABELS[role.status]}
						</span>
						<span className="role-workspace__version-badge">
							Versión v{role.version}
						</span>
						{role.protected ? (
							<span className="roles-table__protected-badge">
								Rol de Sistema Protegido
							</span>
						) : null}
					</div>
					<h1 className="role-workspace__title">{role.name}</h1>
					<p className="role-workspace__subtitle">
						Consulta en modo de solo lectura de la configuración, matriz de
						permisos y regla de alcance del rol.
					</p>
				</div>

				<div className="role-workspace__header-actions">
					<button
						className="role-workspace__btn role-workspace__btn--secondary"
						onClick={() => navigate(APP_ROUTES.roles)}
						type="button"
					>
						← Volver al catálogo
					</button>

					{role.status !== 'DELETED' ? (
						<button
							className="role-workspace__btn role-workspace__btn--primary"
							onClick={() => navigate(roleEditPath(role.id))}
							type="button"
						>
							Editar rol
						</button>
					) : null}

					{role.status !== 'DELETED' ? (
						<button
							className="role-workspace__btn role-workspace__btn--danger"
							onClick={() => setIsDeleteOpen(true)}
							type="button"
						>
							Eliminar rol
						</button>
					) : null}
				</div>
			</header>

			<div className="role-workspace__grid">
				<div className="role-workspace__main">
					<section className="role-workspace__card">
						<h2 className="role-workspace__card-title">Datos del rol</h2>
						<p className="role-workspace__card-subtitle">
							Identificador autogenerado e información descriptiva registrada.
						</p>

						<div className="role-workspace__fields-grid">
							<div className="role-workspace__field">
								<label className="role-workspace__label" htmlFor="detail-role-code">
									ID Rol
								</label>
								<input
									className="role-workspace__input"
									id="detail-role-code"
									readOnly
									type="text"
									value={role.code}
								/>
							</div>

							<div className="role-workspace__field">
								<label className="role-workspace__label" htmlFor="detail-role-name">
									Nombre del rol
								</label>
								<input
									className="role-workspace__input"
									id="detail-role-name"
									readOnly
									type="text"
									value={role.name}
								/>
							</div>

							<div className="role-workspace__field role-workspace__field--full">
								<label className="role-workspace__label" htmlFor="detail-role-desc">
									Descripción
								</label>
								<textarea
									className="role-workspace__textarea"
									id="detail-role-desc"
									readOnly
									value={role.description || 'Sin descripción registrada.'}
								/>
							</div>
						</div>
					</section>

					<section className="role-workspace__card">
						<h2 className="role-workspace__card-title">
							Matriz de permisos y acceso a módulos
						</h2>
						<p className="role-workspace__card-subtitle">
							Permisos efectivos otorgados por este rol y su nivel de alcance
							organizacional.
						</p>

						<div className="role-workspace__matrix-wrapper">
							<table className="role-workspace__matrix-table">
								<thead>
									<tr>
										<th scope="col">Módulo</th>
										<th scope="col">Permisos habilitados</th>
										<th scope="col">Alcance</th>
									</tr>
								</thead>
								<tbody>
									{moduleKeys.length === 0 ? (
										<tr>
											<td colSpan={3}>
												Este rol no tiene permisos asignados actualmente.
											</td>
										</tr>
									) : (
										moduleKeys.map((modKey) => {
											const perms = permissionsByModule[modKey] ?? [];
											const scope =
												metadata.moduleScopes[modKey] ?? 'Por Ubicación';
											return (
												<tr key={modKey}>
													<td>
														<span className="role-workspace__module-name">
															{MODULE_LABELS[modKey] ?? modKey}
														</span>
														<span className="role-workspace__module-desc">
															{perms.length}{' '}
															{perms.length === 1
																? 'permiso activo'
																: 'permisos activos'}
														</span>
													</td>
													<td>
														<div className="role-workspace__perm-chips">
															{perms.map((perm) => (
																<span
																	className="role-workspace__perm-chip role-workspace__perm-chip--selected"
																	key={perm.code}
																>
																	✓ {perm.displayName}
																</span>
															))}
														</div>
													</td>
													<td>
														<span className="role-workspace__version-badge">
															{scope}
														</span>
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
					</section>

					<section className="role-workspace__card">
						<h2 className="role-workspace__card-title">
							Asignación de Roles — Regla de Condición
						</h2>
						<p className="role-workspace__card-subtitle">
							Condiciones organizacionales que determinan la asignación
							automática de este rol.
						</p>

						<div className="role-workspace__conditions-list">
							{metadata.conditions.map((cond) => (
								<div className="role-workspace__condition-row" key={cond.id}>
									<input
										aria-label="Campo de condición"
										className="role-workspace__input"
										readOnly
										type="text"
										value={cond.field}
									/>
									<input
										aria-label="Operador"
										className="role-workspace__input"
										readOnly
										type="text"
										value={cond.operator}
									/>
									<input
										aria-label="Valor de condición"
										className="role-workspace__input"
										readOnly
										type="text"
										value={cond.value}
									/>
								</div>
							))}
						</div>

						<div className="role-workspace__resulting-rule">
							<p className="role-workspace__resulting-rule-title">
								Regla Resultante
							</p>
							<p className="role-workspace__resulting-rule-code">
								{resultingRule}
							</p>
						</div>
					</section>
				</div>

				<aside className="role-workspace__sidebar">
					<section className="role-workspace__card">
						<h2 className="role-workspace__card-title">Resumen del Rol</h2>
						<p className="role-workspace__card-subtitle">
							Estado consolidado e impacto activo.
						</p>

						<ul className="role-workspace__summary-list">
							<li className="role-workspace__summary-item">
								<span className="role-workspace__summary-label">Código</span>
								<span className="role-workspace__summary-value">{role.code}</span>
							</li>
							<li className="role-workspace__summary-item">
								<span className="role-workspace__summary-label">
									Permisos activos
								</span>
								<span className="role-workspace__summary-value">
									{role.permissions.length} permisos en {moduleKeys.length}{' '}
									{moduleKeys.length === 1 ? 'módulo' : 'módulos'}
								</span>
							</li>
							<li className="role-workspace__summary-item">
								<span className="role-workspace__summary-label">
									Colaboradores asignados por regla
								</span>
								<span className="role-workspace__summary-value">
									{impact?.activeAssignments ?? 0} colaboradores
								</span>
							</li>
							<li className="role-workspace__summary-item">
								<span className="role-workspace__summary-label">
									Excepciones activas vinculadas
								</span>
								<span className="role-workspace__summary-value">
									{impact?.activeExceptions ?? 0} excepciones
								</span>
							</li>
							<li className="role-workspace__summary-item">
								<span className="role-workspace__summary-label">
									Última actualización
								</span>
								<span className="role-workspace__summary-value">
									{formatDateTime(role.updatedAt)}
								</span>
							</li>
						</ul>
					</section>
				</aside>
			</div>

			<RoleDeleteDialog
				onCancel={() => setIsDeleteOpen(false)}
				onDeleted={(deleted) => {
					setIsDeleteOpen(false);
					navigate(APP_ROUTES.roles, {
						replace: true,
						state: {
							successMessage: `Rol "${deleted.name}" eliminado exitosamente.`,
						},
					});
				}}
				role={
					isDeleteOpen
						? {
								id: role.id,
								code: role.code,
								name: role.name,
								description: role.description,
								status: role.status,
								protected: role.protected,
								permissionCount: role.permissionCount,
								version: role.version,
								updatedAt: role.updatedAt,
							}
						: null
				}
			/>
		</main>
	);
}