import { useQuery } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '../../../../shared/feedback/EmptyState';
import { ErrorState } from '../../../../shared/feedback/ErrorState';
import { LoadingState } from '../../../../shared/feedback/LoadingState';
import { renderWithProviders } from '../../../../shared/testing';
import { rolesScenarios } from '../../../../mocks/roles-permissions.handlers';
import { server } from '../../../../mocks/server';


/**
 * Smoke test for the Query/MSW wiring using the provisional `/api/v1/roles`
 * handler. Not a Roles feature spec — replace once the real contract lands.
 */
interface ProbeRole {
  id: string;
  name: string;
}

function RolesProbe() {
  const query = useQuery<ProbeRole[]>({
    queryKey: ['roles-probe'],
    queryFn: async () => {
      const response = await fetch('/api/v1/roles');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data.items ?? []);
    },
  });


  if (query.status === 'pending') return <LoadingState />;
  if (query.status === 'error') return <ErrorState message={(query.error as Error).message} />;

  const roles = query.data ?? [];
  if (roles.length === 0) return <EmptyState />;

  return (
    <ul>
      {roles.map((role) => (
        <li key={role.id}>{role.name}</li>
      ))}
    </ul>
  );
}

describe('roles query + MSW wiring (smoke)', () => {
  it('lets a QueryClientProvider run a query against the success handler', async () => {
    renderWithProviders(<RolesProbe />);

    await waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());
  });

  it('returns an empty collection from the empty handler', async () => {
    server.use(rolesScenarios.empty);

    renderWithProviders(<RolesProbe />);

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
  });

  it('renders ErrorState on a 500 response', async () => {
    server.use(rolesScenarios.serverError);

    renderWithProviders(<RolesProbe />);

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('keeps LoadingState visible while the response is slow', async () => {
    server.use(rolesScenarios.slow);

    renderWithProviders(<RolesProbe />);

    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('uses an independent query client per test', () => {
    const { queryClient } = renderWithProviders(<RolesProbe />);

    expect(queryClient.getQueryData(['roles-probe'])).toBeUndefined();
  });
});
