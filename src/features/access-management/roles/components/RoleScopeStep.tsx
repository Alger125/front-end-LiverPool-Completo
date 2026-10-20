import { useId } from 'react';
import {
    Controller,
    useFormContext,
    useWatch,
} from 'react-hook-form';

import type {
    CreateRoleFormValues,
} from '../schemas/create-role.schema';

import './RoleScopeStep.css';

export interface ScopeOption {
    code: string;
    name: string;
}

interface RoleScopeStepProps {
    businesses:
        readonly ScopeOption[];
    zones:
        readonly ScopeOption[];
    locations:
        readonly ScopeOption[];
    departments:
        readonly ScopeOption[];
}

type MultipleScopeFieldName =
    | 'businessCodes'
    | 'zoneCodes'
    | 'scopeLocationCodes'
    | 'scopeDepartmentCodes';

interface MultipleScopeFieldProps {
    label: string;
    name: MultipleScopeFieldName;
    options:
        readonly ScopeOption[];
}

function getSelectedLabel(
    selectedValues: string[],
    options:
        readonly ScopeOption[],
): string {
    if (
        selectedValues.length === 0
    ) {
        return 'Selecciona una o más opciones';
    }

    if (
        selectedValues.length === 1
    ) {
        const selectedOption =
            options.find(
                (option) =>
                    option.code ===
                    selectedValues[0],
            );

        return (
            selectedOption?.name ??
            '1 opción seleccionada'
        );
    }

    return `${selectedValues.length} opciones seleccionadas`;
}

function MultipleScopeField({
    label,
    name,
    options,
}: MultipleScopeFieldProps) {
    const fieldId = useId();

    const {
        control,
    } =
        useFormContext<
            CreateRoleFormValues
        >();

    return (
        <Controller
            control={control}
            name={name}
            render={({
                field,
                fieldState,
            }) => {
                const selectedValues =
                    Array.isArray(
                        field.value,
                    )
                        ? field.value
                        : [];

                const selectedLabel =
                    getSelectedLabel(
                        selectedValues,
                        options,
                    );

                function toggleOption(
                    optionCode: string,
                ): void {
                    const isSelected =
                        selectedValues.includes(
                            optionCode,
                        );

                    const nextValues =
                        isSelected
                            ? selectedValues.filter(
                                  (
                                      value,
                                  ) =>
                                      value !==
                                      optionCode,
                              )
                            : [
                                  ...selectedValues,
                                  optionCode,
                              ];

                    field.onChange(
                        nextValues,
                    );
                }

                return (
                    <div className="role-scope__field">
                        <span
                            className="role-scope__label"
                            id={`${fieldId}-label`}
                        >
                            {label}
                        </span>

                        <details
                            className="role-scope-select"
                            onBlur={(
                                event,
                            ) => {
                                const nextTarget =
                                    event.relatedTarget;

                                if (
                                    nextTarget instanceof
                                        Node &&
                                    event.currentTarget.contains(
                                        nextTarget,
                                    )
                                ) {
                                    return;
                                }

                                field.onBlur();
                            }}
                        >
                            <summary
                                aria-describedby={
                                    fieldState
                                        .error
                                        ? `${fieldId}-error`
                                        : undefined
                                }
                                aria-invalid={
                                    fieldState.invalid
                                }
                                aria-labelledby={`${fieldId}-label`}
                                className="role-scope-select__summary"
                            >
                                <span className="role-scope-select__value">
                                    {
                                        selectedLabel
                                    }
                                </span>

                                <span
                                    aria-hidden="true"
                                    className="role-scope-select__arrow"
                                />
                            </summary>

                            <div
                                aria-labelledby={`${fieldId}-label`}
                                className="role-scope-select__options"
                                role="group"
                            >
                                {options.length ===
                                0 ? (
                                    <p className="role-scope-select__empty">
                                        No hay
                                        opciones
                                        disponibles.
                                    </p>
                                ) : (
                                    options.map(
                                        (
                                            option,
                                        ) => {
                                            const optionId =
                                                `${fieldId}-${option.code}`;

                                            const isChecked =
                                                selectedValues.includes(
                                                    option.code,
                                                );

                                            return (
                                                <label
                                                    className="role-scope-select__option"
                                                    htmlFor={
                                                        optionId
                                                    }
                                                    key={
                                                        option.code
                                                    }
                                                >
                                                    <input
                                                        checked={
                                                            isChecked
                                                        }
                                                        id={
                                                            optionId
                                                        }
                                                        onChange={() => {
                                                            toggleOption(
                                                                option.code,
                                                            );
                                                        }}
                                                        type="checkbox"
                                                    />

                                                    <span>
                                                        {
                                                            option.name
                                                        }
                                                    </span>
                                                </label>
                                            );
                                        },
                                    )
                                )}
                            </div>
                        </details>

                        {fieldState.error ? (
                            <p
                                className="role-scope__error"
                                id={`${fieldId}-error`}
                                role="alert"
                            >
                                {
                                    fieldState
                                        .error
                                        .message
                                }
                            </p>
                        ) : null}
                    </div>
                );
            }}
        />
    );
}

export function RoleScopeStep({
    businesses,
    zones,
    locations,
    departments,
}: RoleScopeStepProps) {
    const {
        control,
    } =
        useFormContext<
            CreateRoleFormValues
        >();

    const roleName =
        useWatch({
            control,
            name: 'name',
            defaultValue: '',
        });

    return (
        <div className="role-scope">
            <p className="role-scope__role-name">
                <strong>
                    Nombre:
                </strong>{' '}
                {roleName.trim() ||
                    'Sin nombre'}
            </p>

            <fieldset className="role-scope__card">
                <legend className="role-scope__legend">
                    Selecciona qué podrá
                    ver el rol:
                </legend>

                <MultipleScopeField
                    label="Negocio"
                    name="businessCodes"
                    options={
                        businesses
                    }
                />

                <MultipleScopeField
                    label="Zona"
                    name="zoneCodes"
                    options={zones}
                />

                <MultipleScopeField
                    label="Ubicación"
                    name="scopeLocationCodes"
                    options={
                        locations
                    }
                />

                <Controller
                    control={control}
                    name="canViewManagedLocations"
                    render={({
                        field,
                    }) => (
                        <label className="role-scope__managed-option">
                            <input
                                checked={
                                    field.value
                                }
                                onBlur={
                                    field.onBlur
                                }
                                onChange={(
                                    event,
                                ) => {
                                    field.onChange(
                                        event
                                            .target
                                            .checked,
                                    );
                                }}
                                type="checkbox"
                            />

                            <span>
                                Podrá ver
                                ubicaciones
                                gestionadas
                            </span>
                        </label>
                    )}
                />

                <MultipleScopeField
                    label="Departamento"
                    name="scopeDepartmentCodes"
                    options={
                        departments
                    }
                />
            </fieldset>
        </div>
    );
}