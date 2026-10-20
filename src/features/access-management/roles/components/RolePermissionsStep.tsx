import { useController, useFormContext } from 'react-hook-form';

import { usePermissionCatalogQuery } from '../../api/permissions.queries';
import { PermissionMatrix } from './PermissionMatrix';
import type { CreateRoleFormValues } from '../schemas/create-role.schema';
import { EmptyState } from '../../../../shared/feedback/EmptyState';
import { ErrorState } from '../../../../shared/feedback/ErrorState';
import { LoadingState } from '../../../../shared/feedback/LoadingState';

export function RolePermissionsStep() {
	const { control, formState } = useFormContext<CreateRoleFormValues>();
	const { field } = useController({ control, name: 'permissionCodes' });
	const catalogQuery = usePermissionCatalogQuery();

	if (catalogQuery.status === 'pending') {
		return <LoadingState label="Cargando catálogo de permisos…" />;
	}

	if (catalogQuery.status === 'error') {
		return (
			<ErrorState message="No fue posible cargar el catálogo de permisos.">
				<button type="button" onClick={() => catalogQuery.refetch()}>
					Reintentar
				</button>
			</ErrorState>
		);
	}

	if (catalogQuery.data.modules.length === 0) {
		return <EmptyState message="El catálogo de permisos está vacío." />;
	}

	function toggleOne(code: string) {
		field.onChange(
			field.value.includes(code)
				? field.value.filter((existing) => existing !== code)
				: [...field.value, code],
		);
	}

	function toggleModule(moduleCodes: string[], shouldSelect: boolean) {
		field.onChange(
			shouldSelect
				? Array.from(new Set([...field.value, ...moduleCodes]))
				: field.value.filter((code) => !moduleCodes.includes(code)),
		);
	}

	return (
		<fieldset>
			<legend>Permisos</legend>
			<PermissionMatrix
				modules={catalogQuery.data.modules}
				selectedPermissionCodes={field.value}
				onToggleModule={toggleModule}
				onTogglePermission={toggleOne}
			/>
			{formState.errors.permissionCodes ? (
				<p role="alert">{formState.errors.permissionCodes.message}</p>
			) : null}
		</fieldset>
	);
}
