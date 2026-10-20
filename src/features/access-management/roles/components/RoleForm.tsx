import {
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    FormProvider,
} from 'react-hook-form';

import {
    FormErrorSummary,
} from '../../../../shared/forms/FormErrorSummary';
import {
    createRole,
} from '../api/roles.api';
import {
    useRoleForm,
} from '../hooks/useRoleForm';
import {
    useRoleStepper,
} from '../hooks/useRoleStepper';
import {
    RoleBasicDataStep,
} from './RoleBasicDataStep';
import {
    RoleFormActions,
} from './RoleFormActions';
import {
    RolePermissionsStep,
} from './RolePermissionsStep';
import {
    RoleScopeStep,
} from './RoleScopeStep';
import {
    RoleSegmentationStep,
} from './RoleSegmentationStep';
import {
    RoleStepper,
} from './RoleStepper';

const temporaryLocations = [
    {
        code: 'LOC-001',
        name: 'Ubicación Centro',
    },
    {
        code: 'LOC-002',
        name: 'Ubicación Norte',
    },
] as const;

const temporaryDepartments = [
    {
        code: 'DEP-001',
        name:
            'Departamento Comercial',
    },
    {
        code: 'DEP-002',
        name:
            'Departamento de Operaciones',
    },
] as const;

const temporaryJobFunctions = [
    {
        code: 'JOB-001',
        name: 'Administrador',
    },
    {
        code: 'JOB-002',
        name:
            'Jefatura de Departamento',
    },
] as const;

const temporaryBusinesses = [
    {
        code: 'BUS-001',
        name: 'Liverpool',
    },
    {
        code: 'BUS-002',
        name: 'Suburbia',
    },
] as const;

const temporaryZones = [
    {
        code: 'ZONE-001',
        name: 'Zona Centro',
    },
    {
        code: 'ZONE-002',
        name: 'Zona Norte',
    },
] as const;

interface RoleFormProps {
    onCancel: () => void;
    onCreated?: () =>
        void | Promise<void>;
}

export function RoleForm({
    onCancel,
    onCreated = () => {},
}: RoleFormProps) {
    const form = useRoleForm();
    const stepper =
        useRoleStepper();

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        submitError,
        setSubmitError,
    ] =
        useState<string | null>(
            null,
        );

    const headingRef =
        useRef<HTMLHeadingElement>(
            null,
        );

    useEffect(() => {
        headingRef.current?.focus();
    }, [stepper.stepIndex]);

    async function handleNext():
        Promise<void> {
        setSubmitError(null);

        const isStepValid =
            await form.trigger(
                stepper.currentStep
                    .fields,
            );

        if (isStepValid) {
            stepper.advance();
        }
    }

    function handleCancel(): void {
        const hasUnsavedChanges =
            form.formState.isDirty;

        if (
            hasUnsavedChanges &&
            !window.confirm(
                'Tienes cambios sin guardar. ¿Deseas salir de todas formas?',
            )
        ) {
            return;
        }

        onCancel();
    }

    async function handleSubmit():
        Promise<void> {
        if (isSubmitting) {
            return;
        }

        setSubmitError(null);

        const isFormValid =
            await form.trigger();

        if (!isFormValid) {
            setSubmitError(
                'Revisa los campos obligatorios antes de crear el rol.',
            );

            return;
        }

        setIsSubmitting(true);

        try {
            const values =
                form.getValues();

            await createRole(
                values,
            );

            await onCreated();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'No fue posible crear el rol.';

            setSubmitError(
                message,
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <FormProvider {...form}>
            <form
                className="role-form"
                onSubmit={(event) => {
                    event.preventDefault();
                }}
            >
                <p
                    aria-live="polite"
                    className="role-form__live-region"
                >
                    Paso{' '}
                    {stepper.stepIndex +
                        1}{' '}
                    de{' '}
                    {
                        stepper.steps
                            .length
                    }
                    :{' '}
                    {
                        stepper.currentStep
                            .label
                    }
                </p>

                <div className="role-form__stepper">
                    <RoleStepper
                        furthestStepIndex={
                            stepper
                                .furthestStepIndex
                        }
                        onStepSelect={
                            stepper.goToStep
                        }
                        stepIndex={
                            stepper.stepIndex
                        }
                        steps={
                            stepper.steps
                        }
                    />
                </div>

                <FormErrorSummary
                    errors={
                        form.formState
                            .errors
                    }
                />

                {submitError ? (
                    <div
                        aria-live="assertive"
                        className="role-form__submit-error"
                        role="alert"
                    >
                        {submitError}
                    </div>
                ) : null}

                <section
                    aria-labelledby="role-form-step-title"
                    className="role-form__step"
                >
                    <header className="role-form__step-header">
                        <p className="role-form__eyebrow">
                            Paso{' '}
                            {stepper.stepIndex +
                                1}{' '}
                            de{' '}
                            {
                                stepper
                                    .steps
                                    .length
                            }
                        </p>

                        <h2
                            className="role-form__step-title"
                            id="role-form-step-title"
                            ref={
                                headingRef
                            }
                            tabIndex={-1}
                        >
                            {
                                stepper
                                    .currentStep
                                    .label
                            }
                        </h2>
                    </header>

                    <div className="role-form__step-content">
                        {stepper
                            .currentStep
                            .id ===
                        'basic-data' ? (
                            <RoleBasicDataStep />
                        ) : null}

                        {stepper
                            .currentStep
                            .id ===
                        'segmentation' ? (
                            <RoleSegmentationStep
                                departments={
                                    temporaryDepartments
                                }
                                jobFunctions={
                                    temporaryJobFunctions
                                }
                                locations={
                                    temporaryLocations
                                }
                            />
                        ) : null}

                        {stepper
                            .currentStep
                            .id ===
                        'permissions' ? (
                            <RolePermissionsStep />
                        ) : null}

                        {stepper
                            .currentStep
                            .id ===
                        'scope' ? (
                            <RoleScopeStep
                                businesses={
                                    temporaryBusinesses
                                }
                                departments={
                                    temporaryDepartments
                                }
                                locations={
                                    temporaryLocations
                                }
                                zones={
                                    temporaryZones
                                }
                            />
                        ) : null}
                    </div>

                    <div className="role-form__actions">
                        <RoleFormActions
                            isLastStep={
                                stepper
                                    .isLastStep
                            }
                            isSubmitting={
                                isSubmitting
                            }
                            onBack={
                                stepper.goBack
                            }
                            onCancel={
                                handleCancel
                            }
                            onNext={
                                handleNext
                            }
                            onSubmit={
                                handleSubmit
                            }
                            stepIndex={
                                stepper
                                    .stepIndex
                            }
                        />
                    </div>
                </section>
            </form>
        </FormProvider>
    );
}