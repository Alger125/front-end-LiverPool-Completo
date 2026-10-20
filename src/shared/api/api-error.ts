/** RFC 9457 Problem Details (`application/problem+json`). */
export interface ProblemDetailsFieldError {
	field: string;
	message: string;
	rejectedValue?: unknown;
}

export interface ProblemDetails {
	type: string;
	title: string;
	status: number;
	detail: string;
	instance: string;
	code: string;
	timestamp: string;
	correlationId: string;
	errors?: ProblemDetailsFieldError[];
}

export class ApiError extends Error {
	readonly status: number;
	/** Full ProblemDetails payload; undefined when the server didn't return one. */
	readonly problem?: ProblemDetails;

	constructor(status: number, message?: string, problem?: ProblemDetails) {
		super(message ?? `HTTP ${status}`);
		this.name = 'ApiError';
		this.status = status;
		this.problem = problem;
	}
}
