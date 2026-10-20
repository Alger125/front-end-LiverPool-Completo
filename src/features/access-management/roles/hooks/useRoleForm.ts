import {
    zodResolver
} from '@hookform/resolvers/zod';import {
    useForm,
} from 'react-hook-form';

import {
    createRoleSchema,
} from '../schemas/create-role.schema';
import type {
    CreateRoleFormValues,
} from '../schemas/create-role.schema';

/**
 * Mantiene una sola instancia de ReactHook Form
 * para todo el wizard.
**
 * shouldUnregister: false conserva la información
 * aunque el paso deje de estar visible.
 */
export function useRoleForm() {
    return useForm<
        CreateRoleFormValues
    >({
        resolver:
        zodResolver(
            createRoleSchema,
        ),
        mode: 'onChange',

        reValidateMode:
            'onChange',

        shouldUnregister:
        false,

        defaultValues: {
            name: '',
            description: '',

            locationCodes: [],
            departmentCodes: [],
            jobFunctionCodes: [],

            permissionCodes: [],

            businessCodes: [],
            zoneCodes: [],
            scopeLocationCodes: [],
            canViewManagedLocations:
                false,
            scopeDepartmentCodes: [],
        },
    });
}