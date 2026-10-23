import { setupWorker } from 'msw/browser';
import { rolesPermissionsHandlers } from './roles-permissions.handlers';
import { previewHandlers } from './handlers/preview.handlers';

export const worker = setupWorker(...rolesPermissionsHandlers, ...previewHandlers);
