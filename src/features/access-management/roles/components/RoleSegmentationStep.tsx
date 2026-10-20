import {
  useId,
  useMemo,
} from 'react';
import {
  Controller,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import './RoleSegmentationStep.css';

export interface SegmentationOption {
  code: string;
  name: string;
}

interface RoleSegmentationStepProps {
  locations: readonly SegmentationOption[];
  departments: readonly SegmentationOption[];
  jobFunctions: readonly SegmentationOption[];
  isLoading?: boolean;
  hasError?: boolean;
}

interface MultiSelectFieldProps {
  label: string;
  name:
    | 'locationCodes'
    | 'departmentCodes'
    | 'jobFunctionCodes';
  options: readonly SegmentationOption[];
  disabled?: boolean;
}

function getOptionLabel(
  option: SegmentationOption,
): string {
  return `${option.code} · ${option.name}`;
}

function MultiSelectField({
  label,
  name,
  options,
  disabled = false,
}: MultiSelectFieldProps) {
  const fieldId = useId();

  const {
    control,
    getValues,
  } = useFormContext();

  const selectedValues =
    useWatch({
      control,
      name,
      defaultValue: [],
    }) as string[];

  const selectedLabel =
    useMemo(() => {
      if (
        !selectedValues ||
        selectedValues.length === 0
      ) {
        return 'Selecciona una o más opciones';
      }

      if (selectedValues.length === 1) {
        const selectedOption =
          options.find(
            (option) =>
              option.code ===
              selectedValues[0],
          );

        return selectedOption
          ? getOptionLabel(
              selectedOption,
            )
          : '1 opción seleccionada';
      }

      return `${selectedValues.length} opciones seleccionadas`;
    }, [
      options,
      selectedValues,
    ]);

  function validateSegmentation():
    | true
    | string {
    const locationCodes =
      getValues(
        'locationCodes',
      ) as string[] | undefined;

    const departmentCodes =
      getValues(
        'departmentCodes',
      ) as string[] | undefined;

    const jobFunctionCodes =
      getValues(
        'jobFunctionCodes',
      ) as string[] | undefined;

    const hasSelection =
      Boolean(locationCodes?.length) ||
      Boolean(
        departmentCodes?.length,
      ) ||
      Boolean(
        jobFunctionCodes?.length,
      );

    return (
      hasSelection ||
      'Selecciona al menos una ubicación, departamento o puesto.'
    );
  }

  return (
    <Controller
      control={control}
      defaultValue={[]}
      name={name}
      rules={{
        validate:
          validateSegmentation,
      }}
      render={({
        field,
        fieldState,
      }) => {
        const currentValues =
          Array.isArray(field.value)
            ? (field.value as string[])
            : [];

        function toggleOption(
          optionCode: string,
        ): void {
          const nextValues =
            currentValues.includes(
              optionCode,
            )
              ? currentValues.filter(
                  (value) =>
                    value !== optionCode,
                )
              : [
                  ...currentValues,
                  optionCode,
                ];

          field.onChange(
            nextValues,
          );
        }

        return (
          <div className="role-segmentation__field">
            <label
              className="role-segmentation__label"
              id={`${fieldId}-label`}
            >
              {label}
            </label>

            <details
              className="role-multi-select"
              onBlur={(event) => {
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
                  fieldState.error
                    ? `${fieldId}-error`
                    : undefined
                }
                aria-invalid={
                  fieldState.invalid
                }
                aria-labelledby={`${fieldId}-label`}
                className="role-multi-select__summary"
              >
                <span className="role-multi-select__value">
                  {selectedLabel}
                </span>

                <span
                  aria-hidden="true"
                  className="role-multi-select__chevron"
                />
              </summary>

              <div
                aria-labelledby={`${fieldId}-label`}
                className="role-multi-select__menu"
                role="group"
              >
                {options.length === 0 ? (
                  <p className="role-multi-select__empty">
                    No hay opciones
                    disponibles.
                  </p>
                ) : (
                  options.map(
                    (option) => {
                      const optionId =
                        `${fieldId}-${option.code}`;

                      return (
                        <label
                          className="role-multi-select__option"
                          htmlFor={
                            optionId
                          }
                          key={
                            option.code
                          }
                        >
                          <input
                            checked={currentValues.includes(
                              option.code,
                            )}
                            disabled={
                              disabled
                            }
                            id={optionId}
                            onChange={() => {
                              toggleOption(
                                option.code,
                              );
                            }}
                            type="checkbox"
                          />

                          <span>
                            {getOptionLabel(
                              option,
                            )}
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
                className="role-segmentation__error"
                id={`${fieldId}-error`}
                role="alert"
              >
                {
                  fieldState.error
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

export function RoleSegmentationStep({
  locations,
  departments,
  jobFunctions,
  isLoading = false,
  hasError = false,
}: RoleSegmentationStepProps) {
  const { control } =
    useFormContext();

  const roleName =
    useWatch({
      control,
      name: 'name',
      defaultValue: '',
    }) as string;

  if (isLoading) {
    return (
      <div
        aria-live="polite"
        className="role-segmentation__state"
        role="status"
      >
        Cargando catálogos
        organizacionales...
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className="role-segmentation__state role-segmentation__state--error"
        role="alert"
      >
        No fue posible cargar los
        catálogos de segmentación.
      </div>
    );
  }

  return (
    <div className="role-segmentation">
      <p className="role-segmentation__role-name">
        <strong>Nombre:</strong>{' '}
        {roleName.trim() ||
          'Sin nombre'}
      </p>

      <fieldset className="role-segmentation__card">
        <legend className="role-segmentation__legend">
          Selecciona quién
          pertenecerá al rol:
        </legend>

        <MultiSelectField
          label="Ubicación"
          name="locationCodes"
          options={locations}
        />

        <MultiSelectField
          label="Departamento"
          name="departmentCodes"
          options={departments}
        />

        <MultiSelectField
          label="Puesto"
          name="jobFunctionCodes"
          options={jobFunctions}
        />
      </fieldset>
    </div>
  );
}