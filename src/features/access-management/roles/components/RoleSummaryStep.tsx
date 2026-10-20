import { useFormContext, useWatch } from 'react-hook-form';

import type { CreateRoleFormValues } from '../schemas/create-role.schema';

/** Lee del formulario compartido: si el usuario regresa y edita, esto se refleja de inmediato. */
export function RoleSummaryStep() {
	const { control, formState } = useFormContext<CreateRoleFormValues>();
	const values = useWatch({ control });

	return (
		<section>
			<dl>
				<dt>Nombre</dt>
				<dd>{values.name}</dd>
				<dt>Descripción</dt>
				<dd>{values.description}</dd>
				<dt>Permisos seleccionados</dt>
				<dd>{values.permissionCodes?.length ?? 0}</dd>
			</dl>
			{!formState.isValid ? (
				<p role="alert">
					La configuración es inválida: completa los datos del rol y selecciona al menos un
					permiso antes de continuar.
				</p>
			) : null}
		</section>
	);
}
