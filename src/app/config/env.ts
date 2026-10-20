/**
 * `VITE_ENABLE_MSW` is a technical proposal, not a confirmed business requirement.
 */
export const env = {
	enableMsw: import.meta.env.VITE_ENABLE_MSW === 'true',
	/** Confirmed local server base: http://localhost:3000/api/v1. Kept configurable. */
	apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
	devApiKey:
		import.meta.env.VITE_DEV_API_KEY ?? 'dev-api-key-zdeptos-2026',
} as const;
