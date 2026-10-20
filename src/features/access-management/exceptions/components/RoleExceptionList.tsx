import type { RoleExceptionRecord } from '../../model/role-exception.model';

interface RoleExceptionListProps {
	exceptions: RoleExceptionRecord[];
	onRevoke: (record: RoleExceptionRecord) => void;
}

const STATUS_LABELS: Record<RoleExceptionRecord['status'], string> = {
	ACTIVE: 'Vigente',
	REVOKED: 'Revocada',
	EXPIRED: 'Expirada',
};

export function RoleExceptionList({
	exceptions,
	onRevoke,
}: RoleExceptionListProps) {
	if (exceptions.length === 0) {
		return (
			<p className="exc-list__empty">
				No existen asignaciones por excepción registradas actualmente.
			</p>
		);
	}

	return (
		<div className="roles-page__table-wrapper">
			<table className="roles-table">
				<thead>
					<tr>
						<th scope="col">Colaborador</th>
						<th scope="col">Puesto Nominal</th>
						<th scope="col">Rol Otorgado</th>
						<th scope="col">Ubicación</th>
						<th scope="col">Vigencia</th>
						<th scope="col">Motivo</th>
						<th scope="col">Estado</th>
						<th scope="col">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{exceptions.map((item) => (
						<tr key={item.id}>
							<td data-label="Colaborador">
								<div className="exc-list__collab-cell">
									<strong className="roles-table__name">
										{item.collaboratorName}
									</strong>
									<span className="exc-list__sub">
										{item.employeeNumber} · {item.collaboratorEmail}
									</span>
								</div>
							</td>
							<td data-label="Puesto Nominal">{item.nominalPosition}</td>
							<td data-label="Rol Otorgado">
								<span className="roles-table__code">{item.roleName}</span>
							</td>
							<td data-label="Ubicación">{item.locationName}</td>
							<td className="roles-table__date" data-label="Vigencia">
								{item.validFrom} → {item.validUntil}
							</td>
							<td className="roles-table__desc" data-label="Motivo">
								{item.reason}
								{item.revokedReason ? (
									<span className="exc-list__revoked-note">
										Revocada: {item.revokedReason}
									</span>
								) : null}
							</td>
							<td data-label="Estado">
								<span
									className={`roles-table__status ${
										item.status === 'ACTIVE'
											? 'roles-table__status--active'
											: 'roles-table__status--deleted'
									}`}
								>
									{STATUS_LABELS[item.status]}
								</span>
							</td>
							<td className="roles-table__actions-cell" data-label="Acciones">
								{item.status === 'ACTIVE' ? (
									<button
										className="roles-table__action-btn roles-table__action-btn--danger"
										onClick={() => onRevoke(item)}
										type="button"
									>
										Revocar
									</button>
								) : (
									<span className="exc-list__sub">Finalizada</span>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
