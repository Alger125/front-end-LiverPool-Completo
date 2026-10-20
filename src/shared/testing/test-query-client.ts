import { QueryClient } from '@tanstack/react-query';

/**
 * Fresh, isolated client per test case: no retries and no cache persisted
 * across tests, per the "one client per test" rule for Query/MSW tests.
 */
export function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0, staleTime: 0 },
			mutations: { retry: false },
		},
	});
}
