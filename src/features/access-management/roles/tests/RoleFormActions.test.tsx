import {
    render,
    screen,
} from '@testing-library/react';
import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {
    RoleFormActions,
} from '../components/RoleFormActions';

describe(
    'RoleFormActions',
    () => {
        it(
            'no muestra guardar como borrador',
            () => {
                render(
                    <RoleFormActions
                        isLastStep={
                            false
                        }
                        isSubmitting={
                            false
                        }
                        onBack={
                            vi.fn()
                        }
                        onCancel={
                            vi.fn()
                        }
                        onNext={
                            vi.fn()
                        }
                        onSubmit={
                            vi.fn()
                        }
                        stepIndex={1}
                    />,
                );

                expect(
                    screen.queryByRole(
                        'button',
                        {
                            name:
                                /guardar como borrador/i,
                        },
                    ),
                ).not.toBeInTheDocument();
            },
        );

        it(
            'muestra crear rol en el último paso',
            () => {
                render(
                    <RoleFormActions
                        isLastStep
                        isSubmitting={
                            false
                        }
                        onBack={
                            vi.fn()
                        }
                        onCancel={
                            vi.fn()
                        }
                        onNext={
                            vi.fn()
                        }
                        onSubmit={
                            vi.fn()
                        }
                        stepIndex={3}
                    />,
                );

                expect(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                /crear rol/i,
                        },
                    ),
                ).toBeInTheDocument();

                expect(
                    screen.queryByRole(
                        'button',
                        {
                            name:
                                /siguiente/i,
                        },
                    ),
                ).not.toBeInTheDocument();
            },
        );
    },
);