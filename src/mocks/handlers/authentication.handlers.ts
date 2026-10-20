import { HttpResponse, delay, http } from 'msw';

/**
 * TEMPORARY handlers — no Roles OpenAPI contract has been retrieved yet.
 * Routes and payload shapes below are provisional and must be replaced
 * once the real contract is available. Centralized here on purpose so
 * that replacement is a single-file change.
 */

const ROLES_LOGIN_URL = '/api/auth/login';

/** Default scenario used by browser/server setup: successful login. */
const success = http.post(ROLES_LOGIN_URL, async () => {
	return HttpResponse.json({
		accessToken: 'mock-access-token',
		expiresInSeconds: 3600,
	});
});

export const authenticationHandlers = [success];

/** Scenario overrides — apply with `server.use(...)` inside a single test. */
export const authenticationScenarios = {
	unauthorized: http.post(ROLES_LOGIN_URL, () =>
		HttpResponse.json({ code: 'INVALID_CREDENTIALS' }, { status: 401 }),
	),
	serverError: http.post(ROLES_LOGIN_URL, () =>
		HttpResponse.json({ code: 'UNEXPECTED_ERROR' }, { status: 500 }),
	),
	slow: http.post(ROLES_LOGIN_URL, async () => {
		await delay('infinite');
	}),
};
