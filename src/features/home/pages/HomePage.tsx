import { StructureIcon, RolesIcon, ReportsIcon } from '../../../shared/components/AppIcons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SHOW_DEMO_CONTROLS } from '../../../app/config/demo';
import { APP_ROUTES } from '../../../app/config/routes';
import { SECURITY_PERMISSION_CODES } from '../../access-management/model/permission.model';
import { httpGet } from '../../../shared/api';
import {
	createSessionFromProfile,
	saveStoredSession,
	useSession,
} from '../../../shared/auth';
import { hasPermission } from '../../../shared/permissions';

import '../styles/home.css';

interface HomeModuleDefinition {
	id: string;
	title: string;
	subtitle: string;
	path: string;
	featured?: boolean;
	tealIcon?: boolean;
	anyOfPermissions: readonly string[];
}

const HOME_MODULES: readonly HomeModuleDefinition[] = [
	{
		id: 'structures',
		title: 'Gestión de Estructuras',
		subtitle: 'Zona → Sección',
		path: APP_ROUTES.structures,
		featured: true,
		anyOfPermissions: [
			SECURITY_PERMISSION_CODES.STRUCTURE_VIEW,
			SECURITY_PERMISSION_CODES.GROUP_VIEW,
		],
	},
	{
		id: 'roles',
		title: 'Roles y permisos',
		subtitle: 'Accesos y alcance',
		path: APP_ROUTES.roles,
		tealIcon: true,
		anyOfPermissions: [SECURITY_PERMISSION_CODES.ROLE_VIEW],
	},
	{
		id: 'reports',
		title: 'Reportes',
		subtitle: 'Histórico y operación',
		path: APP_ROUTES.reports,
		tealIcon: true,
		anyOfPermissions: [
			SECURITY_PERMISSION_CODES.REPORT_ROLE_VIEW,
			SECURITY_PERMISSION_CODES.REPORT_GENERAL_VIEW,
		],
	},
];

interface BackendUserProfile {
	userId: string;
	displayName: string;
	greeting: string;
	email: string;
	employeeNumber?: string;
	positionTitle?: string;
	activeRole?: string;
	effectiveScope?: {
		scopeSummary: string;
	};
}

export function HomePage() {
	const navigate = useNavigate();
	const session = useSession();
	const [backendProfile, setBackendProfile] = useState<BackendUserProfile | null>(null);

	const user = session?.user;
	const grantedPermissions = session?.grantedPermissions ?? [];

	useEffect(() => {
		void httpGet<BackendUserProfile>('/users/me/profile')
			.then((profile) => {
				if (profile && profile.userId) {
					setBackendProfile(profile);
				}
			})
			.catch(() => {
				// Fallback to local session profile when offline or in unit tests
			});
		void httpGet('/users/me/modules').catch(() => {
			// Fallback to local permission modules when offline or in unit tests
		});
	}, [user?.userId]);

	const visibleModules = HOME_MODULES.filter((moduleItem) =>
		moduleItem.anyOfPermissions.some((perm) =>
			hasPermission(perm, grantedPermissions),
		),
	);

	function handleQuickProfileSwitch(
		profileId:
			| 'admin_plataforma'
			| 'gestor_ubicacion'
			| 'usuario_reportes'
			| 'excepcion_activa',
	): void {
		saveStoredSession(createSessionFromProfile(profileId));
	}

	return (
		<section className="home-page" aria-labelledby="home-welcome-heading">
			<div className="home-page__meta">
				<p className="home-page__breadcrumb">Inicio</p>
				<p className="home-page__last-visit">
					Fecha de última visita: {user?.lastVisitLabel ?? '04/Sep/2026'}
				</p>
			</div>

			<h1 className="home-page__heading" id="home-welcome-heading">
				Bienvenida personalizada
			</h1>

			<h2 className="home-page__greeting">
				{backendProfile?.greeting ?? `Hola, ${user?.firstName ?? 'Arturo'}`}
			</h2>

			<p className="home-page__subtitle">
				Selecciona un módulo para comenzar.
			</p>

            {user && SHOW_DEMO_CONTROLS ? (
              <p className="home-page__context-bar" aria-label="Contexto de sesión activa">
                {user.fullName} · {user.primaryRoleName} · {user.location} · {user.scopeLabel}
                {user.exceptionSummary ? <span>{user.exceptionSummary}</span> : null}
              </p>
            ) : null}

			{visibleModules.length === 0 ? (
				<div
					role="alert"
					style={{
						padding: '24px',
						backgroundColor: '#fef2f2',
						border: '1px solid #fecaca',
						borderRadius: '12px',
						color: '#991b1b',
					}}
				>
					El rol asignado no tiene módulos configurados.
				</div>
			) : (
				<div
					aria-label="Módulos autorizados"
					className="home-page__modules-grid"
				>
					{visibleModules.map((moduleItem, index) => (
						<button
							className={`home-module-card ${
								index === 0 && moduleItem.featured
									? 'home-module-card--featured'
									: ''
							}`}
							key={moduleItem.id}
							onClick={() => navigate(moduleItem.path)}
							type="button"
						>
							<span
								aria-hidden="true"
								className={`home-module-card__icon ${
									moduleItem.tealIcon ? 'home-module-card__icon--teal' : ''
								}`}
							>
								{moduleItem.id === 'structures' ? <StructureIcon /> : moduleItem.id === 'roles' ? <RolesIcon /> : <ReportsIcon />}
							</span>

							<div>
								<h3 className="home-module-card__title">{moduleItem.title}</h3>
								<p className="home-module-card__desc">{moduleItem.subtitle}</p>
							</div>
						</button>
					))}
				</div>
			)}

            {SHOW_DEMO_CONTROLS && <aside
				aria-label="Selector de rol para validación funcional (CU-HOM-002)"
				className="home-page__role-switcher"
			>
				<div>
					<strong>Vista rápida por Rol (CU-HOM-001 / CU-HOM-002):</strong>{' '}
					Comprueba cómo cambian la identidad, el alcance y los módulos visibles:
				</div>
				<div className="home-page__role-buttons">
					<button
						className={`home-page__role-btn ${
							user?.userId === 'aocampo' ? 'home-page__role-btn--active' : ''
						}`}
						onClick={() => handleQuickProfileSwitch('admin_plataforma')}
						type="button"
					>
						Admin Seguridad (Todos)
					</button>
					<button
						className={`home-page__role-btn ${
							user?.userId === 'aramirez' ? 'home-page__role-btn--active' : ''
						}`}
						onClick={() => handleQuickProfileSwitch('gestor_ubicacion')}
						type="button"
					>
						Gestor Ubicación (Estructuras + Reportes)
					</button>
					<button
						className={`home-page__role-btn ${
							user?.userId === 'cruiz' ? 'home-page__role-btn--active' : ''
						}`}
						onClick={() => handleQuickProfileSwitch('usuario_reportes')}
						type="button"
					>
						Usuario Reportes (Solo Reportes)
					</button>
					<button
						className={`home-page__role-btn ${
							user?.userId === 'atorres' ? 'home-page__role-btn--active' : ''
						}`}
						onClick={() => handleQuickProfileSwitch('excepcion_activa')}
						type="button"
					>
						Excepción Activa (Andrea Torres)
					</button>
				</div>
			</aside>}
		</section>
	);
}