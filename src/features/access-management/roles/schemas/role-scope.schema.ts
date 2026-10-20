import { z } from 'zod';

/**
 * SUPUESTO TÉCNICO PENDIENTE DE VALIDACIÓN:
 *
 * Los nombres de estos campos deben alinearse con el
 * contrato OpenAPI definitivo de creación de roles.
 */
export const roleScopeSchema = z
    .object({
        businessCodes: z.array(
            z.string().trim().min(1),
        ),

        zoneCodes: z.array(
            z.string().trim().min(1),
        ),

        scopeLocationCodes:
            z.array(
                z.string()
                    .trim()
                    .min(1),
            ),

        canViewManagedLocations:
            z.boolean(),

        scopeDepartmentCodes:
            z.array(
                z.string()
                    .trim()
                    .min(1),
            ),
    })
    .superRefine(
       (
            values,
            context,
        ) => {
            const hasScope =
                values.businessCodes
                    .length > 0 ||
                values.zoneCodes.length >
                    0 ||
                values
                    .scopeLocationCodes
                    .length > 0 ||
                values
                    .scopeDepartmentCodes
                    .length > 0;

            if (!hasScope) {
                context.addIssue({
                    code:
                        z.ZodIssueCode
                        .custom,
                    message:
                        'Selecciona al menos un negocio, zona, ubicación o departamento.',
                    path: [
                        'businessCodes',
                    ]
                });
            }
        },
    );

export type RoleScopeValues =
    z.infer<
        typeof roleScopeSchema
    >;