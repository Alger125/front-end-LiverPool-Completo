import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { RoleStepper } from '../components/RoleStepper';

const STEPS: ComponentProps<typeof RoleStepper>['steps'] = [
	{
		id: 'basic-data',
		label: 'Datos del rol',
		fields: [],
	},
	{
		id: 'permissions',
		label: 'Permisos',
		fields: [],
	},
	{
		id: 'scope',
		label: 'Resumen',
		fields: [],
	},
];

describe('RoleStepper', () => {
	it('marks the current step and disables steps beyond the furthest visited one', () => {
		render(
			<RoleStepper
				furthestStepIndex={0}
				onStepSelect={vi.fn()}
				stepIndex={0}
				steps={STEPS}
			/>,
		);

		expect(screen.getByRole('button', { name: /Datos del rol/i })).toBeEnabled();
		expect(screen.getByRole('button', { name: /Permisos/i })).toBeDisabled();
		expect(screen.getByRole('button', { name: /Resumen/i })).toBeDisabled();
	});

	it('calls onStepSelect only for steps already visited', async () => {
		const user = userEvent.setup();
		const onStepSelect = vi.fn();

		render(
			<RoleStepper
				furthestStepIndex={1}
				onStepSelect={onStepSelect}
				stepIndex={1}
				steps={STEPS}
			/>,
		);

		await user.click(screen.getByRole('button', { name: /Datos del rol/i }));
		expect(onStepSelect).toHaveBeenCalledWith(0);

		expect(screen.getByRole('button', { name: /Resumen/i })).toBeDisabled();
	});
});
