import type { ProblemDetails } from './api-error';

/**
 * UI-safe projection of ProblemDetails — never surfaces `instance`,
 * `correlationId`, or `errors[].rejectedValue` by default.
 */
export interface DisplayableError {
	title: string;
	detail: string;
	code: string;
	fieldErrors?: { field: string; message: string }[];
}

export function toDisplayableError(problem: ProblemDetails): DisplayableError {
	return {
		title: problem.title,
		detail: problem.detail,
		code: problem.code,
		fieldErrors: problem.errors?.map(({ field, message }) => ({ field, message })),
	};
}

/** Reserved for support tooling; expose only where UX/security explicitly authorize it. */
export function getSupportCorrelationId(problem: ProblemDetails): string {
	return problem.correlationId;
}
