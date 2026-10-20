import {
	type RoleSortField,
	type RoleSortParam,
	type RoleSummary,
} from '../../../../generated/api';
import {
	PermissionGuard,
	type GrantedPermissions,
} from '../../../../shared/permissions';
import { formatDateTime } from '../../../../shared/utils';
import { SECURITY_PERMISSION_CODES } from '../../model/permission.model';
import {
	formatResultingRule,
	getRoleExtendedMetadata,
} from '../api/roles.api';

const ROLE_STATUS_LABELS: Record<RoleSummary['status'], string> = {
	ACTIVE: 'Activo',
	INACTIVE: 'Inactivo',
	DELETED: 'Eliminado',
};

function toggleSort(
	current: RoleSortParam,
	field: RoleSortField,
): RoleSortParam {
	const [currentField, currentDirection] = current.split(',') as [
		RoleSortField,
		'asc' | 'desc',
	];
	if (currentField !== field) {
		return `${field},asc`;
	}
	return `${field},${currentDirection === 'asc' ? 'desc' : 'asc'}`;
}

interface SortableHeaderProps {
	field: RoleSortField;
	label: string;
	sort: RoleSortParam;
	onSortChange: (sort: RoleSortParam) => void;
}

function SortableHeader({
	field,
	label,
	sort,
	onSortChange,
}: SortableHeaderProps) {
	const [currentField, currentDirection] = sort.split(',') as [
		RoleSortField,
		'asc' | 'desc',
	];
	const isActive = currentField === field;

	return (
		<th
			aria-sort={
				isActive
					? currentDirection === 'asc'
						? 'ascending'
						: 'descending'
					: 'none'
			}
			scope="col"
		>
			<button
				className={`roles-table__sort-btn ${
					isActive ? 'roles-table__sort-btn--active' : ''
				}`}
				onClick={() => onSortChange(toggleSort(sort, field))}
				type="button"
			>
				<span>{label}</span>
				<span aria-hidden="true" className="roles-table__sort-icon">
					{isActive ? (currentDirection === 'asc' ? '▲' : '▼') : '↕'}
				</span>
			</button>
		</th>
	);
}

interface RoleTableProps {
	roles: RoleSummary[];
	grantedPermissions?: GrantedPermissions;
	sort: RoleSortParam;
	onSortChange: (sort: RoleSortParam) => void;
	onView?: (role: RoleSummary) => void;
	onEdit?: (role: RoleSummary) => void;
	onDelete?: (role: RoleSummary) => void;
}

export function RoleTable({
	roles,
	grantedPermissions,
	sort,
	onSortChange,
	onView,
	onEdit,
	onDelete,
}: RoleTableProps) {
	return (
		<div className="roles-page__table-wrapper">
			<table className="roles-table">
				<thead>
					<tr>
						<SortableHeader
							field="code"
							label="ID / Código"
							onSortChange={onSortChange}
							sort={sort}
						/>
						<SortableHeader
							field="name"
							label="Nombre"
							onSortChange={onSortChange}
							sort={sort}
						/>
						<th scope="col">Descripción</th>
						<th scope="col">Regla de Alcance</th>
						<th scope="col">Permisos</th>
						<SortableHeader
							field="status"
							label="Estado"
							onSortChange={onSortChange}
							sort={sort}
						/>
						<SortableHeader
							field="updatedAt"
							label="Última modificación"
							onSortChange={onSortChange}
							sort={sort}
						/>
						<th scope="col">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{roles.map((role) => {
						const metadata = getRoleExtendedMetadata(role.id, role.code);
						const ruleSummary = formatResultingRule(metadata.conditions);

						return (
							<tr key={role.id}>
								<td data-label="ID / Código">
									<span className="roles-table__code">{role.code}</span>
								</td>
								<td data-label="Nombre">
									<div className="roles-table__name-wrap">
										<strong className="roles-table__name">{role.name}</strong>
										{role.protected ? (
											<span className="roles-table__protected-badge">
												Protegido
											</span>
										) : null}
									</div>
								</td>
								<td className="roles-table__desc" data-label="Descripción">
									{role.description ?? 'Sin descripción'}
								</td>
								<td className="roles-table__rule-cell" data-label="Regla de Alcance">
									<span className="roles-table__rule-chip" title={ruleSummary}>
										{ruleSummary}
									</span>
								</td>
								<td className="roles-table__count-cell" data-label="Permisos">
									<span className="roles-table__count-badge">
										{role.permissionCount}
									</span>
								</td>
								<td data-label="Estado">
									<span
										className={`roles-table__status roles-table__status--${role.status.toLowerCase()}`}
									>
										{ROLE_STATUS_LABELS[role.status]}
									</span>
								</td>
								<td className="roles-table__date" data-label="Última modificación">
									{formatDateTime(role.updatedAt)}
								</td>
								<td className="roles-table__actions-cell" data-label="Acciones">
									<div className="roles-table__actions">
										<PermissionGuard
											grantedPermissions={grantedPermissions}
											requiredPermission={SECURITY_PERMISSION_CODES.ROLE_VIEW}
										>
											<button
												className="roles-table__action-btn"
												onClick={() => onView?.(role)}
												type="button"
											>
												Ver
											</button>
										</PermissionGuard>
										<PermissionGuard
											grantedPermissions={grantedPermissions}
											requiredPermission={SECURITY_PERMISSION_CODES.ROLE_UPDATE}
										>
											<button
												className="roles-table__action-btn"
												disabled={role.status === 'DELETED'}
												onClick={() => onEdit?.(role)}
												type="button"
											>
												Editar
											</button>
										</PermissionGuard>
										<PermissionGuard
											grantedPermissions={grantedPermissions}
											requiredPermission={SECURITY_PERMISSION_CODES.ROLE_DELETE}
										>
											<button
												className="roles-table__action-btn roles-table__action-btn--danger"
												disabled={role.status === 'DELETED'}
												onClick={() => onDelete?.(role)}
												type="button"
											>
												Eliminar
											</button>
										</PermissionGuard>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
