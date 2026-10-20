import { Link } from 'react-router-dom';

import { APP_ROUTES } from '../config/routes';

export function NotFoundPage() {
	return (
		<main>
			<h1>Pagina no encontrada</h1>
			<p>La ruta solicitada no existe.</p>
			<Link to={APP_ROUTES.home}>Volver al inicio</Link>
		</main>
	);
}
