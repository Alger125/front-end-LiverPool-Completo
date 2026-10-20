import { describe, expect, it } from 'vitest';

import {
  isCreateRoleDraftValid,
  validateCreateRoleDraft,
  type CreateRoleDraft,
} from '../schemas/create-role.schema';

function buildDraft(overrides: Partial<CreateRoleDraft> = {}): CreateRoleDraft {
  return {
    name: 'Administrador de estructuras',
    description: 'Administra grupos y secciones.',
    locationCodes: ['LOC-001'],
    departmentCodes: ['DEP-001'],
    jobFunctionCodes: ['JOB-001'],
    permissionCodes: ['ROLE_VIEW'],
    businessCodes: ['BUS-001'],
    zoneCodes: ['ZONE-001'],
    scopeLocationCodes: ['LOC-001'],
    canViewManagedLocations: true,
    scopeDepartmentCodes: ['DEP-001'],
    ...overrides,
  };
}

describe('createRoleSchema', () => {
  it('acepta un Rol válido', () => {
    const draft = buildDraft();

    expect(isCreateRoleDraftValid(draft)).toBe(true);
  });

  it('rechaza un nombre vacío', () => {
    const result = validateCreateRoleDraft(
      buildDraft({
        name: '',
      })
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      expect(errors.name).toBeDefined();
    }
  });

  it('rechaza una descripción vacía', () => {
    const result = validateCreateRoleDraft(
      buildDraft({
        description: '',
      })
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      expect(errors.description).toBeDefined();
    }
  });

  it('requiere al menos un permiso', () => {
    const result = validateCreateRoleDraft(
      buildDraft({
        permissionCodes: [],
      })
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      expect(errors.permissionCodes).toBeDefined();
    }
  });
});
