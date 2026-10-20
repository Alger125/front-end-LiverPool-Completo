import { PermissionModuleGroup } from './PermissionModuleGroup';
import type { PermissionCatalogModule } from '../../model/permission-catalog.model';

interface PermissionMatrixProps {
	modules: PermissionCatalogModule[];
	selectedPermissionCodes: string[];
	onTogglePermission: (code: string) => void;
	onToggleModule?: (moduleCodes: string[], shouldSelect: boolean) => void;
}

/** Matriz agrupada por modulo; cada modulo se pinta con `PermissionModuleGroup`. */
export function PermissionMatrix({
	modules,
	selectedPermissionCodes,
	onTogglePermission,
	onToggleModule = () => {},
}: PermissionMatrixProps) {
	return (
		<div>
			{modules.map((module) => (
				<PermissionModuleGroup
					key={module.code}
					module={module}
					selectedPermissionCodes={selectedPermissionCodes}
					onToggleModule={onToggleModule}
					onTogglePermission={onTogglePermission}
				/>
			))}
		</div>
	);
}
