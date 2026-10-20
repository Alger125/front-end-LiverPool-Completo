import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RoleForm } from '../components/RoleForm';
import { renderWithProviders } from '../../../../shared/testing';

describe('RoleForm', () => {
	it('walks through basic data, segmentation, permissions, and scope before enabling creation', async () => {
		const user = userEvent.setup();
		renderWithProviders(<RoleForm onCancel={vi.fn()} />);

		await user.type(screen.getByLabelText('Nombre'), 'Administrador de estructuras');
		await user.type(screen.getByLabelText('Descripción'), 'Administra grupos y secciones.');
		await user.click(screen.getByRole('button', { name: 'Siguiente' }));

		const locationCheckbox = await screen.findByLabelText(/LOC-001 · Ubicación Centro/i);
		await user.click(locationCheckbox);
		await user.click(screen.getByRole('button', { name: 'Siguiente' }));

		const permissionCheckbox = await screen.findByLabelText(/Consultar roles/i);
		await user.click(permissionCheckbox);
		await user.click(screen.getByRole('button', { name: 'Siguiente' }));

		expect(await screen.findByRole('heading', { name: 'Alcance' })).toBeInTheDocument();
		await waitFor(() => expect(screen.getByRole('button', { name: 'Crear rol' })).toBeEnabled());
	});

	it('calls onCancel when Cancelar is clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		renderWithProviders(<RoleForm onCancel={onCancel} />);

		await user.click(screen.getByRole('button', { name: 'Cancelar' }));
		expect(onCancel).toHaveBeenCalled();
	});
});
