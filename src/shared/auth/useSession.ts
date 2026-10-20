import { useSyncExternalStore } from 'react';

import {
	getStoredSession,
	subscribeToSessionChanges,
} from './auth-storage';
import type { SessionData } from './auth.types';

let cachedRawSnapshot = '';
let cachedSessionSnapshot: SessionData | null = null;

function getSessionSnapshot(): SessionData | null {
	const current = getStoredSession();
	const serialized = current ? JSON.stringify(current) : '';
	if (serialized !== cachedRawSnapshot) {
		cachedRawSnapshot = serialized;
		cachedSessionSnapshot = current;
	}
	return cachedSessionSnapshot;
}

export function useSession(): SessionData | null {
	return useSyncExternalStore(
		subscribeToSessionChanges,
		getSessionSnapshot,
		getSessionSnapshot,
	);
}
