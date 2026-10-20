import { env } from '../../app/config/env';
import { ApiError, type ProblemDetails } from './api-error';

type SearchParamValue = string | number | boolean | undefined;

function buildQueryString(searchParams?: Record<string, SearchParamValue>): string {
	if (!searchParams) {
		return '';
	}

	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(searchParams)) {
		if (value !== undefined && value !== '') {
			params.set(key, String(value));
		}
	}

	const query = params.toString();
	return query ? `?${query}` : '';
}

export function buildAuthHeaders(
	extraHeaders?: Record<string, string | undefined>,
): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: 'application/json',
		'x-dev-api-key': env.devApiKey,
	};

	try {
		if (typeof window !== 'undefined' && window.localStorage) {
			const rawSession = window.localStorage.getItem('zdeptos.auth.session.v1');
			if (rawSession) {
				const parsed = JSON.parse(rawSession) as {
					accessToken?: string;
					sessionId?: string;
				};
				if (parsed.sessionId) {
					headers['x-session-id'] = parsed.sessionId;
				}
				// If a real JWT (3 dot-separated segments) is stored, also attach Bearer
				if (
					parsed.accessToken &&
					parsed.accessToken.split('.').length === 3
				) {
					headers.Authorization = `Bearer ${parsed.accessToken}`;
				}
			}
		}
	} catch {
		// Ignore localStorage access errors in test environments
	}

	if (extraHeaders) {
		for (const [k, v] of Object.entries(extraHeaders)) {
			if (v !== undefined) {
				headers[k] = v;
			}
		}
	}

	return headers;
}

async function parseErrorPayload(
	response: Response,
): Promise<ProblemDetails | undefined> {
	const contentType = response.headers.get('content-type') ?? '';
	if (
		!contentType.includes('application/problem+json') &&
		!contentType.includes('application/json')
	) {
		return undefined;
	}

	try {
		const data = (await response.json()) as Record<string, unknown>;
		return {
			type: typeof data.type === 'string' ? data.type : 'about:blank',
			title: String(data.title ?? data.error ?? 'Error'),
			status: typeof data.status === 'number' ? data.status : response.status,
			detail: Array.isArray(data.message)
				? data.message.join(', ')
				: String(data.detail ?? data.message ?? `HTTP ${response.status}`),
			instance: typeof data.instance === 'string' ? data.instance : '',
			code: typeof data.code === 'string' ? data.code : 'ERROR',
			timestamp:
				typeof data.timestamp === 'string'
					? data.timestamp
					: new Date().toISOString(),
			correlationId:
				typeof data.correlationId === 'string' ? data.correlationId : '',
			errors: Array.isArray(data.errors) ? data.errors : undefined,
		};
	} catch {
		return undefined;
	}
}

/**
 * `env.apiBaseUrl` (default `/api/v1`) is the single place holding the API
 * prefix — services must pass only their resource path, never the full URL.
 */
export async function httpGet<T>(
	path: string,
	searchParams?: Record<string, SearchParamValue>,
): Promise<T> {
	const response = await fetch(
		`${env.apiBaseUrl}${path}${buildQueryString(searchParams)}`,
		{
			headers: buildAuthHeaders(),
		},
	);

	if (!response.ok) {
		const problem = await parseErrorPayload(response);
		throw new ApiError(response.status, problem?.detail, problem);
	}

	return response.json() as Promise<T>;
}

export async function httpPost<T>(
	path: string,
	body?: unknown,
	extraHeaders?: Record<string, string | undefined>,
): Promise<T> {
	const response = await fetch(`${env.apiBaseUrl}${path}`, {
		method: 'POST',
		headers: buildAuthHeaders({
			'Content-Type': 'application/json',
			...extraHeaders,
		}),
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const problem = await parseErrorPayload(response);
		throw new ApiError(response.status, problem?.detail, problem);
	}

	if (response.status === 204) {
		return undefined as unknown as T;
	}

	return response.json() as Promise<T>;
}

export async function httpPut<T>(
	path: string,
	body?: unknown,
	extraHeaders?: Record<string, string | undefined>,
): Promise<T> {
	const response = await fetch(`${env.apiBaseUrl}${path}`, {
		method: 'PUT',
		headers: buildAuthHeaders({
			'Content-Type': 'application/json',
			...extraHeaders,
		}),
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const problem = await parseErrorPayload(response);
		throw new ApiError(response.status, problem?.detail, problem);
	}

	return response.json() as Promise<T>;
}

export async function httpPatch<T>(
	path: string,
	body?: unknown,
	extraHeaders?: Record<string, string | undefined>,
): Promise<T> {
	const response = await fetch(`${env.apiBaseUrl}${path}`, {
		method: 'PATCH',
		headers: buildAuthHeaders({
			'Content-Type': 'application/json',
			...extraHeaders,
		}),
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const problem = await parseErrorPayload(response);
		throw new ApiError(response.status, problem?.detail, problem);
	}

	return response.json() as Promise<T>;
}

export async function httpDelete<T = void>(
	path: string,
	body?: unknown,
	extraHeaders?: Record<string, string | undefined>,
): Promise<T> {
	const response = await fetch(`${env.apiBaseUrl}${path}`, {
		method: 'DELETE',
		headers: buildAuthHeaders({
			...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
			...extraHeaders,
		}),
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const problem = await parseErrorPayload(response);
		throw new ApiError(response.status, problem?.detail, problem);
	}

	if (response.status === 204) {
		return undefined as unknown as T;
	}

	return response.json() as Promise<T>;
}

