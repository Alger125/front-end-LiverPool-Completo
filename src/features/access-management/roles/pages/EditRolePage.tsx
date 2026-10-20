import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { APP_ROUTES } from '../../../../app/config/routes';
import { ApiError } from '../../../../shared/api';
import {
	appendAuditLogEntry,
	setHasUnsavedChanges,
	useSession,
} from '../../../../shared/auth';
import { ErrorState } from '../../../../shared/feedback/ErrorState';
import { LoadingState } from '../../../../shared/feedback/LoadingState';
import { fetchPermissionCatalog } from '../../api/permissions.api';
import type { PermissionCatalogModule } from '../../model/permission-catalog.model';
import {
	formatResultingRule,
	getRoleDetail,
	getRoleExtendedMetadata,
	saveRoleExtendedMetadata,
	updateRole,
	type ModuleScopeLevel,
	type RoleConditionField,
	type RoleDetailResponse,
	type RoleRuleCondition,
} from '../api/roles.api';

import './RoleListPage.css';
import './RoleDetailAndEdit.css';

type FilterTabId = 'ALL' | 'STRUCTURE' | 'SECURITY' | 'REPORTS';

const FILTER_TABS: Array<{ id: FilterTabId; label: string; modules: string[] }> = [
	{ id: 'ALL', label: 'Todos', modules: [] },
	{
		id: 'STRUCTURE',
		label: 'Gestión de Estructura',
		modules: ['COMMERCIAL_GROUPS', 'SECTIONS'],
	},
	{
		id: 'SECURITY',
		label: 'Roles y Permisos',
		modules: ['SECURITY_ROLES'],
	},
	{
		id: 'REPORTS',
		label: 'Reportes',
		modules: ['REPORTS_ROLE', 'REPORTS_GENERAL', 'AUDIT_HISTORY'],
	},
];

const SCOPE_OPTIONS: ModuleScopeLevel[] = [
	'Nacional',
	'Regional',
	'Por Ubicación',
	'Por Departamento',
];

const CONDITION_FIELDS: RoleConditionField[] = [
	'Puesto',
	'Ubicación',
	'Negocio',
	'Zona',
];

const SUGGESTED_VALUES_BY_FIELD: Record<RoleConditionField, string[]> = {
	Puesto: [
		'Jefatura de Departamento',
		'Administrador de Plataforma',
		'Gerente de Tienda',
		'Analista de Operaciones',
		'Coordinador de Planeación',
	],
	Ubicación: [
		'Ubicación Centro',
		'Ubicación Norte',
		'Santa Fe (0042)',
		'Perisur (0015)',
		'Polanco (0008)',
	],
	Negocio: ['Liverpool', 'Suburbia', 'Corporativo Liverpool / Suburbia'],
	Zona: ['Zona Centro', 'Zona Norte', 'Zona Metropolitana', 'Zona Occidente'],
};

export default function EditRolePage() {
	const { roleId = '' } = useParams<{ roleId: string }>();
	const navigate = useNavigate();
	const session = useSession();

	const [role, setRole] = useState<RoleDetailResponse | null>(null);
	const [catalogModules, setCatalogModules] = useState<
		PermissionCatalogModule[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const [activeStep, setActiveStep] = useState<1 | 2>(1);
	const [activeFilter, setActiveFilter] = useState<FilterTabId>('ALL');

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
	const [moduleScopes, setModuleScopes] = useState<
		Record<string, ModuleScopeLevel>
	>({});
	const [conditions, setConditions] = useState<RoleRuleCondition[]>([]);
	const [isDirty, setIsDirty] = useState(false);

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [isVersionConflict, setIsVersionConflict] = useState(false);

	const loadRoleAndCatalog = useCallback(async () => {
		if (!roleId) {
			setLoadError('Identificador de rol inválido.');
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setLoadError(null);
		setSaveError(null);
		setIsVersionConflict(false);

		try {
			const [detailData, catalogData] = await Promise.all([
				getRoleDetail(roleId),
				fetchPermissionCatalog(),
			]);

			const metadata = getRoleExtendedMetadata(detailData.id, detailData.code);

			setRole(detailData);
			setCatalogModules(catalogData.modules);
			setName(detailData.name);
			setDescription(detailData.description ?? '');
			setSelectedCodes(detailData.permissions.map((p) => p.code));
			setModuleScopes(metadata.moduleScopes);
			setConditions(metadata.conditions);
			setIsDirty(false);
			setHasUnsavedChanges(false);
		} catch (err: unknown) {
			setLoadError(
				err instanceof Error
					? err.message
					: 'No fue posible cargar la información del rol.',
			);
		} finally {
			setIsLoading(false);
		}
	}, [roleId]);

	useEffect(() => {
		void loadRoleAndCatalog();
		return () => {
			setHasUnsavedChanges(false);
		};
	}, [loadRoleAndCatalog]);

	function markDirty(): void {
		setIsDirty(true);
		setHasUnsavedChanges(true);
		setSaveError(null);
	}

	function handleTogglePermission(code: string): void {
		markDirty();
		setSelectedCodes((prev) =>
			prev.includes(code)
				? prev.filter((item) => item !== code)
				: [...prev, code],
		);
	}

	function handleToggleModuleActionGroup(codes: string[]): void {
		if (codes.length === 0) {
			return;
		}
		markDirty();
		const allSelected = codes.every((code) => selectedCodes.includes(code));
		if (allSelected) {
			setSelectedCodes((prev) => prev.filter((code) => !codes.includes(code)));
		} else {
			setSelectedCodes((prev) => Array.from(new Set([...prev, ...codes])));
		}
	}

	function handleScopeChange(
		moduleCode: string,
		scope: ModuleScopeLevel,
	): void {
		markDirty();
		setModuleScopes((prev) => ({
			...prev,
			[moduleCode]: scope,
		}));
	}

	function handleAddCondition(): void {
		markDirty();
		setConditions((prev) => [
			...prev,
			{
				id: `cond-${Date.now()}-${prev.length}`,
				field: 'Ubicación',
				operator: '=',
				value: 'Ubicación Centro',
			},
		]);
	}

	function handleUpdateCondition(
		id: string,
		patch: Partial<RoleRuleCondition>,
	): void {
		markDirty();
		setConditions((prev) =>
			prev.map((cond) => {
				if (cond.id !== id) {
					return cond;
				}
				const next = { ...cond, ...patch };
				if (patch.field && !patch.value) {
					next.value = SUGGESTED_VALUES_BY_FIELD[patch.field]?.[0] ?? '';
				}
				return next;
			}),
		);
	}

	function handleRemoveCondition(id: string): void {
		markDirty();
		setConditions((prev) => prev.filter((cond) => cond.id !== id));
	}

	function handleCancel(): void {
		if (
			isDirty &&
			!window.confirm(
				'Tienes cambios sin guardar. ¿Deseas salir sin aplicar los cambios?',
			)
		) {
			return;
		}
		setHasUnsavedChanges(false);
		navigate(APP_ROUTES.roles);
	}

	async function handleSave(simulateStaleVersion = false): Promise<void> {
		if (!role || isSaving) {
			return;
		}

		setSaveError(null);
		setIsVersionConflict(false);

		if (name.trim().length < 3) {
			setSaveError('El nombre del rol debe tener al menos 3 caracteres.');
			return;
		}

		if (selectedCodes.length === 0) {
			setSaveError('Debes asignar al menos un permiso activo al rol.');
			return;
		}

		setIsSaving(true);

		try {
			const versionToSend = simulateStaleVersion
				? role.version - 1
				: role.version;

			const updated = await updateRole(role.id, {
				name: name.trim(),
				description: description.trim(),
				permissionCodes: selectedCodes,
				version: versionToSend,
			});

			saveRoleExtendedMetadata(role.id, {
				conditions,
				moduleScopes,
			});

			appendAuditLogEntry({
				action: 'ROLE_UPDATED',
				actorId: session?.user.employeeNumber ?? 'EMP-900142',
				actorName: session?.user.fullName ?? 'Administrador',
				detail: `Actualizó el rol ${updated.code} (${updated.name}) a versión v${updated.version} con ${selectedCodes.length} permisos y regla: ${formatResultingRule(conditions)}`,
				module: 'SECURITY_ROLES',
				outcome: 'SUCCESS',
			});

			setHasUnsavedChanges(false);

			navigate(APP_ROUTES.roles, {
				replace: true,
				state: {
					successMessage: `Rol "${updated.name}" actualizado exitosamente (Versión v${updated.version}).`,
				},
			});
		} catch (err: unknown) {
			if (
				err instanceof ApiError &&
				err.status === 409 &&
				(err.problem?.code === 'VERSION_CONFLICT' ||
					err.message.toLowerCase().includes('otro usuario'))
			) {
				setIsVersionConflict(true);
				setSaveError(
					err.message ||
						'El rol fue modificado por otro usuario. Recarga la información antes de continuar.',
				);
			} else {
				setSaveError(
					err instanceof Error
						? err.message
						: 'No fue posible guardar los cambios del rol.',
				);
			}
		} finally {
			setIsSaving(false);
		}
	}

	if (isLoading) {
		return (
			<main className="role-workspace">
				<LoadingState label="Cargando configuración del rol…" />
			</main>
		);
	}

	if (loadError || !role) {
		return (
			<main className="role-workspace">
				<ErrorState message={loadError ?? 'No se encontró el rol solicitado.'} />
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

	const visibleModules = catalogModules.filter((mod) => {
		const tab = FILTER_TABS.find((t) => t.id === activeFilter);
		if (!tab || tab.modules.length === 0) {
			return true;
		}
		return tab.modules.includes(mod.code);
	});

	const resultingRule = formatResultingRule(conditions);

	return (
		<main className="role-workspace">
			<p className="role-workspace__breadcrumb">
				Inicio / Roles y Permisos / Catálogo de Roles y Permisos / Editar Rol
			</p>

			<header className="role-workspace__header">
				<div className="role-workspace__title-group">
					<div className="role-workspace__badges">
						<span className="role-workspace__code-badge">
							ID Rol: {role.code}
						</span>
						<span className="role-workspace__version-badge">
							Versión consultada: v{role.version}
						</span>
					</div>
					<h1 className="role-workspace__title">Editar rol: {role.name}</h1>
					<p className="role-workspace__subtitle">
						Modifica el nombre, descripción, matriz de permisos por módulo y la
						regla de condición de alcance.
					</p>
				</div>

				<div className="role-workspace__header-actions">
					<button
						className="role-workspace__btn role-workspace__btn--ghost"
						onClick={() => void handleSave(true)}
						title="Prueba el escenario FE-07 de edición concurrente por otro administrador"
						type="button"
					>
						⚡ Simular conflicto concurrencia (409)
					</button>

					<button
						className="role-workspace__btn role-workspace__btn--secondary"
						onClick={handleCancel}
						type="button"
					>
						Cancelar
					</button>

					<button
						className="role-workspace__btn role-workspace__btn--primary"
						disabled={isSaving}
						onClick={() => void handleSave(false)}
						type="button"
					>
						{isSaving ? 'Guardando…' : 'Guardar cambios'}
					</button>
				</div>
			</header>

			{isVersionConflict ? (
				<div className="role-workspace__conflict-banner" role="alert">
					<div>
						<strong>Conflicto de concurrencia detectado (409):</strong>
						<p style={{ margin: '4px 0 0', fontSize: 13.5 }}>
							{saveError}
						</p>
					</div>
					<button
						className="role-workspace__btn role-workspace__btn--secondary"
						onClick={() => void loadRoleAndCatalog()}
						type="button"
					>
						Recargar información vigente
					</button>
				</div>
			) : saveError ? (
				<div className="role-workspace__conflict-banner" role="alert">
					<div>
						<strong>No fue posible guardar el rol:</strong>
						<p style={{ margin: '4px 0 0', fontSize: 13.5 }}>{saveError}</p>
					</div>
				</div>
			) : null}

			<div className="role-workspace__steps" role="tablist" aria-label="Pasos de edición del rol">
				<button
					aria-selected={activeStep === 1}
					className={`role-workspace__step-tab ${
						activeStep === 1 ? 'role-workspace__step-tab--active' : ''
					}`}
					onClick={() => setActiveStep(1)}
					role="tab"
					type="button"
				>
					<span className="role-workspace__step-num">1</span>
					<span>Datos del rol y Matriz de Permisos</span>
				</button>

				<button
					aria-selected={activeStep === 2}
					className={`role-workspace__step-tab ${
						activeStep === 2 ? 'role-workspace__step-tab--active' : ''
					}`}
					onClick={() => setActiveStep(2)}
					role="tab"
					type="button"
				>
					<span className="role-workspace__step-num">2</span>
					<span>Asignación de Roles (Regla de Condición)</span>
				</button>
			</div>

			<div className="role-workspace__grid">
				<div className="role-workspace__main">
					{activeStep === 1 ? (
						<>
							<section className="role-workspace__card">
								<h2 className="role-workspace__card-title">Datos del rol</h2>
								<p className="role-workspace__card-subtitle">
									El identificador del rol no es editable para preservar la
									trazabilidad en auditoría.
								</p>

								<div className="role-workspace__fields-grid">
									<div className="role-workspace__field">
										<label
											className="role-workspace__label"
											htmlFor="edit-role-code"
										>
											ID Rol
										</label>
										<input
											className="role-workspace__input"
											disabled
											id="edit-role-code"
											readOnly
											type="text"
											value={role.code}
										/>
									</div>

									<div className="role-workspace__field">
										<label
											className="role-workspace__label"
											htmlFor="edit-role-name"
										>
											Nombre del rol *
										</label>
										<input
											className="role-workspace__input"
											id="edit-role-name"
											onChange={(e) => {
												markDirty();
												setName(e.target.value);
											}}
											placeholder="Ej. Administrador de estructuras"
											type="text"
											value={name}
										/>
									</div>

									<div className="role-workspace__field role-workspace__field--full">
										<label
											className="role-workspace__label"
											htmlFor="edit-role-description"
										>
											Descripción
										</label>
										<textarea
											className="role-workspace__textarea"
											id="edit-role-description"
											onChange={(e) => {
												markDirty();
												setDescription(e.target.value);
											}}
											placeholder="Describe las responsabilidades y alcance del rol…"
											value={description}
										/>
									</div>
								</div>
							</section>

							<section className="role-workspace__card">
								<h2 className="role-workspace__card-title">
									Matriz de Permisos y Acceso a Módulos
								</h2>
								<p className="role-workspace__card-subtitle">
									Filtra por dominio funcional y configura los permisos de Ver,
									Editar, Eliminar, Descargar y su Alcance.
								</p>

								<div
									aria-label="Filtrar módulos de permisos"
									className="role-workspace__filter-tabs"
								>
									{FILTER_TABS.map((tab) => (
										<button
											className={`role-workspace__filter-pill ${
												activeFilter === tab.id
													? 'role-workspace__filter-pill--active'
													: ''
											}`}
											key={tab.id}
											onClick={() => setActiveFilter(tab.id)}
											type="button"
										>
											{tab.label}
										</button>
									))}
								</div>

								<div className="role-workspace__matrix-wrapper">
									<table className="role-workspace__matrix-table">
										<thead>
											<tr>
												<th scope="col">Módulo</th>
												<th className="role-workspace__matrix-center" scope="col">
													Ver
												</th>
												<th className="role-workspace__matrix-center" scope="col">
													Editar / Crear
												</th>
												<th className="role-workspace__matrix-center" scope="col">
													Eliminar / Baja
												</th>
												<th className="role-workspace__matrix-center" scope="col">
													Descargar
												</th>
												<th scope="col">Alcance</th>
											</tr>
										</thead>
										<tbody>
											{visibleModules.map((mod) => {
												const activePerms = mod.permissions.filter(
													(p) => p.status === 'ACTIVE' && p.assignable,
												);
												const viewCodes = activePerms
													.filter(
														(p) =>
															p.action === 'VIEW' || p.action === 'IMPACT_VIEW',
													)
													.map((p) => p.code);
												const editCodes = activePerms
													.filter((p) =>
														['CREATE', 'UPDATE', 'ASSIGN', 'MOVE'].includes(
															p.action,
														),
													)
													.map((p) => p.code);
												const deleteCodes = activePerms
													.filter((p) =>
														['DELETE', 'INACTIVATE', 'UNASSIGN'].includes(
															p.action,
														),
													)
													.map((p) => p.code);
												const downloadCodes = activePerms
													.filter((p) => p.action === 'DOWNLOAD')
													.map((p) => p.code);

												const currentScope =
													moduleScopes[mod.code] ?? 'Por Ubicación';

												return (
													<tr key={mod.code}>
														<td>
															<span className="role-workspace__module-name">
																{mod.displayName}
															</span>
															<span className="role-workspace__module-desc">
																{mod.description}
															</span>
															<div className="role-workspace__perm-chips">
																{activePerms.map((perm) => {
																	const isChecked = selectedCodes.includes(
																		perm.code,
																	);
																	return (
																		<label
																			className={`role-workspace__perm-chip ${
																				isChecked
																					? 'role-workspace__perm-chip--selected'
																					: ''
																			}`}
																			key={perm.code}
																		>
																			<input
																				checked={isChecked}
																				onChange={() =>
																					handleTogglePermission(perm.code)
																				}
																				type="checkbox"
																			/>
																			<span>{perm.displayName}</span>
																		</label>
																	);
																})}
															</div>
														</td>

														<td className="role-workspace__matrix-center">
															{viewCodes.length > 0 ? (
																<input
																	aria-label={`Ver ${mod.displayName}`}
																	checked={viewCodes.every((c) =>
																		selectedCodes.includes(c),
																	)}
																	onChange={() =>
																		handleToggleModuleActionGroup(viewCodes)
																	}
																	type="checkbox"
																/>
															) : (
																<span>—</span>
															)}
														</td>

														<td className="role-workspace__matrix-center">
															{editCodes.length > 0 ? (
																<input
																	aria-label={`Editar ${mod.displayName}`}
																	checked={editCodes.every((c) =>
																		selectedCodes.includes(c),
																	)}
																	onChange={() =>
																		handleToggleModuleActionGroup(editCodes)
																	}
																	type="checkbox"
																/>
															) : (
																<span>—</span>
															)}
														</td>

														<td className="role-workspace__matrix-center">
															{deleteCodes.length > 0 ? (
																<input
																	aria-label={`Eliminar ${mod.displayName}`}
																	checked={deleteCodes.every((c) =>
																		selectedCodes.includes(c),
																	)}
																	onChange={() =>
																		handleToggleModuleActionGroup(deleteCodes)
																	}
																	type="checkbox"
																/>
															) : (
																<span>—</span>
															)}
														</td>

														<td className="role-workspace__matrix-center">
															{downloadCodes.length > 0 ? (
																<input
																	aria-label={`Descargar ${mod.displayName}`}
																	checked={downloadCodes.every((c) =>
																		selectedCodes.includes(c),
																	)}
																	onChange={() =>
																		handleToggleModuleActionGroup(downloadCodes)
																	}
																	type="checkbox"
																/>
															) : (
																<span>—</span>
															)}
														</td>

														<td>
															<select
																aria-label={`Alcance ${mod.displayName}`}
																className="role-workspace__select"
																onChange={(e) =>
																	handleScopeChange(
																		mod.code,
																		e.target.value as ModuleScopeLevel,
																	)
																}
																value={currentScope}
															>
																{SCOPE_OPTIONS.map((opt) => (
																	<option key={opt} value={opt}>
																		{opt}
																	</option>
																))}
															</select>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>

								<div className="role-workspace__footer-actions">
									<button
										className="role-workspace__btn role-workspace__btn--secondary"
										onClick={handleCancel}
										type="button"
									>
										Cancelar
									</button>
									<button
										className="role-workspace__btn role-workspace__btn--primary"
										onClick={() => setActiveStep(2)}
										type="button"
									>
										Siguiente: Asignación de Roles →
									</button>
								</div>
							</section>
						</>
					) : (
						<section className="role-workspace__card">
							<h2 className="role-workspace__card-title">
								Asignación de Roles — Reglas de Condición
							</h2>
							<p className="role-workspace__card-subtitle">
								Configura las condiciones organizacionales (Puesto, Ubicación,
								Negocio o Zona) que asignan este rol automáticamente.
							</p>

							<div className="role-workspace__conditions-list">
								{conditions.map((cond, index) => (
									<div className="role-workspace__condition-row" key={cond.id}>
										<select
											aria-label={`Campo de condición ${index + 1}`}
											className="role-workspace__select"
											onChange={(e) =>
												handleUpdateCondition(cond.id, {
													field: e.target.value as RoleConditionField,
												})
											}
											value={cond.field}
										>
											{CONDITION_FIELDS.map((field) => (
												<option key={field} value={field}>
													{field}
												</option>
											))}
										</select>

										<select
											aria-label={`Operador de condición ${index + 1}`}
											className="role-workspace__select"
											onChange={(e) =>
												handleUpdateCondition(cond.id, {
													operator: e.target.value as '=' | 'IN',
												})
											}
											value={cond.operator}
										>
											<option value="=">= (Igual a)</option>
											<option value="IN">IN (Incluye)</option>
										</select>

										<input
											aria-label={`Valor de condición ${index + 1}`}
											className="role-workspace__input"
											list={`condition-suggestions-${cond.id}`}
											onChange={(e) =>
												handleUpdateCondition(cond.id, {
													value: e.target.value,
												})
											}
											placeholder="Selecciona o escribe un valor…"
											type="text"
											value={cond.value}
										/>
										<datalist id={`condition-suggestions-${cond.id}`}>
											{(SUGGESTED_VALUES_BY_FIELD[cond.field] ?? []).map(
												(suggestion) => (
													<option key={suggestion} value={suggestion} />
												),
											)}
										</datalist>

										<button
											className="role-workspace__btn role-workspace__btn--danger"
											onClick={() => handleRemoveCondition(cond.id)}
											type="button"
										>
											Quitar
										</button>
									</div>
								))}
							</div>

							<button
								className="role-workspace__btn role-workspace__btn--secondary"
								onClick={handleAddCondition}
								type="button"
							>
								+ Añadir condición
							</button>

							<div className="role-workspace__resulting-rule">
								<p className="role-workspace__resulting-rule-title">
									Regla Resultante
								</p>
								<p className="role-workspace__resulting-rule-code">
									{resultingRule}
								</p>
							</div>

							<div className="role-workspace__footer-actions">
								<button
									className="role-workspace__btn role-workspace__btn--secondary"
									onClick={() => setActiveStep(1)}
									type="button"
								>
									← Anterior: Matriz de Permisos
								</button>

								<button
									className="role-workspace__btn role-workspace__btn--primary"
									disabled={isSaving}
									onClick={() => void handleSave(false)}
									type="button"
								>
									{isSaving ? 'Guardando…' : 'Guardar'}
								</button>
							</div>
						</section>
					)}
				</div>

				<aside className="role-workspace__sidebar">
					<section className="role-workspace__card">
						<h2 className="role-workspace__card-title">Resumen del Rol</h2>
						<p className="role-workspace__card-subtitle">
							Vista previa en tiempo real de los cambios a guardar.
						</p>

						<ul className="role-workspace__summary-list">
							<li className="role-workspace__summary-item">
								<span className="role-workspace__summary-label">ID Rol</span>
								<span className="role-workspace__summary-value">{role.code}</span>
							</li>
							<li className="role-workspace__summary-item">
								<span className="role-workspace__summary-label">Nombre</span>
								<span className="role-workspace__summary-value">
									{name.trim() || 'Sin nombre'}
								</span>
							</li>
							<li className="role-workspace__summary-item">
								<span className="role-workspace__summary-label">
									Permisos seleccionados
								</span>
								<span className="role-workspace__summary-value">
									{selectedCodes.length} permisos activos
								</span>
							</li>
							<li className="role-workspace__summary-item">
								<span className="role-workspace__summary-label">
									Regla Resultante
								</span>
								<span className="role-workspace__summary-value">
									{resultingRule}
								</span>
							</li>
							<li className="role-workspace__summary-item">
								<span className="role-workspace__summary-label">
									Estado de cambios
								</span>
								<span className="role-workspace__summary-value">
									{isDirty ? 'Pendiente de guardar' : 'Sin cambios pendientes'}
								</span>
							</li>
						</ul>
					</section>
				</aside>
			</div>
		</main>
	);
}