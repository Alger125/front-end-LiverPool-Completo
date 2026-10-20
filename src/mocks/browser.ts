import { setupWorker } from 'msw/browser';
import { rolesPermissionsHandlers } from './roles-permissions.handlers';

export const worker = setupWorker(...rolesPermissionsHandlers);
