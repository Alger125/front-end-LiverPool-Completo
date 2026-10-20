import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SECURITY_PERMISSION_CODES } from '../../access-management/model/permission.model';
import { GlobalSearchPage } from '../../home/pages/GlobalSearchPage';
import { HomePage } from '../../home/pages/HomePage';
import {
	clearStoredSession,
	createSessionFromProfile,
	saveStoredSession,
} from '../../../shared/auth';
import { RoutePermissionGuard } from '../../../shared/permissions';
import { LogoutModalFlow } from '../components/LogoutModalFlow';
import { LoginPage } from '../pages/LoginPage';
import { SessionEndedPage } from '../pages/SessionEndedPage';

describe('Feature 1 — Autenticación SSO, Cierre de Sesión, Home y Buscador Global', () => {
	beforeEach(() => {
		saveStoredSession(createSessionFromProfile('admin_plataforma'));
	});

	it('CU-SEC-001: muestra la pantalla de Login SSO corporativo y bloquea un flujo excepcional (FE-01)', async () => {
		const user = userEvent.setup();

		render(
			<MemoryRouter initialEntries={['/login']}>
				<Routes>
					<Route element={<LoginPage />} path="/login" />
					<Route element={<HomePage />} path="/" />
				</Routes>
			</MemoryRouter>,
		);

		expect(
			screen.getByRole('heading', {
				name: /Gestión de Estructuras Comerciales/i,
			}),
		).toBeInTheDocument();
		expect(screen.getByText(/Conexión segura/i)).toBeInTheDocument();

		const select = screen.getByLabelText(
			/Perfil \/ Escenario de validación SSO/i,
		);
		await user.selectOptions(select, 'error_identidad');

		await user.click(
			screen.getByRole('button', { name: /Ingresar con SSO corporativo/i }),
		);

		expect(
			await screen.findByText(
				/No fue posible validar su identidad corporativa\./i,
			),
		).toBeInTheDocument();
	});

	it('CU-SEC-007: presenta los modales de confirmación, cambios sin guardar y pantallas de sesión finalizada/expirada', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		const onConfirm = vi.fn();

		const { rerender } = render(
			<LogoutModalFlow
				onCancel={onCancel}
				onConfirmLogout={onConfirm}
				step="confirm"
			/>,
		);

		expect(
			screen.getByRole('heading', { name: /Confirmar cierre de sesión/i }),
		).toBeInTheDocument();

		rerender(
			<LogoutModalFlow
				onCancel={onCancel}
				onConfirmLogout={onConfirm}
				step="unsaved"
			/>,
		);

		expect(
			screen.getByRole('heading', { name: /Tiene cambios sin guardar/i }),
		).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /Cerrar sesión/i }));
		expect(onConfirm).toHaveBeenCalledTimes(1);

		rerender(
			<MemoryRouter>
				<SessionEndedPage variant="logged-out" />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole('heading', { name: /Sesión finalizada/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Ir a Mi Portal/i }),
		).toBeInTheDocument();

		rerender(
			<MemoryRouter>
				<SessionEndedPage variant="expired" />
			</MemoryRouter>,
		);
		expect(
			screen.getByRole('heading', { name: /Su sesión ha expirado/i }),
		).toBeInTheDocument();
	});

	it('CU-HOM-001 y CU-HOM-002: muestra bienvenida personalizada y filtra dinámicamente los módulos según el rol activo', async () => {
		saveStoredSession(createSessionFromProfile('usuario_reportes'));

		render(
			<MemoryRouter>
				<HomePage />
			</MemoryRouter>,
		);

		expect(
			screen.getByRole('heading', { name: /Hola, Carlos/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('heading', { name: /Reportes/i }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole('heading', { name: /Roles y permisos/i }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole('heading', { name: /Gestión de Estructuras/i }),
		).not.toBeInTheDocument();
	});

	it('CU-HOM-002 (FE-05): bloquea el acceso por URL directa a un módulo sin permiso', () => {
		saveStoredSession(createSessionFromProfile('usuario_reportes'));

		render(
			<MemoryRouter initialEntries={['/roles']}>
				<Routes>
					<Route
						element={
							<RoutePermissionGuard
								moduleLabel="Roles y permisos"
								requiredPermission={SECURITY_PERMISSION_CODES.ROLE_VIEW}
							>
								<div>Contenido protegido de roles</div>
							</RoutePermissionGuard>
						}
						path="/roles"
					/>
				</Routes>
			</MemoryRouter>,
		);

		expect(
			screen.getByText(/No cuenta con permisos para acceder a este módulo\./i),
		).toBeInTheDocument();
		expect(
			screen.queryByText(/Contenido protegido de roles/i),
		).not.toBeInTheDocument();
	});

	it('CU-HOM-003: busca departamentos y colaboradores dentro del alcance y valida criterios inválidos', async () => {
		const user = userEvent.setup();
		saveStoredSession(createSessionFromProfile('excepcion_activa'));

		render(
			<MemoryRouter initialEntries={['/search']}>
				<Routes>
					<Route element={<GlobalSearchPage />} path="/search" />
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getAllByText('Línea Blanca').length).toBeGreaterThan(0);
		// Polanco está fuera del alcance de Andrea Torres (solo Liverpool Atizapán)
		expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();

		const searchInput = screen.getByLabelText(/Buscar en tu alcance/i);
		await user.type(searchInput, 'EMP-412098');

		await waitFor(() => {
			expect(
				screen.getByText(/Ficha directa de colaborador \(FA-01\)/i),
			).toBeInTheDocument();
		});

		await user.clear(searchInput);
		await user.type(searchInput, '<script>');
		expect(
			await screen.findByText(/Verifique los criterios ingresados\./i),
		).toBeInTheDocument();

		clearStoredSession('MANUAL');
	});
});
