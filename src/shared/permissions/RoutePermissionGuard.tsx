import { useEffect, type ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import {
	recordSecurityAudit,
	useSession,
} from '../auth';
import { ForbiddenState } from '../feedback/ForbiddenState';
import { hasPermission } from './has-permission';
import type { Permission } from './permission.types';

interface RoutePermissionGuardProps {
	children: ReactNode;
	requiredPermission?: Permission;
	anyOfPermissions?: readonly Permission[];
	moduleLabel?: string;
}

export function RoutePermissionGuard({
	children,
	requiredPermission,
	anyOfPermissions,
	moduleLabel,
}: RoutePermissionGuardProps) {
	const session = useSession();
	const location = useLocation();

	const granted = session?.grantedPermissions ?? [];

	const isAuthorized = (() => {
		if (!session) {
			return false;
		}
		if (anyOfPermissions && anyOfPermissions.length > 0) {
			return anyOfPermissions.some((permission) =>
				hasPermission(permission, granted),
			);
		}
		return hasPermission(requiredPermission, granted);
	})();

	useEffect(() => {
		if (session && !isAuthorized) {
			recordSecurityAudit({
				userId: session.user.userId,
				userName: session.user.fullName,
				role: session.user.primaryRoleName,
				scope: session.user.scopeLabel,
				action: 'ACCESO_DENEGADO_RUTA',
				entity: moduleLabel ?? location.pathname,
				result: 'DENEGADO',
				detail: `Intento de acceso a ruta no autorizada (${location.pathname}).`,
			});
		}
	}, [isAuthorized, location.pathname, moduleLabel, session]);

	if (!session) {
		return <Navigate replace state={{ from: location.pathname }} to="/login" />;
	}

	if (!isAuthorized) {
		return (
			<section
				aria-label="Acceso restringido"
				style={{
					maxWidth: '560px',
					margin: '48px auto',
					padding: '32px',
					backgroundColor: '#ffffff',
					border: '1px solid #e5e0ec',
					borderRadius: '16px',
					boxShadow: '0 8px 24px rgba(36, 22, 54, 0.06)',
					textAlign: 'center',
				}}
			>
				<ForbiddenState message="No cuenta con permisos para acceder a este módulo." />
				<p style={{ color: '#5c5667', fontSize: '14px', marginTop: '12px' }}>
					Tu perfil activo (<strong>{session.user.primaryRoleName}</strong>) no incluye
					los privilegios requeridos para consultar {moduleLabel ?? 'esta sección'}.
					El intento ha sido registrado en la bitácora de trazabilidad.
				</p>
				<div style={{ marginTop: '20px' }}>
					<Link
						to="/"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '10px 22px',
							backgroundColor: '#623d94',
							color: '#ffffff',
							borderRadius: '8px',
							fontWeight: 600,
							fontSize: '14px',
						}}
					>
						Volver al Inicio
					</Link>
				</div>
			</section>
		);
	}

	return <>{children}</>;
}
