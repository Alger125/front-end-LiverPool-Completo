import { useState } from 'react';

import { appendAuditLogEntry, useSession } from '../../../../shared/auth';
import { revokeRoleException } from '../../api/exceptions.api';
import type { RoleExceptionRecord } from '../../model/role-exception.model';

interface RevokeExceptionDialogProps {
	exception: RoleExceptionRecord | null;
	onCancel: () => void;
	onRevoked: (revoked: RoleExceptionRecord) => void;
}

export function RevokeExceptionDialog({
	exception,
	onCancel,
	onRevoked,
}: RevokeExceptionDialogProps) {
	const session = useSession();
	const [reason, setReason] = useState(
		'Conclusión anticipada de cobertura operativa',
	);
	const [error, setError] = useState<string | null>(null);

	if (!exception) {
		return null;
	}

	function handleConfirm(): void {
		if (!exception) {
			return;
		}
		setError(null);

		try {
			const updated = revokeRoleException(exception.id, reason);
			appendAuditLogEntry({
				action: 'ROLE_EXCEPTION_REVOKED',
				actorId: session?.user.employeeNumber ?? 'EMP-900142',
				actorName: session?.user.fullName ?? 'Administrador',
				detail: `Revocó la excepción del rol ${exception.roleName} (${exception.locationName}) al colaborador ${exception.collaboratorName} (${exception.employeeNumber}). Motivo: ${reason.trim()}`,
				module: 'SECURITY_ROLES',
				outcome: 'SUCCESS',
			});
			onRevoked(updated);
		} catch (err: unknown) {
			setError(
				err instanceof Error
					? err.message
					: 'No fue posible revocar la asignación por excepción.',
			);
		}
	}

	return (
		<div
			aria-labelledby="revoke-exception-title"
			aria-modal="true"
			className="role-delete-modal__backdrop"
			role="dialog"
		>
			<div className="role-delete-modal">
				<header className="role-delete-modal__header">
					<span className="role-delete-modal__badge">Revocación inmediata</span>
					<h2 className="role-delete-modal__title" id="revoke-exception-title">
						Revocar asignación por excepción
					</h2>
					<p className="role-delete-modal__subtitle">
						El colaborador perderá inmediatamente los permisos temporales
						otorgados por esta excepción y volverá a su rol nominal.
					</p>
				</header>

				<div className="role-delete-modal__body">
					<div className="role-impact-warning__summary-grid">
						<div className="role-impact-warning__metric">
							<span className="role-impact-warning__metric-label">
								Colaborador
							</span>
							<strong className="role-impact-warning__metric-value">
								{exception.collaboratorName} ({exception.employeeNumber})
							</strong>
							<span className="role-impact-warning__metric-sub">
								Puesto nominal: {exception.nominalPosition}
							</span>
						</div>

						<div className="role-impact-warning__metric">
							<span className="role-impact-warning__metric-label">
								Excepción activa
							</span>
							<strong className="role-impact-warning__metric-value">
								{exception.roleName}
							</strong>
							<span className="role-impact-warning__metric-sub">
								Ubicación: {exception.locationName}
							</span>
						</div>
					</div>

					<div className="role-delete-modal__field">
						<label
							className="role-delete-modal__label"
							htmlFor="revoke-exception-reason"
						>
							Motivo de revocación *
						</label>
						<input
							className="role-delete-modal__input"
							id="revoke-exception-reason"
							onChange={(e) => setReason(e.target.value)}
							placeholder="Describe el motivo de revocación (mín. 5 caracteres)"
							type="text"
							value={reason}
						/>
					</div>

					{error ? (
						<div className="role-delete-modal__error" role="alert">
							{error}
						</div>
					) : null}
				</div>

				<footer className="role-delete-modal__footer">
					<button
						className="role-delete-modal__btn role-delete-modal__btn--secondary"
						onClick={onCancel}
						type="button"
					>
						Cancelar
					</button>
					<button
						className="role-delete-modal__btn role-delete-modal__btn--danger"
						onClick={handleConfirm}
						type="button"
					>
						Confirmar revocación
					</button>
				</footer>
			</div>
		</div>
	);
}
