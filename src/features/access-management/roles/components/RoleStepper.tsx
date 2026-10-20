import type { RoleStep } from '../hooks/useRoleStepper';

import './RoleStepper.css';

interface RoleStepperProps {
    steps: readonly RoleStep[];
    stepIndex: number;
    furthestStepIndex: number;
    onStepSelect: (index: number) => void;
}

type StepStatus =
    | 'completed'
    | 'current'
    | 'available'
    | 'pending';

function getStepStatus(
    index: number,
    stepIndex: number,
    furthestStepIndex: number,
): StepStatus {
    if (index < stepIndex) {
        return 'completed';
    }

    if (index === stepIndex) {
        return 'current';
    }

    if (index <= furthestStepIndex) {
        return 'available';
    }

    return 'pending';
}

export function RoleStepper({
    steps,
    stepIndex,
    furthestStepIndex,
    onStepSelect,
}: RoleStepperProps) {
    return (
        <nav
            aria-label="Progreso para crear un rol"
            className="role-stepper"
        >
            <ol className="role-stepper__list">
                {steps.map((step, index) => {
                    const status = getStepStatus(
                        index,
                        stepIndex,
                        furthestStepIndex,
                    );

                    const isCurrent =
                        status === 'current';

                    const isPending =
                        status === 'pending';

                    return (
                        <li
                            className={[
                                'role-stepper__item',
                                `role-stepper__item--${status}`,
                            ].join(' ')}
                            key={step.id}
                        >
                            <button
                                aria-current={
                                    isCurrent
                                        ? 'step'
                                        : undefined
                                }
                                className={[
                                    'role-stepper__button',
                                    `role-stepper__button--${status}`,
                                ].join(' ')}
                                disabled={isPending}
                                onClick={() => {
                                    onStepSelect(index);
                                }}
                                type="button"
                            >
                                <span
                                    aria-hidden="true"
                                    className="role-stepper__number"
                                >
                                    {index + 1}
                                </span>

                                <span className="role-stepper__label">
                                    {step.label}
                                </span>

                                {status ===
                                'completed' ? (
                                    <span className="role-stepper__status">
                                        Completado
                                    </span>
                                ) : null}

                                {status === 'current' ? (
                                    <span className="role-stepper__status">
                                        Paso actual
                                    </span>
                                ) : null}
                            </button>

                            {index <
                            steps.length - 1 ? (
                                <span
                                    aria-hidden="true"
                                    className="role-stepper__connector"
                                />
                            ) : null}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}