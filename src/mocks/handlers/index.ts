import { rolesPermissionsHandlers } from '../roles-permissions.handlers';
import { authenticationHandlers } from './authentication.handlers';

/**
 * Default handlers wired into both the browser worker and the Node server.
 * Only the "happy path" per resource lives here; error/edge scenarios are
 * exported from each `*.handlers.ts` file and applied per-test via `server.use(...)`.
 */
export const handlers = [...authenticationHandlers, ...rolesPermissionsHandlers];
