import { useRouteError } from 'react-router-dom';

export function RouteErrorPage() {
	useRouteError();

	return (
		<main role="alert">
			<h1>No se pudo cargar la pagina</h1>
			<p>Ocurrio un error al cargar esta ruta. Intenta nuevamente mas tarde.</p>
		</main>
	);
}
