import '../styles/authentication.css';

export type LogoutModalStep = 'closed' | 'confirm' | 'unsaved' | 'processing';

interface LogoutModalFlowProps {
	step: LogoutModalStep;
	onCancel: () => void;
	onConfirmLogout: () => void;
}

export function LogoutModalFlow({
	step,
	onCancel,
	onConfirmLogout,
}: LogoutModalFlowProps) {
	if (step === 'closed') {
		return null;
	}

	if (step === 'processing') {
		return (
			<div
				aria-live="assertive"
				aria-modal="true"
				className="session-modal-backdrop"
				role="dialog"
				aria-label="Cerrando sesión"
			>
				<div className="session-modal session-modal--processing">
					<div aria-hidden="true" className="session-modal__spinner" />
					<h2 className="session-modal__title">Cerrando sesión...</h2>
					<p className="session-modal__note" style={{ margin: '12px 0 0' }}>
						Estamos finalizando su acceso de forma segura.
					</p>
				</div>
			</div>
		);
	}

	if (step === 'unsaved') {
		return (
			<div
				aria-labelledby="logout-unsaved-title"
				aria-modal="true"
				className="session-modal-backdrop"
				role="dialog"
			>
				<div className="session-modal">
					<button
						aria-label="Cerrar ventana"
						className="session-modal__close"
						onClick={onCancel}
						type="button"
					>
						×
					</button>

					<div className="session-modal__header">
						<span
							aria-hidden="true"
							className="session-modal__icon session-modal__icon--warning"
						>
							!
						</span>
						<h2 className="session-modal__title" id="logout-unsaved-title">
							Tiene cambios sin guardar
						</h2>
					</div>

					<p className="session-modal__body">
						Si cierra la sesión ahora, perderá los cambios realizados en esta
						pantalla.
					</p>

					<p className="session-modal__note">
						Puede permanecer para guardar la información o continuar con el cierre.
					</p>

					<div className="session-modal__actions">
						<button
							className="session-modal__btn session-modal__btn--secondary"
							onClick={onCancel}
							type="button"
						>
							Permanecer
						</button>
						<button
							className="session-modal__btn session-modal__btn--primary"
							onClick={onConfirmLogout}
							type="button"
						>
							Cerrar sesión
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			aria-labelledby="logout-confirm-title"
			aria-modal="true"
			className="session-modal-backdrop"
			role="dialog"
		>
			<div className="session-modal">
				<button
					aria-label="Cerrar ventana"
					className="session-modal__close"
					onClick={onCancel}
					type="button"
				>
					×
				</button>

				<div className="session-modal__header">
					<span
						aria-hidden="true"
						className="session-modal__icon session-modal__icon--logout"
					>
						↪
					</span>
					<h2 className="session-modal__title" id="logout-confirm-title">
						Confirmar cierre de sesión
					</h2>
				</div>

				<p className="session-modal__body">¿Desea cerrar su sesión actual?</p>
				<p className="session-modal__body">
					Se finalizará el acceso a ZDeptos y deberá autenticarse nuevamente para
					continuar.
				</p>

				<p className="session-modal__note">
					La acción no modifica datos ni configuraciones guardadas.
				</p>

				<div className="session-modal__actions">
					<button
						className="session-modal__btn session-modal__btn--secondary"
						onClick={onCancel}
						type="button"
					>
						Cancelar
					</button>
					<button
						className="session-modal__btn session-modal__btn--primary"
						onClick={onConfirmLogout}
						type="button"
					>
						Cerrar sesión
					</button>
				</div>
			</div>
		</div>
	);
}
