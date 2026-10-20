import { Component, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
	children: ReactNode;
}

interface AppErrorBoundaryState {
	hasError: boolean;
}

export class AppErrorBoundary extends Component<
	AppErrorBoundaryProps,
	AppErrorBoundaryState
> {
	public state: AppErrorBoundaryState = { hasError: false };

	public static getDerivedStateFromError(): AppErrorBoundaryState {
		return { hasError: true };
	}

	public render() {
		if (this.state.hasError) {
			return (
				<main role="alert">
					<h1>No se pudo cargar la aplicacion</h1>
					<p>Ocurrio un error inesperado. Intenta nuevamente mas tarde.</p>
				</main>
			);
		}

		return this.props.children;
	}
}
