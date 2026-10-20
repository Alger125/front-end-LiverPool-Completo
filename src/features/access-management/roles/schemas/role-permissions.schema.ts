import { z } from 'zod';

/** Un rol requiere al menos un permiso; los permisos son positivos y acumulativos (no hay DENY). */
export const rolePermissionsSchema = z.object({
	permissionCodes: z.array(z.string()).min(1, 'Selecciona al menos un permiso.'),
});
