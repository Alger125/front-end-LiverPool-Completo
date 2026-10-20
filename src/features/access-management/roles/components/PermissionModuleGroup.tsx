import { useEffect, useRef } from 'react';

import type { PermissionCatalogModule } from '../../model/permission-catalog.model';

interface PermissionModuleGroupProps {
	module: PermissionCatalogModule;
	selectedPermissionCodes: string[];
	onTogglePermission: (code: string) => void;
	onToggleModule: (moduleCodes: string[], shouldSelect: boolean) => void;
}

/**
 * SUPUESTO TECNICO PENDIENTE DE VALIDACION: solo se listan permisos con
 * status ACTIVE (ambiguo #7). Los no asignables quedan deshabilitados y
 * jamas se seleccionan automaticamente, ni siquiera con "Seleccionar todos".
 */
export function PermissionModuleGroup({
	module,
	selectedPermissionCodes,
	onTogglePermission,
	onToggleModule,
}: PermissionModuleGroupProps) {
	const selectAllRef = useRef<HTMLInputElement>(null);
	const activePermissions = module.permissions.filter((permission) => permission.status === 'ACTIVE');
	const assignableCodes = activePermissions
		.filter((permission) => permission.assignable)
		.map((permission) => permission.code);
	const selectedAssignableCodes = assignableCodes.filter((code) => selectedPermissionCodes.includes(code));

	const isAllSelected = assignableCodes.length > 0 && selectedAssignableCodes.length === assignableCodes.length;
	const isIndeterminate = selectedAssignableCodes.length > 0 && !isAllSelected;

	useEffect(() => {
		if (selectAllRef.current) {
			selectAllRef.current.indeterminate = isIndeterminate;
		}
	}, [isIndeterminate]);

	return (
		<fieldset>
			<legend>{module.displayName}</legend>

			<label>
				<input
					ref={selectAllRef}
					checked={isAllSelected}
					disabled={assignableCodes.length === 0}
					type="checkbox"
					onChange={() => onToggleModule(assignableCodes, !isAllSelected)}
				/>
				{`Seleccionar todos los permisos de ${module.displayName}`}
			</label>

			{activePermissions.map((permission) => (
				<label key={permission.code}>
					<input
						checked={selectedPermissionCodes.includes(permission.code)}
						disabled={!permission.assignable}
						type="checkbox"
						onChange={() => onTogglePermission(permission.code)}
					/>
					{permission.displayName} ({permission.code})
				</label>
			))}
		</fieldset>
	);
}
