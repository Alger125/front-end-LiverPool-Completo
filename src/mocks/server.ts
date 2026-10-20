import { setupServer } from 'msw/node';
import { rolesPermissionsHandlers } from './roles-permissions.handlers.ts';

export const server = setupServer(...rolesPermissionsHandlers);
