import { z } from 'zod';

import { roleBasicDataSchema } from './role-basic-data.schema';
import { rolePermissionsSchema } from './role-permissions.schema';

const roleSegmentationFieldsSchema = z.object({
  locationCodes: z.array(z.string().trim().min(1)),

  departmentCodes: z.array(z.string().trim().min(1)),

  jobFunctionCodes: z.array(z.string().trim().min(1)),
});

const roleScopeFieldsSchema = z.object({
  businessCodes: z.array(z.string().trim().min(1)),

  zoneCodes: z.array(z.string().trim().min(1)),

  scopeLocationCodes: z.array(z.string().trim().min(1)),

  canViewManagedLocations: z.boolean(),

  scopeDepartmentCodes: z.array(z.string().trim().min(1)),
});

export const createRoleSchema = roleBasicDataSchema
  .merge(roleSegmentationFieldsSchema)
  .merge(rolePermissionsSchema)
  .merge(roleScopeFieldsSchema)
  .superRefine((values, context) => {
    const hasSegmentation =
      values.locationCodes.length > 0 ||
      values.departmentCodes.length > 0 ||
      values.jobFunctionCodes.length > 0;

    if (!hasSegmentation) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona al menos una ubicación, departamento o puesto.',
        path: ['locationCodes'],
      });
    }

    const hasScope =
      values.businessCodes.length > 0 ||
      values.zoneCodes.length > 0 ||
      values.scopeLocationCodes.length > 0 ||
      values.scopeDepartmentCodes.length > 0;

    if (!hasScope) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona al menos un negocio, zona, ubicación o departamento.',
        path: ['businessCodes'],
      });
    }
  });

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

export type CreateRoleDraft = CreateRoleFormValues;

export function isCreateRoleDraftValid(draft: CreateRoleDraft): boolean {
  return createRoleSchema.safeParse(draft).success;
}

export function validateCreateRoleDraft(draft: CreateRoleDraft) {
  return createRoleSchema.safeParse(draft);
}
