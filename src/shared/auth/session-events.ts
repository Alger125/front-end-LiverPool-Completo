const UNAUTHORIZED_EVENT = 'auth:unauthorized';

/**
 * A 401 must trigger global session handling, not an inline table error.
 * No AuthProvider exists yet — this is the single point where that wiring
 * (redirect to login, clear session, etc.) should attach once it does.
 */
export function emitUnauthorized(): void {
	window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}

export function onUnauthorized(handler: () => void): () => void {
	window.addEventListener(UNAUTHORIZED_EVENT, handler);
	return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
}
