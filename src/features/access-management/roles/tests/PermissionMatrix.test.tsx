import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PermissionMatrix } from '../components/PermissionMatrix';
import type { PermissionCatalogModule } from '../../model/permission-catalog.model';

const modules: PermissionCatalogModule[] = [
	{
		code: 'SECURITY_ROLES',
		displayName: 'Seguridad - Roles',
		description: '',
		displayOrder: 10,
		permissions: [
			{
				code: 'ROLE_VIEW',
				module: 'SECURITY_ROLES',
				action: 'VIEW',
				displayName: 'Consultar roles',
				description: '',
				displayOrder: 10,
				assignable: true,
				sensitive: false,
				status: 'ACTIVE',
				notes: null,
			},
			{
				code: 'ROLE_LEGACY',
				module: 'SECURITY_ROLES',
				action: 'LEGACY',
				displayName: 'Permiso legado',
				description: '',
				displayOrder: 20,
				assignable: true,
				sensitive: false,
				status: 'INACTIVE',
				notes: null,
			},
		],
	},
];

describe('PermissionMatrix', () => {
	it('groups permissions by module and only lists ACTIVE ones', () => {
		render(
			<PermissionMatrix modules={modules} selectedPermissionCodes={[]} onTogglePermission={vi.fn()} />,
		);

		expect(screen.getByText('Seguridad - Roles')).toBeInTheDocument();
		expect(screen.getByLabelText(/Consultar roles/)).toBeInTheDocument();
		expect(screen.queryByLabelText(/Permiso legado/)).not.toBeInTheDocument();
	});

	it('toggles a permission when its checkbox is clicked', async () => {
		const user = userEvent.setup();
		const onTogglePermission = vi.fn();

		render(
			<PermissionMatrix
				modules={modules}
				selectedPermissionCodes={[]}
				onTogglePermission={onTogglePermission}
			/>,
		);

		await user.click(screen.getByLabelText(/Consultar roles/));
		expect(onTogglePermission).toHaveBeenCalledWith('ROLE_VIEW');
	});
});
