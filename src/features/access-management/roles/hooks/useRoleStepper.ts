import {
    useState,
} from 'react';

import type {
    CreateRoleFormValues,
} from '../schemas/create-role.schema';

export type RoleStepId =
    | 'basic-data'
    | 'segmentation'
    | 'permissions'
    | 'scope';

export interface RoleStep {
    id: RoleStepId;
    label: string;
    fields: Array<
        keyof CreateRoleFormValues
    >;
}

export const ROLE_STEPS:
    RoleStep[] = [
        {
            id: 'basic-data',
            label:
                'Datos del rol',
            fields: [
                'name',
                'description',
            ],
        },
        {
            id: 'segmentation',
            label:
                'Segmentación',
            fields: [
                'locationCodes',
                'departmentCodes',
                'jobFunctionCodes',
            ],
        },
        {
            id: 'permissions',
            label: 'Permisos',
            fields: [
                'permissionCodes',
            ],
        },
        {
            id: 'scope',
            label: 'Alcance',
            fields: [
                'businessCodes',
                'zoneCodes',
                'scopeLocationCodes',
                'canViewManagedLocations',
                'scopeDepartmentCodes',
            ],
        },
    ];

export function useRoleStepper(
    steps:
        readonly RoleStep[] =
        ROLE_STEPS,
) {
    const [
        stepIndex,
        setStepIndex,
    ] = useState(0);

    const [
        furthestStepIndex,
        setFurthestStepIndex,
    ] = useState(0);

    const currentStep =
        steps[stepIndex];

    const isLastStep =
        stepIndex ===
        steps.length - 1;

    function advance(): void {
        const nextIndex =
            Math.min(
                stepIndex + 1,
                steps.length - 1,
            );

        setStepIndex(
            nextIndex,
        );

        setFurthestStepIndex(
            (current) =>
                Math.max(
                    current,
                    nextIndex,
                ),
        );
    }

    function goBack(): void {
        setStepIndex(
            (current) =>
                Math.max(
                    current - 1,
                    0,
                ),
        );
    }

    function goToStep(
        targetIndex: number,
    ): void {
        if (
            targetIndex <=
            furthestStepIndex
        ) {
            setStepIndex(
                targetIndex,
            );
        }
    }

    function goToStepIndex(
        targetIndex: number,
    ): void {
        const safeIndex =
            Math.max(
                0,
                Math.min(
                    targetIndex,
                    steps.length - 1,
                ),
            );

        setStepIndex(
            safeIndex,
        );
    }

    return {
        steps,
        stepIndex,
        currentStep,
        isLastStep,
        furthestStepIndex,
        advance,
        goBack,
        goToStep,
        goToStepIndex,
    };
}