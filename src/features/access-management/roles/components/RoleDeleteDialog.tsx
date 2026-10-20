import { useEffect, useState } from 'react';

import type { RoleSummary } from '../../../../generated/api';
import { appendAuditLogEntry, useSession } from '../../../../shared/auth';
import {
	deleteRole,
	getRoleImpact,
	type RoleImpactResponse,
} from '../api/roles.api';
import { RoleImpactWarning } from './RoleImpactWarning';

interface RoleDeleteDialogProps {
	role: RoleSummary | null;
	onCancel: () => void;
	onDeleted: (deletedRole: RoleSummary) => void;
}

export function RoleDeleteDialog({
	role,
	onCancel,
	onDeleted,
}: RoleDeleteDialogProps) {
	const session = useSession();
	const [impact, setImpact] = useState<RoleImpactResponse | null>(null);
	const [isLoadingImpact, setIsLoadingImpact] = useState(false);
	const [impactError, setImpactError] = useState<string | null>(null);

	const [reason, setReason] = useState(
		'Baja administrativa de rol autorizada',
	);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	useEffect(() => {
		if (!role) {
			setImpact(null);
			setImpactError(null);
			setDeleteError(null);
			return;
		}

		let isCancelled = false;
		setIsLoadingImpact(true);
		setImpactError(null);
		setDeleteError(null);
		setReason('Baja administrativa de rol autorizada');

		getRoleImpact(role.id)
			.then((data) => {
				if (!isCancelled) {
					setImpact(data);
				}
			})
			.catch((err: unknown) => {
				if (!isCancelled) {
					setImpactError(
						err instanceof Error
							? err.message
							: 'No fue posible consultar el impacto del rol.',
					);
				}
			})
			.finally(() => {
				if (!isCancelled) {
					setIsLoadingImpact(false);
				}
			});

		return () => {
			isCancelled = true;
		};
	}, [role]);

	if (!role) {
		return null;
	}

	const isProtected =
		role.protected ||
		Boolean(impact?.protected) ||
		(impact !== null && !impact.canDelete);
	const isReasonValid = reason.trim().length >= 5;

	async function handleConfirmDelete(): Promise<void> {
		if (!role || isProtected || isDeleting) {
			return;
		}

		if (!isReasonValid) {
			setDeleteError(
				'Captura una justificación de al menos 5 caracteres para auditoría.',
			);
			return;
		}

		setIsDeleting(true);
		setDeleteError(null);

		try {
			await deleteRole(role.id, {
				version: role.version,
				reason: reason.trim(),
			});

			appendAuditLogEntry({
				action: 'ROLE_DELETED',
				actorId: session?.user.employeeNumber ?? 'EMP-900142',
				actorName: session?.user.fullName ?? 'Administrador',
				detail: `Eliminó el rol ${role.code} (${role.name}). Usuarios impactados: ${
					(impact?.activeAssignments ?? 0) + (impact?.activeExceptions ?? 0)
				}. Motivo: ${reason.trim()}`,
				module: 'SECURITY_ROLES',
				outcome: 'SUCCESS',
			});

			onDeleted(role);
		} catch (err: unknown) {
			setDeleteError(
				err instanceof Error
					? err.message
					: 'Ocurrió un error al intentar eliminar el rol.',
			);
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<div
			aria-labelledby="role-delete-dialog-title"
			aria-modal="true"
			className="role-delete-modal__backdrop"
			role="dialog"
		>
			<div className="role-delete-modal">
				<header className="role-delete-modal__header">
					<span className="role-delete-modal__badge">Acción crítica</span>
					<h2 className="role-delete-modal__title" id="role-delete-dialog-title">
						Confirmar eliminación de rol
					</h2>
					<p className="role-delete-modal__subtitle">
						Estás a punto de eliminar este rol de la plataforma. Revisa el
						impacto antes de continuar.
					</p>
				</header>

				<div className="role-delete-modal__body">
					{isLoadingImpact ? (
						<p className="role-delete-modal__loading" role="status">
							Calculando usuarios y asignaciones impactadas…
						</p>
					) : null}

					{impactError ? (
						<div className="role-delete-modal__error" role="alert">
							{impactError}
						</div>
					) : null}

					{impact ? (
						<RoleImpactWarning
							impact={impact}
							roleCode={role.code}
							roleName={role.name}
						/>
					) : null}

					{!isProtected ? (
						<div className="role-delete-modal__field">
							<label
								className="role-delete-modal__label"
								htmlFor="role-delete-reason"
							>
								Motivo de eliminación (Auditoría) *
							</label>
							<input
								className="role-delete-modal__input"
								id="role-delete-reason"
								onChange={(event) => setReason(event.target.value)}
								placeholder="Describe el motivo de baja del rol (mín. 5 caracteres)"
								type="text"
								value={reason}
							/>
						</div>
					) : null}

					{deleteError ? (
						<div className="role-delete-modal__error" role="alert">
							{deleteError}
						</div>
					) : null}
				</div>

				<footer className="role-delete-modal__footer">
					<button
						className="role-delete-modal__btn role-delete-modal__btn--secondary"
						disabled={isDeleting}
						onClick={onCancel}
						type="button"
					>
						Cancelar
					</button>

					<button
						className="role-delete-modal__btn role-delete-modal__btn--danger"
						disabled={isLoadingImpact || isProtected || isDeleting}
						onClick={() => void handleConfirmDelete()}
						type="button"
					>
						{isDeleting ? 'Eliminando…' : 'Eliminar'}
					</button>
				</footer>
			</div>
		</div>
	);
}
