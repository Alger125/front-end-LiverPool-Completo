import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetRolesMockState } from '../../../../mocks/roles-permissions.handlers';
import {
	resetRoleExceptionsStore,
} from '../../api/exceptions.api';
import { RoleExceptionsPage } from '../../exceptions/pages/RoleExceptionsPage';
import { SECURITY_PERMISSION_CODES } from '../../model/permission.model';
import EditRolePage from '../pages/EditRolePage';
import RoleDetailPage from '../pages/RoleDetailPage';
import { RoleListPage } from '../pages/RoleListPage';

const ALL_PERMS = Object.values(SECURITY_PERMISSION_CODES);

function renderWithRouter(initialEntry: string) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[initialEntry]}>
				<Routes>
					<Route
						element={<RoleListPage grantedPermissions={ALL_PERMS} />}
						path="/roles"
					/>
					<Route element={<RoleDetailPage />} path="/roles/:roleId" />
					<Route element={<EditRolePage />} path="/roles/:roleId/edit" />
					<Route
						element={<RoleExceptionsPage />}
						path="/access-management/exceptions"
					/>
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

describe('Feature 2 — Roles, Permisos y Asignación por Excepción (CU-SEC-002 a CU-SEC-006)', () => {
	beforeEach(() => {
		resetRolesMockState();
		resetRoleExceptionsStore();
	});

	it('CU-SEC-004 & CU-SEC-003: muestra regla de alcance en catálogo, bloquea baja de rol protegido y permite eliminar rol estándar con impacto', async () => {
		const user = userEvent.setup();
		renderWithRouter('/roles');

		expect(
			await screen.findByText('Administrador de estructuras'),
		).toBeInTheDocument();
		expect(screen.getByText('Regla de Alcance')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Asignación por excepción/i }),
		).toBeInTheDocument();

		const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' });
		expect(deleteButtons.length).toBeGreaterThanOrEqual(3);

		// Intentar eliminar el rol protegido "Administrador del sistema" (2da fila ordenada por nombre)
		await user.click(deleteButtons[1]);

		expect(
			await screen.findByRole('heading', {
				name: 'Confirmar eliminación de rol',
			}),
		).toBeInTheDocument();

		expect(
			await screen.findByText(/Eliminación bloqueada \(Rol Protegido\)/i),
		).toBeInTheDocument();

		const modalDeleteBtn = screen
			.getAllByRole('button', { name: 'Eliminar' })
			.find((btn) => btn.classList.contains('role-delete-modal__btn--danger'));
		expect(modalDeleteBtn).toBeDisabled();

		await user.click(screen.getByRole('button', { name: 'Cancelar' }));

		// Eliminar el rol estándar "Administrador de estructuras" (1ra fila)
		await user.click(deleteButtons[0]);

		expect(
			await screen.findByText(/30 colaboradores/i),
		).toBeInTheDocument();

		const confirmBtn = screen
			.getAllByRole('button', { name: 'Eliminar' })
			.find((btn) => btn.classList.contains('role-delete-modal__btn--danger'));
		expect(confirmBtn).toBeEnabled();

		await user.click(confirmBtn!);

		expect(
			await screen.findByText(/eliminado exitosamente/i),
		).toBeInTheDocument();
	});

	it('CU-SEC-002 & CU-SEC-004: consulta el detalle de un rol en modo solo lectura con su matriz y Regla Resultante', async () => {
		renderWithRouter('/roles/3d377584-c0c5-4391-b4f9-b11ae93f4bfd');

		expect(
			await screen.findByRole('heading', {
				name: 'Administrador de estructuras',
			}),
		).toBeInTheDocument();
		expect(screen.getByText(/ID Rol: STRUCTURE_ADMIN/i)).toBeInTheDocument();
		expect(screen.getByText(/Regla Resultante/i)).toBeInTheDocument();
		expect(screen.getByText(/✓ Consultar grupos/i)).toBeInTheDocument();
	});

	it('CU-SEC-005: edita un rol en 2 pasos, maneja conflicto de concurrencia 409 (FE-07) y guarda cambios', async () => {
		const user = userEvent.setup();
		renderWithRouter('/roles/3d377584-c0c5-4391-b4f9-b11ae93f4bfd/edit');

		expect(
			await screen.findByRole('heading', {
				name: /Editar rol: Administrador de estructuras/i,
			}),
		).toBeInTheDocument();

		// Probar simulación de conflicto de concurrencia 409 (FE-07)
		await user.click(
			screen.getByRole('button', {
				name: /Simular conflicto concurrencia \(409\)/i,
			}),
		);

		expect(
			await screen.findByText(/Conflicto de concurrencia detectado \(409\)/i),
		).toBeInTheDocument();

		// Ir al Paso 2 (Asignación de Roles — Regla de Condición) y guardar versión vigente
		await user.click(
			screen.getByRole('tab', {
				name: /Asignación de Roles \(Regla de Condición\)/i,
			}),
		);

		expect(
			await screen.findByText(/Asignación de Roles — Reglas de Condición/i),
		).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Guardar' }));

		await waitFor(() => {
			expect(
				screen.getByRole('heading', { name: 'Catálogo de roles y permisos' }),
			).toBeInTheDocument();
		});
	});

	it('CU-SEC-006: gestiona asignaciones por excepción, bloquea colaboradores inactivos (FE-03), crea y revoca excepciones', async () => {
		const user = userEvent.setup();
		renderWithRouter('/access-management/exceptions');

		expect(
			await screen.findByRole('heading', {
				name: /Asignación por excepción de Rol a Colaborador/i,
			}),
		).toBeInTheDocument();

		// Seleccionar colaborador inactivo Carlos Ruiz (EMP-009112) -> valida FE-03
		await user.click(screen.getByText(/Carlos Ruiz Mondragón/i));
		expect(
			await screen.findByText(/Colaborador no elegible \(FE-03\)/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', {
				name: /Guardar asignación por excepción/i,
			}),
		).toBeDisabled();

		// Seleccionar colaboradora activa Mariana Vega (EMP-410288) y registrar excepción
		await user.click(screen.getByText(/Mariana Vega Solís/i));
		await user.type(
			screen.getByLabelText(/Motivo obligatorio/i),
			'Apoyo extraordinario de inventario en Perisur',
		);

		await waitFor(() => expect(screen.getByLabelText(/Rol a otorgar por excepción/i).querySelectorAll('option').length).toBeGreaterThan(0));

		await user.click(
			screen.getByRole('button', {
				name: /Guardar asignación por excepción/i,
			}),
		);

		expect(
			await screen.findByText(
				/Asignación por excepción registrada exitosamente para Mariana Vega Solís/i,
			),
		).toBeInTheDocument();

		// Revocar una excepción activa
		const revokeButtons = screen.getAllByRole('button', { name: 'Revocar' });
		await user.click(revokeButtons[0]);

		expect(
			await screen.findByRole('heading', {
				name: 'Revocar asignación por excepción',
			}),
		).toBeInTheDocument();

		await user.click(
			screen.getByRole('button', { name: 'Confirmar revocación' }),
		);

		expect(
			await screen.findByText(/Se revocó la asignación por excepción/i),
		).toBeInTheDocument();
	});
});
