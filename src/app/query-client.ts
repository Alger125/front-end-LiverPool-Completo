import { QueryClient, type DefaultOptions } from '@tanstack/react-query';

/**
 * Conservative defaults for the whole app. `staleTime`, `gcTime`, and retry
 * counts below are SUPUESTOS TÉCNICOS PENDIENTES DE VALIDACIÓN, not confirmed
 * business requirements — adjust once product/infra guidance is available.
 */
const defaultOptions: DefaultOptions = {
	queries: {
		refetchOnWindowFocus: false,
		retry: 1,
		staleTime: 30_000,
	},
	mutations: {
		retry: false,
	},
};

export function createQueryClient(overrides?: DefaultOptions) {
	return new QueryClient({
		defaultOptions: {
			queries: { ...defaultOptions.queries, ...overrides?.queries },
			mutations: { ...defaultOptions.mutations, ...overrides?.mutations },
		},
	});
}

/** Singleton used by the running application. */
export const queryClient = createQueryClient();
