import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
	APP_ROUTES,
	structureDepartmentGroupsPath,
} from '../../../app/config/routes';
import { SECURITY_PERMISSION_CODES } from '../../access-management/model/permission.model';
import { httpGet } from '../../../shared/api';
import { useSession } from '../../../shared/auth';
import { hasPermission } from '../../../shared/permissions';

import '../styles/home.css';

export type GlobalEntityType =
	| 'Departamento'
	| 'Colaborador'
	| 'Grupo'
	| 'Sección';

export interface GlobalSearchEntity {
	id: string;
	code: string;
	type: GlobalEntityType;
	name: string;
	routeLabel: string;
	location: string;
	department: string;
	departmentRouteId: string;
	positionTitle?: string;
}

const GLOBAL_CATALOG: readonly GlobalSearchEntity[] = [
	{
		id: 'dep-linea-blanca',
		code: 'DCO-1042',
		type: 'Departamento',
		name: 'Línea Blanca',
		routeLabel: 'Zona 2 / Atizapán',
		location: 'Liverpool Atizapán',
		department: 'Línea Blanca',
		departmentRouteId: 'dep-1',
	},
	{
		id: 'col-andrea-torres',
		code: 'EMP-412098',
		type: 'Colaborador',
		name: 'Andrea Torres',
		routeLabel: 'Atizapán / Grupo 001',
		location: 'Liverpool Atizapán',
		department: 'Línea Blanca',
		departmentRouteId: 'dep-1',
		positionTitle: 'Asesor Especialista Comercial',
	},
	{
		id: 'grp-001',
		code: 'GRP-001',
		type: 'Grupo',
		name: 'Grupo 001',
		routeLabel: 'Línea Blanca',
		location: 'Liverpool Atizapán',
		department: 'Línea Blanca',
		departmentRouteId: 'dep-1',
	},
	{
		id: 'dep-damas',
		code: 'DCO-1050',
		type: 'Departamento',
		name: 'Damas',
		routeLabel: 'Zona 2 / Atizapán',
		location: 'Liverpool Atizapán',
		department: 'Damas',
		departmentRouteId: 'dep-2',
	},
	{
		id: 'dep-caballeros',
		code: 'DCO-1064',
		type: 'Departamento',
		name: 'Caballeros',
		routeLabel: 'Zona Centro / Polanco',
		location: 'Liverpool Polanco',
		department: 'Caballeros',
		departmentRouteId: 'dep-3',
	},
	{
		id: 'dep-belleza',
		code: 'DCO-1088',
		type: 'Departamento',
		name: 'Belleza',
		routeLabel: 'Zona Centro / Insurgentes',
		location: 'Liverpool Insurgentes',
		department: 'Belleza',
		departmentRouteId: 'dep-1',
	},
	{
		id: 'col-jazmin-cruz',
		code: 'EMP-102330',
		type: 'Colaborador',
		name: 'Jazmín Cruz',
		routeLabel: 'Atizapán / Departamento Línea Blanca',
		location: 'Liverpool Atizapán',
		department: 'Línea Blanca',
		departmentRouteId: 'dep-1',
		positionTitle: 'Jefe de Departamento Comercial',
	},
	{
		id: 'col-ana-torres',
		code: 'EMP-100890',
		type: 'Colaborador',
		name: 'Ana Torres',
		routeLabel: 'Atizapán / Gerencia Comercial Hardline',
		location: 'Liverpool Atizapán',
		department: 'Línea Blanca',
		departmentRouteId: 'dep-1',
		positionTitle: 'Gerente Comercial',
	},
	{
		id: 'col-juan-perez',
		code: 'EMP-209114',
		type: 'Colaborador',
		name: 'Juan Pérez',
		routeLabel: 'Polanco / Grupo 1 - Caballeros',
		location: 'Liverpool Polanco',
		department: 'Caballeros',
		departmentRouteId: 'dep-3',
		positionTitle: 'Responsable de Grupo',
	},
	{
		id: 'grp-caballeros',
		code: 'GRP-010',
		type: 'Grupo',
		name: 'Grupo 1 - Caballeros',
		routeLabel: 'Caballeros / Ropa y accesorios',
		location: 'Liverpool Atizapán',
		department: 'Caballeros',
		departmentRouteId: 'dep-3',
	},
	{
		id: 'grp-damas',
		code: 'GRP-020',
		type: 'Grupo',
		name: 'Grupo 2 - Damas',
		routeLabel: 'Damas / Moda y accesorios',
		location: 'Liverpool Atizapán',
		department: 'Damas',
		departmentRouteId: 'dep-2',
	},
	{
		id: 'sec-relojeria',
		code: 'SEC-010',
		type: 'Sección',
		name: 'SEC-010 Relojería',
		routeLabel: 'Atizapán / Línea Blanca / Grupo 001',
		location: 'Liverpool Atizapán',
		department: 'Línea Blanca',
		departmentRouteId: 'dep-1',
	},
	{
		id: 'sec-calzado-damas',
		code: 'SEC-025',
		type: 'Sección',
		name: 'SEC-025 Calzado Damas',
		routeLabel: 'Atizapán / Damas / Grupo 003',
		location: 'Liverpool Atizapán',
		department: 'Damas',
		departmentRouteId: 'dep-2',
	},
];

const INVALID_CRITERIA_PATTERN = /[<>$;{}]/;

export function GlobalSearchPage() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const session = useSession();

	const initialQuery = searchParams.get('q') ?? '';
	const [query, setQuery] = useState(initialQuery);
	const [typeFilter, setTypeFilter] = useState<'ALL' | GlobalEntityType>('ALL');
	const [locationFilter, setLocationFilter] = useState<string>('ALL');

	const authorizedLocations = session?.user.authorizedLocations ?? [];
	const authorizedDepartments = session?.user.authorizedDepartments ?? [];
	const grantedPermissions = session?.grantedPermissions ?? [];

	const canAccessReports =
		hasPermission(SECURITY_PERMISSION_CODES.REPORT_ROLE_VIEW, grantedPermissions) ||
		hasPermission(
			SECURITY_PERMISSION_CODES.REPORT_GENERAL_VIEW,
			grantedPermissions,
		);

	const hasInvalidCriteria = INVALID_CRITERIA_PATTERN.test(query);

	const [backendEntities, setBackendEntities] = useState<GlobalSearchEntity[]>(
		[],
	);

	useEffect(() => {
		const q = query.trim();
		if (!q || hasInvalidCriteria) {
			setBackendEntities([]);
			return;
		}
		let cancelled = false;
		httpGet<{
			departments?: Array<{
				id: string;
				code: string;
				name: string;
				locationName?: string;
			}>;
			employees?: Array<{
				employeeId: string;
				name: string;
				positionTitle?: string;
				locationName?: string;
				departmentName?: string;
			}>;
			sections?: Array<{
				id: string;
				code: string;
				name: string;
				departmentName?: string;
				locationName?: string;
			}>;
		}>('/search', { q })
			.then((res) => {
				if (cancelled) return;
				const mapped: GlobalSearchEntity[] = [];
				if (res.departments) {
					for (const d of res.departments) {
						mapped.push({
							id: d.id,
							code: d.code,
							type: 'Departamento',
							name: d.name,
							routeLabel: d.locationName
								? `Tienda / ${d.locationName}`
								: 'Departamento Comercial',
							location: d.locationName || 'Liverpool Insurgentes',
							department: d.name,
							departmentRouteId: d.id,
						});
					}
				}
				if (res.employees) {
					for (const e of res.employees) {
						mapped.push({
							id: e.employeeId,
							code: e.employeeId,
							type: 'Colaborador',
							name: e.name,
							routeLabel: `${e.locationName ?? 'Tienda'} / ${e.departmentName ?? 'Departamento'}`,
							location: e.locationName || 'Liverpool Insurgentes',
							department: e.departmentName || 'Comercial',
							departmentRouteId: '7882a45f-8ad2-5009-8d9e-5f6f81671fc8',
							positionTitle: e.positionTitle,
						});
					}
				}
				if (res.sections) {
					for (const s of res.sections) {
						mapped.push({
							id: s.id,
							code: s.code,
							type: 'Sección',
							name: s.name,
							routeLabel: `${s.locationName ?? 'Tienda'} / ${s.departmentName ?? 'Departamento'}`,
							location: s.locationName || 'Liverpool Insurgentes',
							department: s.departmentName || 'Comercial',
							departmentRouteId: '7882a45f-8ad2-5009-8d9e-5f6f81671fc8',
						});
					}
				}
				setBackendEntities(mapped);
			})
			.catch(() => {
				// Non-blocking in offline or unit test mode
			});
		return () => {
			cancelled = true;
		};
	}, [hasInvalidCriteria, query]);

	const scopedCatalog = useMemo(() => {
		const local = GLOBAL_CATALOG.filter(
			(item) =>
				authorizedLocations.includes(item.location) &&
				authorizedDepartments.includes(item.department),
		);
		const seenCodes = new Set(local.map((l) => l.code.toLowerCase()));
		const uniqueBackend = backendEntities.filter(
			(b) => !seenCodes.has(b.code.toLowerCase()),
		);
		return [...local, ...uniqueBackend];
	}, [authorizedDepartments, authorizedLocations, backendEntities]);

	const results = useMemo(() => {
		if (hasInvalidCriteria) {
			return [];
		}

		const normalized = query.trim().toLowerCase();

		return scopedCatalog.filter((item) => {
			if (typeFilter !== 'ALL' && item.type !== typeFilter) {
				return false;
			}
			if (locationFilter !== 'ALL' && item.location !== locationFilter) {
				return false;
			}
			if (!normalized) {
				return true;
			}
			const haystack = `${item.name} ${item.code} ${item.type} ${item.routeLabel} ${item.location} ${item.department}`.toLowerCase();
			return haystack.includes(normalized);
		});
	}, [hasInvalidCriteria, locationFilter, query, scopedCatalog, typeFilter]);

	const exactCollaboratorMatch = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		if (!normalized || hasInvalidCriteria) {
			return null;
		}
		const matches = results.filter(
			(item) =>
				item.type === 'Colaborador' &&
				(item.code.toLowerCase() === normalized ||
					item.name.toLowerCase() === normalized),
		);
		return matches.length === 1 ? matches[0] : null;
	}, [hasInvalidCriteria, query, results]);

	function handleQueryChange(nextValue: string): void {
		setQuery(nextValue);
		if (nextValue.trim()) {
			setSearchParams({ q: nextValue }, { replace: true });
		} else {
			setSearchParams({}, { replace: true });
		}
	}

	return (
		<section
			aria-labelledby="global-search-heading"
			className="global-search-page"
		>
			<p className="global-search-page__breadcrumb">Inicio / Búsqueda Global</p>

			<h1 className="global-search-page__title" id="global-search-heading">
				Búsqueda global
			</h1>

			<div className="global-search-page__form">
				<label
					className="global-search-page__label"
					htmlFor="global-search-input"
				>
					Buscar en tu alcance
				</label>

				<div className="global-search-page__controls">
					<input
						aria-label="Buscar en tu alcance"
						className="global-search-page__input"
						id="global-search-input"
						onChange={(event) => handleQueryChange(event.target.value)}
						placeholder="Departamento, colaborador o ID"
						type="search"
						value={query}
					/>

					<select
						aria-label="Filtrar por tipo de entidad"
						className="global-search-page__select"
						onChange={(event) =>
							setTypeFilter(event.target.value as 'ALL' | GlobalEntityType)
						}
						value={typeFilter}
					>
						<option value="ALL">Todos los tipos</option>
						<option value="Departamento">Departamento</option>
						<option value="Colaborador">Colaborador</option>
						<option value="Grupo">Grupo</option>
						<option value="Sección">Sección</option>
					</select>

					<select
						aria-label="Filtrar por ubicación autorizada"
						className="global-search-page__select"
						onChange={(event) => setLocationFilter(event.target.value)}
						value={locationFilter}
					>
						<option value="ALL">Todas las ubicaciones en mi alcance</option>
						{authorizedLocations.map((loc) => (
							<option key={loc} value={loc}>
								{loc}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="global-search-page__card">
				<h2 className="global-search-page__card-title">Resultados</h2>

				{hasInvalidCriteria ? (
					<div
						aria-live="assertive"
						role="alert"
						style={{
							padding: '14px 18px',
							backgroundColor: '#fef2f2',
							border: '1px solid #fecaca',
							borderRadius: '8px',
							color: '#991b1b',
							fontSize: '14px',
						}}
					>
						Verifique los criterios ingresados.
					</div>
				) : null}

				{exactCollaboratorMatch ? (
					<div
						aria-label="Ficha de coincidencia exacta de colaborador"
						className="global-search-page__exact-card"
					>
						<div>
							<span
								style={{
									fontSize: '11px',
									fontWeight: 700,
									textTransform: 'uppercase',
									color: '#5b3b8c',
								}}
							>
								Ficha directa de colaborador (FA-01)
							</span>
							<h3 style={{ margin: '4px 0', fontSize: '18px' }}>
								{exactCollaboratorMatch.name} ({exactCollaboratorMatch.code})
							</h3>
							<p style={{ margin: 0, fontSize: '13px', color: '#4b4554' }}>
								{exactCollaboratorMatch.positionTitle} ·{' '}
								{exactCollaboratorMatch.routeLabel}
							</p>
						</div>
						<button
							className="global-search-table__link"
							onClick={() =>
								navigate(
									structureDepartmentGroupsPath(
										exactCollaboratorMatch.departmentRouteId,
									),
								)
							}
							type="button"
						>
							Ir a su grupo
						</button>
					</div>
				) : null}

				{!hasInvalidCriteria && results.length === 0 ? (
					<p
						role="status"
						style={{
							margin: '8px 0 0',
							color: '#5c5566',
							fontSize: '14px',
						}}
					>
						No se encontraron resultados para los criterios ingresados.
					</p>
				) : null}

				{!hasInvalidCriteria && results.length > 0 ? (
					<div className="global-search-page__table-wrapper">
						<table className="global-search-table">
							<thead>
								<tr>
									<th scope="col">Tipo</th>
									<th scope="col">Nombre</th>
									<th scope="col">Ruta</th>
									<th scope="col">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{results.map((entity) => (
									<tr key={entity.id}>
										<td data-label="Tipo">{entity.type}</td>
										<td data-label="Nombre">
											<div>
												<strong>{entity.name}</strong>{' '}
												<span style={{ color: '#6b6476', fontSize: '12px' }}>
													({entity.code})
												</span>
											</div>
										</td>
										<td data-label="Ruta">{entity.routeLabel}</td>
										<td data-label="Acciones">
											<div className="global-search-table__actions">
												<button
													className="global-search-table__link"
													onClick={() =>
														navigate(
															structureDepartmentGroupsPath(
																entity.departmentRouteId,
															),
														)
													}
													type="button"
												>
													Ver estructura
												</button>
												{canAccessReports ? (
													<button
														className="global-search-table__link"
														onClick={() => navigate(APP_ROUTES.reports)}
														type="button"
													>
														Reportes
													</button>
												) : null}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : null}
			</div>
		</section>
	);
}
