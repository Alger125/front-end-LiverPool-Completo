import type { RoleImpactResponse } from '../api/roles.api';

interface RoleImpactWarningProps {
	impact: RoleImpactResponse;
	roleCode: string;
	roleName: string;
}

export function RoleImpactWarning({
	impact,
	roleCode,
	roleName,
}: RoleImpactWarningProps) {
	const totalImpacted = impact.activeAssignments + impact.activeExceptions;

	return (
		<div className="role-impact-warning" role="region" aria-label="Impacto de eliminación">
			<div className="role-impact-warning__summary-grid">
				<div className="role-impact-warning__metric">
					<span className="role-impact-warning__metric-label">Rol seleccionado</span>
					<strong className="role-impact-warning__metric-value">
						{roleCode} · {roleName}
					</strong>
				</div>

				<div className="role-impact-warning__metric">
					<span className="role-impact-warning__metric-label">
						Usuarios impactados
					</span>
					<strong className="role-impact-warning__metric-count">
						{totalImpacted} {totalImpacted === 1 ? 'colaborador' : 'colaboradores'}
					</strong>
					<span className="role-impact-warning__metric-sub">
						{impact.activeAssignments} por regla · {impact.activeExceptions} por excepción
					</span>
				</div>
			</div>

			{impact.protected || !impact.canDelete ? (
				<div className="role-impact-warning__alert role-impact-warning__alert--blocked" role="alert">
					<strong>Eliminación bloqueada (Rol Protegido):</strong>
					<p>
						El rol no puede eliminarse porque pertenece a la configuración
						protegida de la plataforma.
					</p>
				</div>
			) : (
				<div className="role-impact-warning__alert role-impact-warning__alert--critical" role="alert">
					<strong>Advertencia crítica de seguridad:</strong>
					<p>
						Al confirmar la eliminación, los usuarios asociados perderán de
						inmediato los permisos otorgados exclusivamente por este rol y se
						revocarán las excepciones vinculadas.
					</p>
					{impact.warnings.length > 0 ? (
						<ul className="role-impact-warning__list">
							{impact.warnings.map((warning) => (
								<li key={warning}>{warning}</li>
							))}
						</ul>
					) : null}
				</div>
			)}
		</div>
	);
}
