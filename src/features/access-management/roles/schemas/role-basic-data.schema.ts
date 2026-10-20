import { z } from 'zod';

/** Solo obligatoriedad: longitudes min/max NO estan confirmadas (ambiguo #1). */
export const roleBasicDataSchema = z.object({
	name: z.string().trim().min(1, 'El nombre es obligatorio.'),
	description: z.string().trim().min(1, 'La descripción es obligatoria.'),
});

export type RoleBasicData = z.infer<typeof roleBasicDataSchema>;
