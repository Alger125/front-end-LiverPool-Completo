import './RoleFormActions.css';

interface RoleFormActionsProps {
    isLastStep: boolean;
    isSubmitting: boolean;
    onBack: () => void;
    onCancel: () => void;
    onNext: () => void;
    onSubmit: () => void;
    stepIndex: number;
}

export function RoleFormActions({
    isLastStep,
    isSubmitting,
    onBack,
    onCancel,
    onNext,
    onSubmit,
    stepIndex,
}: RoleFormActionsProps) {
    const isFirstStep =
        stepIndex === 0;

    return (
        <div className="role-form-actions">
            <button
                className="role-form-actions__button role-form-actions__button--cancel"
                disabled={
                    isSubmitting
                }
                onClick={
                    onCancel
                }
                type="button"
            >
                Cancelar
            </button>

            <div className="role-form-actions__primary">
                {!isFirstStep ? (
                    <button
                        className="role-form-actions__button role-form-actions__button--back"
                        disabled={
                            isSubmitting
                        }
                        onClick={
                            onBack
                        }
                        type="button"
                    >
                        Regresar
                    </button>
                ) : null}

                {isLastStep ? (
                    <button
                        className="role-form-actions__button role-form-actions__button--submit"
                        disabled={
                            isSubmitting
                        }
                        onClick={
                            onSubmit
                        }
                        type="button"
                    >
                        {isSubmitting
                            ? 'Creando rol...'
                            : 'Crear rol'}
                    </button>
                ) : (
                    <button
                        className="role-form-actions__button role-form-actions__button--next"
                        disabled={
                            isSubmitting
                        }
                        onClick={
                            onNext
                        }
                        type="button"
                    >
                        Siguiente
                    </button>
                )}
            </div>
        </div>
    );
}