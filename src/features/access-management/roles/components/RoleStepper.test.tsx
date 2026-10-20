import {
    fireEvent,
    render,
    screen,
} from '@testing-library/react';
import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import type { ComponentProps } from 'react';

import { RoleStepper } from './RoleStepper';

const steps: ComponentProps<typeof RoleStepper>['steps'] = [
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
        label: 'Alcance',
        fields: [],
    },
];

describe('RoleStepper', () => {
    it('identifica el paso actual', () => {
        render(
            <RoleStepper
                furthestStepIndex={1}
                onStepSelect={vi.fn()}
                stepIndex={1}
                steps={steps}
            />,
        );

        expect(
            screen.getByRole('button', {
                name: /permisos/i,
            }),
        ).toHaveAttribute(
            'aria-current',
            'step',
        );
    });

    it('deshabilita los pasos futuros', () => {
        render(
            <RoleStepper
                furthestStepIndex={1}
                onStepSelect={vi.fn()}
                stepIndex={1}
                steps={steps}
            />,
        );

        expect(
            screen.getByRole('button', {
                name: /alcance/i,
            }),
        ).toBeDisabled();
    });

    it('permite regresar a un paso alcanzado', () => {
        const onStepSelect = vi.fn();

        render(
            <RoleStepper
                furthestStepIndex={1}
                onStepSelect={onStepSelect}
                stepIndex={1}
                steps={steps}
            />,
        );

        fireEvent.click(
            screen.getByRole('button', {
                name: /datos del rol/i,
            }),
        );

        expect(
            onStepSelect,
        ).toHaveBeenCalledWith(0);
    });
});