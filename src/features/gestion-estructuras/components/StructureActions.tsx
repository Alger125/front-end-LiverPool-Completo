import { useNavigate } from 'react-router-dom';

import { structureDepartmentGroupsPath } from '../../../app/config/routes';
import {
	EditIcon,
	HistoryIcon,
	PlusIcon,
} from '../../../shared/components/AppIcons';
import type {
	OperationsChild,
	StructureNode,
	StructureSummary,
} from '../types/gestionEstructuras.types';

type ActionItem = StructureNode | StructureSummary | OperationsChild;

interface StructureActionsProps {
	item: ActionItem;
	mode: 'operations' | 'corporate';
	onEdit?: (item: ActionItem) => void;
	onHistory?: (item: ActionItem) => void;
}

export function StructureActions({
	item,
	mode,
	onEdit,
	onHistory,
}: StructureActionsProps) {
	const navigate = useNavigate();

	const nivel = 'nivel' in item ? item.nivel : undefined;

	function navigateToDepartmentGroups(groupId?: string): void {
		const deptId =
			('parentDepartmentId' in item && item.parentDepartmentId) || item.id;
		const deptName =
			('parentDepartmentName' in item && item.parentDepartmentName) ||
			item.nombre;
		const base = structureDepartmentGroupsPath(deptId);
		const params = new URLSearchParams({
			deptName,
			manager: item.responsable,
			origin: mode,
		});
		if (groupId) {
			params.set('groupId', groupId);
		}
		navigate(`${base}?${params.toString()}`);
	}

	if (
		nivel === 'departamento' ||
		nivel === 'coordinacion' ||
		(mode === 'operations' && !nivel)
	) {
		return (
			<div className="ge-actions">
				<button
					aria-label={`Administrar grupos de ${item.nombre}`}
					className="ge-action-button"
					onClick={(event) => {
						event.stopPropagation();
						navigateToDepartmentGroups();
					}}
					title="Administrar grupos y secciones"
					type="button"
				>
					<PlusIcon />
				</button>

				<button
					aria-label={`Ver historial de ${item.nombre}`}
					className="ge-action-button"
					onClick={(event) => {
						event.stopPropagation();
						onHistory?.(item);
					}}
					title="Consultar bitácora de movimientos"
					type="button"
				>
					<HistoryIcon />
				</button>
			</div>
		);
	}

	if (nivel === 'grupo') {
		return (
			<div className="ge-actions">
				<button
					aria-label={`Editar ${item.nombre}`}
					className="ge-action-button"
					onClick={(event) => {
						event.stopPropagation();
						if (onEdit) {
							onEdit(item);
						} else {
							navigateToDepartmentGroups(item.id);
						}
					}}
					title="Editar secciones del grupo"
					type="button"
				>
					<EditIcon />
				</button>

				<button
					aria-label={`Ver historial de ${item.nombre}`}
					className="ge-action-button"
					onClick={(event) => {
						event.stopPropagation();
						onHistory?.(item);
					}}
					title="Consultar bitácora del grupo"
					type="button"
				>
					<HistoryIcon />
				</button>
			</div>
		);
	}

	return null;
}