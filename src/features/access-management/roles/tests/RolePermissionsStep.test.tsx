import '@testing-library/jest-dom/vitest';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  render,
  screen,
} from '@testing-library/react';
import { FormProvider } from 'react-hook-form';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { RolePermissionsStep } from '../components/RolePermissionsStep';
import { useRoleForm } from '../hooks/useRoleForm';

function RolePermissionsStepTestHarness() {
  const form = useRoleForm();

  return (
    <FormProvider {...form}>
      <RolePermissionsStep />
    </FormProvider>
  );
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderRolePermissionsStep() {
  const queryClient =
    createQueryClient();

  return render(
    <QueryClientProvider
      client={queryClient}
    >
      <RolePermissionsStepTestHarness />
    </QueryClientProvider>,
  );
}

describe('RolePermissionsStep', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(
    'renderiza el catálogo agrupado',
    async () => {
      renderRolePermissionsStep();

      const checkboxes =
        await screen.findAllByRole(
          'checkbox',
        );

      expect(
        checkboxes.length,
      ).toBeGreaterThan(0);

      expect(
        screen.queryByText(
          /no fue posible cargar el catálogo de permisos/i,
        ),
      ).not.toBeInTheDocument();
    },
  );
});