import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SHOW_DEMO_CONTROLS } from '../../../app/config/demo';
import { APP_ROUTES } from '../../../app/config/routes';
import { httpPost } from '../../../shared/api';
import {
	createSessionFromProfile,
	recordSecurityAudit,
	saveStoredSession,
	type SsoScenarioId,
} from '../../../shared/auth';

import '../styles/authentication.css';

const ERROR_MESSAGES: Partial<Record<SsoScenarioId, string>> = {
	error_identidad: 'No fue posible validar su identidad corporativa.',
	error_sin_rol: 'Su cuenta no cuenta con permisos para acceder al sistema.',
	error_cuenta_inactiva:
		'La cuenta no se encuentra habilitada para utilizar el sistema.',
	error_sso_no_disponible:
		'El servicio de autenticación no está disponible temporalmente.',
	error_autorizacion:
		'No fue posible obtener la información de autorización.',
};

interface SsoCallbackResponse {
	ok: boolean;
	sessionId: string;
	status: string;
	expiresAt: string;
	idleTimeoutMs: number;
	user: {
		id: string;
		oid?: string;
		tid?: string;
		name: string;
		email: string;
		roles: string[];
		permissions: string[];
		authorizedGroups?: string[];
		scopes?: string[];
	};
}

function generateDevSsoJwt(email: string, name: string, oid: string): string {
	const now = Math.floor(Date.now() / 1000);
	const header = { alg: 'none', typ: 'JWT' };
	const payload = {
		aud: 'dev-api-client',
		iss: 'https://login.microsoftonline.com/dev-tenant/v2.0',
		tid: 'dev-tenant',
		oid: oid || '44fc25bd-d556-56da-926e-27dc3ea0eacc',
		name: name || 'Administrador Técnico Demo',
		preferred_username: email || 'admin.demo@zdeptos.local',
		email: email || 'admin.demo@zdeptos.local',
		scp: 'access_as_user',
		groups: ['USR IDM ZDEPTO TI'],
		roles: ['ROL-001'],
		exp: now + 3600,
		iat: now,
	};
	const b64 = (obj: unknown) => {
		try {
			const str = typeof window !== 'undefined' && typeof window.btoa === 'function'
				? window.btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
				: Buffer.from(JSON.stringify(obj)).toString('base64');
			return str.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
		} catch {
			return 'simulated-token';
		}
	};
	return `${b64(header)}.${b64(payload)}.signature`;
}

export function LoginPage() {
	const navigate = useNavigate();
	const [scenario, setScenario] = useState<SsoScenarioId>('admin_plataforma');
	const [isAuthenticating, setIsAuthenticating] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	async function handleSsoLogin(): Promise<void> {
		if (isAuthenticating) {
			return;
		}

		setErrorMessage(null);
		setIsAuthenticating(true);

		const errorText = ERROR_MESSAGES[scenario];

		if (errorText) {
			recordSecurityAudit({
				userId: scenario,
				userName: 'Intento SSO corporativo',
				role: 'SIN_SESION',
				scope: 'N/A',
				action: 'LOGIN_SSO_FALLIDO',
				entity: 'IDP_CORPORATIVO',
				result: 'DENEGADO',
				detail: errorText,
			});
			setErrorMessage(errorText);
			setIsAuthenticating(false);
			return;
		}

		const profileKey = scenario as
			| 'admin_plataforma'
			| 'gestor_ubicacion'
			| 'usuario_reportes'
			| 'excepcion_activa';

		const newSession = createSessionFromProfile(profileKey);

		// Conectar con el backend en vivo (POST /api/v1/auth/sso/callback)
		const devToken = generateDevSsoJwt(
			newSession.user.email,
			newSession.user.fullName,
			newSession.user.userId,
		);

		try {
			const ssoResponse = await httpPost<SsoCallbackResponse>('/auth/sso/callback', {
				accessToken: devToken,
				sessionId: `session-${Date.now()}`,
			});

			if (ssoResponse && ssoResponse.ok && ssoResponse.sessionId) {
				newSession.sessionId = ssoResponse.sessionId;
				newSession.accessToken = devToken;
				if (ssoResponse.user) {
					newSession.user.userId = ssoResponse.user.id;
					newSession.user.fullName = ssoResponse.user.name;
					newSession.user.email = ssoResponse.user.email;
					if (ssoResponse.user.roles && ssoResponse.user.roles.length > 0) {
						newSession.user.activeRoleCodes = ssoResponse.user.roles;
					}
					if (ssoResponse.user.permissions && ssoResponse.user.permissions.length > 0) {
						newSession.grantedPermissions = ssoResponse.user.permissions;
					}
				}
			}
		} catch {
			// En caso de modo offline o pruebas unitarias, se mantiene la sesión simulada
		}

		saveStoredSession(newSession);

		void httpPost('/auth/session/keep-alive', {
			eventType: 'USER_ACTIVITY',
		}).catch(() => {
			// Non-blocking
		});

		recordSecurityAudit({
			userId: newSession.user.userId,
			userName: newSession.user.fullName,
			role: newSession.user.primaryRoleName,
			scope: newSession.user.scopeLabel,
			action: 'LOGIN_SSO_EXITOSO',
			entity: 'IDP_CORPORATIVO',
			result: 'EXITOSO',
			detail: `Autenticación exitosa mediante SSO corporativo (${newSession.user.activeRoleCodes.join(', ')}).`,
		});

		setIsAuthenticating(false);
		navigate(APP_ROUTES.home, { replace: true });
	}

	return (
		<main className="sso-login" aria-labelledby="sso-welcome-title">
			<section className="sso-login__hero" aria-label="Identidad de la solución">
				<p className="sso-login__brand">Liverpool</p>

				<div className="sso-login__hero-body">
					<h1 className="sso-login__hero-title">
						Gestión de Estructuras Comerciales
					</h1>
					<p className="sso-login__hero-subtitle">
						Una vista clara. Decisiones seguras.
					</p>
				</div>

				<div aria-hidden="true" />
			</section>

			<section className="sso-login__panel">
				<div className="sso-login__card">
					<div>
						<h2 className="sso-login__title" id="sso-welcome-title">
							Bienvenido
						</h2>
						<p className="sso-login__subtitle">
							Accede con tu cuenta institucional.
						</p>

						<button
							className="sso-login__submit"
							disabled={isAuthenticating}
							onClick={handleSsoLogin}
							type="button"
						>
							{isAuthenticating
								? 'Validando identidad institucional...'
								: 'Ingresar con SSO corporativo'}
						</button>

						<p className="sso-login__helper">
							No necesitas crear una cuenta nueva.
						</p>

						{errorMessage ? (
							<div
								aria-live="assertive"
								className="sso-login__alert"
								role="alert"
							>
								{errorMessage}
							</div>
						) : null}

						{SHOW_DEMO_CONTROLS && <div className="sso-login__simulator">
							<label
								className="sso-login__simulator-label"
								htmlFor="sso-scenario-select"
							>
								Perfil / Escenario de validación SSO (CU-SEC-001 / CU-HOM-002)
							</label>
							<select
								className="sso-login__simulator-select"
								id="sso-scenario-select"
								onChange={(event) => {
									setScenario(event.target.value as SsoScenarioId);
									setErrorMessage(null);
								}}
								value={scenario}
							>
								<optgroup label="Accesos Exitosos por Rol">
									<option value="admin_plataforma">
										Arturo Ocampo — Administrador de seguridad (Todos los módulos)
									</option>
									<option value="gestor_ubicacion">
										Alejandra Ramírez — Gestor ubicación (Estructuras + Reportes)
									</option>
									<option value="usuario_reportes">
										Carlos Ruiz — Consulta (Solo módulo Reportes)
									</option>
									<option value="excepcion_activa">
										Andrea Torres — Rol por Excepción vigente (FA-02 / FA-03)
									</option>
								</optgroup>
								<optgroup label="Flujos Excepcionales (FE-01 a FE-06)">
									<option value="error_identidad">
										FE-01: Identidad corporativa inválida
									</option>
									<option value="error_sin_rol">
										FE-02: Usuario autenticado sin rol asignado
									</option>
									<option value="error_cuenta_inactiva">
										FE-03: Usuario inactivo o bloqueado
									</option>
									<option value="error_sso_no_disponible">
										FE-04: Falla de comunicación con proveedor SSO
									</option>
									<option value="error_autorizacion">
										FE-06: Error al recuperar roles y permisos
									</option>
								</optgroup>
							</select>
							<p className="sso-login__simulator-hint">
								Selecciona un perfil para verificar permisos dinámicos, alcance y
								mensajes controlados.
							</p>
						</div>}
					</div>

					<div className="sso-login__footer">
						<span className="sso-login__secure-badge" role="status">
							Conexión segura
						</span>
					</div>
				</div>
			</section>
		</main>
	);
}
