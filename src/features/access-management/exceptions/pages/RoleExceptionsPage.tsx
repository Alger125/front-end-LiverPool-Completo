import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '../../../../app/config/routes';
import { SuccessToast } from '../../../../shared/feedback/SuccessToast';
import { useRolesQuery } from '../../api/roles.queries';
import {
	listRoleExceptions,
} from '../../api/exceptions.api';
import type { RoleExceptionRecord } from '../../model/role-exception.model';
import { RevokeExceptionDialog } from '../components/RevokeExceptionDialog';
import { RoleExceptionForm } from '../components/RoleExceptionForm';
import { RoleExceptionList } from '../components/RoleExceptionList';

import '../../roles/pages/RoleListPage.css';
import '../../roles/pages/RoleDetailAndEdit.css';
import './RoleExceptionsPage.css';

export function RoleExceptionsPage() {
	const navigate = useNavigate();
	const rolesQuery = useRolesQuery({ page: 0, pageSize: 50, sort: 'name,asc' });

	const [exceptions, setExceptions] = useState<RoleExceptionRecord[]>(() =>
		listRoleExceptions(),
	);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [pendingRevoke, setPendingRevoke] =
		useState<RoleExceptionRecord | null>(null);

	function refreshExceptions(): void {
		setExceptions(listRoleExceptions());
	}

	const activeCount = exceptions.filter((e) => e.status === 'ACTIVE').length;

	return (
		<main className="role-workspace">
			{toastMessage ? (
				<SuccessToast
					message={toastMessage}
					onClose={() => setToastMessage(null)}
				/>
			) : null}

			<p className="role-workspace__breadcrumb">
				Inicio / Roles y Permisos / Catálogo de Roles y Permisos / Asignación por
				Excepción
			</p>

			<header className="role-workspace__header">
				<div className="role-workspace__title-group">
					<div className="role-workspace__badges">
						<span className="role-workspace__code-badge">CU-SEC-006</span>
						<span className="role-workspace__version-badge">
							{activeCount}{' '}
							{activeCount === 1
								? 'excepción vigente'
								: 'excepciones vigentes'}
						</span>
					</div>
					<h1 className="role-workspace__title">
						Asignación por excepción de Rol a Colaborador
					</h1>
					<p className="role-workspace__subtitle">
						Otorga o revoca de forma controlada, temporal y justificada un rol
						adicional a un colaborador específico cuando su puesto nominal no lo
						cubre.
					</p>
				</div>

				<div className="role-workspace__header-actions">
					<button
						className="role-workspace__btn role-workspace__btn--secondary"
						onClick={() => navigate(APP_ROUTES.roles)}
						type="button"
					>
						← Volver al catálogo de roles
					</button>
				</div>
			</header>

			<div className="role-workspace__main">
				<section className="role-workspace__card">
					<h2 className="role-workspace__card-title">
						Nueva asignación temporal por excepción
					</h2>
					<p className="role-workspace__card-subtitle">
						Toda asignación por excepción requiere vigencia acotada y motivo
						obligatorio para trazabilidad en auditoría.
					</p>

					<RoleExceptionForm
						availableRoles={rolesQuery.data?.items ?? []}
						onCancel={() => navigate(APP_ROUTES.roles)}
						onCreated={(record) => {
							refreshExceptions();
							setToastMessage(
								`Asignación por excepción registrada exitosamente para ${record.collaboratorName} (${record.roleName}).`,
							);
						}}
					/>
				</section>

				<section className="role-workspace__card">
					<h2 className="role-workspace__card-title">
						Asignaciones por excepción registradas
					</h2>
					<p className="role-workspace__card-subtitle">
						Consulta las excepciones vigentes y revocadas, o revoca de inmediato
						un acceso temporal.
					</p>

					<RoleExceptionList
						exceptions={exceptions}
						onRevoke={(record) => setPendingRevoke(record)}
					/>
				</section>
			</div>

			<RevokeExceptionDialog
				exception={pendingRevoke}
				onCancel={() => setPendingRevoke(null)}
				onRevoked={(revoked) => {
					setPendingRevoke(null);
					refreshExceptions();
					setToastMessage(
						`Se revocó la asignación por excepción de ${revoked.collaboratorName}.`,
					);
				}}
			/>
		</main>
	);
}

export default RoleExceptionsPage;
