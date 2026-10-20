import { useFormContext } from 'react-hook-form';

import type { CreateRoleFormValues } from '../schemas/create-role.schema';
import { FormField } from '../../../../shared/forms/FormField';

export function RoleBasicDataStep() {
	const { register, formState } = useFormContext<CreateRoleFormValues>();

	return (
		<fieldset>
			<legend>Datos del rol</legend>

			<FormField error={formState.errors.name} id="name" label="Nombre">
				<input id="name" {...register('name')} />
			</FormField>

			<FormField error={formState.errors.description} id="description" label="Descripción">
				<textarea id="description" {...register('description')} />
			</FormField>
		</fieldset>
	);
}
