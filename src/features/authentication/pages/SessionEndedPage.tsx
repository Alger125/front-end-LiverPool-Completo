import { useNavigate } from 'react-router-dom';

import '../styles/authentication.css';

interface SessionEndedPageProps {
	variant: 'logged-out' | 'expired';
}

export function SessionEndedPage({ variant }: SessionEndedPageProps) {
	const navigate = useNavigate();

	const isExpired = variant === 'expired';

	return (
		<main className="session-status-page">
			<section
				aria-labelledby="session-status-heading"
				className="session-status-card"
			>
				{isExpired ? (
					<div
						aria-hidden="true"
						className="session-status-card__circle session-status-card__circle--expired"
					>
						!
					</div>
				) : (
					<div
						aria-hidden="true"
						className="session-status-card__circle session-status-card__circle--success"
					>
						✓
					</div>
				)}

				<h1 className="session-status-card__title" id="session-status-heading">
					{isExpired ? 'Su sesión ha expirado' : 'Sesión finalizada'}
				</h1>

				<p className="session-status-card__description">
					{isExpired
						? 'Por seguridad, la sesión finalizó debido al tiempo de inactividad. Inicie sesión nuevamente para continuar.'
						: 'Su sesión se cerró correctamente. Para volver a ZDeptos, ingrese nuevamente mediante el acceso corporativo.'}
				</p>

				<button
					className="session-status-card__cta"
					onClick={() => navigate('/login', { replace: true })}
					type="button"
				>
					{isExpired ? 'Iniciar sesión' : 'Ir a Mi Portal'}
				</button>
			</section>
		</main>
	);
}
