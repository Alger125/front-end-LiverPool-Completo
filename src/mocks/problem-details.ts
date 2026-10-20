import { HttpResponse } from 'msw';

import type { ProblemDetails } from '../shared/api/api-error';

let sequence = 0;

type ProblemOverrides = Partial<ProblemDetails> & Pick<ProblemDetails, 'title' | 'code'>;

/** Builds a `application/problem+json` mock response with all required fields. */
export function problemResponse(status: number, overrides: ProblemOverrides) {
	sequence += 1;

	const body: ProblemDetails = {
		type: 'about:blank',
		status,
		instance: '/api/v1/roles',
		timestamp: new Date().toISOString(),
		correlationId: `mock-correlation-${sequence}`,
		detail: overrides.detail ?? overrides.title,
		...overrides,
	};

	return HttpResponse.json(body, {
		status,
		headers: { 'Content-Type': 'application/problem+json' },
	});
}
