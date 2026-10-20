import { useState, type FormEvent } from 'react';

import type { RoleSummary } from '../../../../generated/api';
import { appendAuditLogEntry, useSession } from '../../../../shared/auth';
import {
	createRoleException,
	EXCEPTION_LOCATIONS,
	searchCollaborators,
} from '../../api/exceptions.api';
import type {
	CollaboratorDirectoryEntry,
	RoleExceptionRecord,
} from '../../model/role-exception.model';

interface RoleExceptionFormProps {
	availableRoles: RoleSummary[];
	onCancel: () => void;
	onCreated: (record: RoleExceptionRecord) => void;
}

export function RoleExceptionForm({
	availableRoles,
	onCancel,
	onCreated,
}: RoleExceptionFormProps) {
	const session = useSession();

	const [searchTerm, setSearchTerm] = useState('');
	const [searchResults, setSearchResults] = useState<
		CollaboratorDirectoryEntry[]
	>(() => searchCollaborators(''));
	const [selectedCollaborator, setSelectedCollaborator] =
		useState<CollaboratorDirectoryEntry | null>(
			() => searchCollaborators('')[0] ?? null,
		);

	const activeRoles = availableRoles.filter((r) => r.status === 'ACTIVE');
	const [selectedRoleId, setSelectedRoleId] = useState<string>(
		activeRoles[0]?.id ?? '3d377584-c0c5-4391-b4f9-b11ae93f4bfd',
	);
	const [selectedLocationCode, setSelectedLocationCode] = useState<string>(
		EXCEPTION_LOCATIONS[0].code,
	);
	const [validFrom, setValidFrom] = useState('2026-10-20');
	const [validUntil, setValidUntil] = useState('2026-11-20');
	const [reason, setReason] = useState('');
	const [error, setError] = useState<string | null>(null);

	function handleSearchChange(value: string): void {
		setSearchTerm(value);
		setError(null);
		const matches = searchCollaborators(value);
		setSearchResults(matches);
		if (matches.length === 1) {
			setSelectedCollaborator(matches[0]);
		}
	}

	function handleSelectCollaborator(entry: CollaboratorDirectoryEntry): void {
		setSelectedCollaborator(entry);
		setError(null);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		setError(null);

		if (!selectedCollaborator) {
			setError(
				'Busca y selecciona un colaborador válido del directorio corporativo.',
			);
			return;
		}

		const roleObj =
			activeRoles.find((r) => r.id === selectedRoleId) ?? activeRoles[0];
		if (!roleObj) {
			setError('Selecciona un rol activo para otorgar por excepción.');
			return;
		}

		const locationObj =
			EXCEPTION_LOCATIONS.find((l) => l.code === selectedLocationCode) ??
			EXCEPTION_LOCATIONS[0];

		try {
			const created = createRoleException({
				collaboratorId: selectedCollaborator.id,
				roleId: roleObj.id,
				roleCode: roleObj.code,
				roleName: roleObj.name,
				locationCode: locationObj.code,
				locationName: locationObj.name,
				validFrom,
				validUntil,
				reason,
				actorName: session?.user.fullName ?? 'Administrador',
			});

			appendAuditLogEntry({
				action: 'ROLE_EXCEPTION_CREATED',
				actorId: session?.user.employeeNumber ?? 'EMP-900142',
				actorName: session?.user.fullName ?? 'Administrador',
				detail: `Asignó por excepción el rol ${created.roleName} en ${created.locationName} al colaborador ${created.collaboratorName} (${created.employeeNumber}) del ${created.validFrom} al ${created.validUntil}. Motivo: ${created.reason}`,
				module: 'SECURITY_ROLES',
				outcome: 'SUCCESS',
			});

			setReason('');
			onCreated(created);
		} catch (err: unknown) {
			setError(
				err instanceof Error
					? err.message
					: 'No fue posible registrar la asignación por excepción.',
			);
		}
	}

	return (
		<form className="exc-form" onSubmit={handleSubmit}>
			<div className="exc-form__section">
				<label
					className="exc-form__label"
					htmlFor="collaborator-search-input"
				>
					1. Buscar Colaborador (ID, número de empleado, nombre o correo) *
				</label>
				<div className="exc-form__search-row">
					<input
						className="exc-form__input"
						id="collaborator-search-input"
						onChange={(e) => handleSearchChange(e.target.value)}
						placeholder="Ej. EMP-884021, Roberto Méndez, mvega@liverpool.com.mx o EMP-009112 (Inactivo)"
						type="search"
						value={searchTerm}
					/>
				</div>

				{searchResults.length === 0 ? (
					<div className="exc-form__alert exc-form__alert--warning" role="alert">
						No se encontró ningún colaborador con el criterio capturado (FE-02).
					</div>
				) : (
					<div
						aria-label="Resultados de colaboradores"
						className="exc-form__collab-grid"
					>
						{searchResults.map((entry) => {
							const isSelected = selectedCollaborator?.id === entry.id;
							return (
								<button
									className={`exc-form__collab-card ${
										isSelected ? 'exc-form__collab-card--selected' : ''
									} ${
										entry.status === 'INACTIVE'
											? 'exc-form__collab-card--inactive'
											: ''
									}`}
									key={entry.id}
									onClick={() => handleSelectCollaborator(entry)}
									type="button"
								>
									<div className="exc-form__collab-top">
										<span className="exc-form__collab-emp">
											{entry.employeeNumber}
										</span>
										<span
											className={`exc-form__collab-status exc-form__collab-status--${entry.status.toLowerCase()}`}
										>
											{entry.status === 'ACTIVE' ? 'Activo' : 'Inactivo / Baja'}
										</span>
									</div>
									<strong className="exc-form__collab-name">
										{entry.fullName}
									</strong>
									<span className="exc-form__collab-meta">
										{entry.nominalPosition} · {entry.email}
									</span>
								</button>
							);
						})}
					</div>
				)}

				{selectedCollaborator?.status === 'INACTIVE' ? (
					<div className="exc-form__alert exc-form__alert--error" role="alert">
						<strong>Colaborador no elegible (FE-03):</strong> El colaborador{' '}
						{selectedCollaborator.fullName} ({selectedCollaborator.employeeNumber})
						se encuentra inactivo en el directorio corporativo y no puede
						recibir asignaciones por excepción.
					</div>
				) : null}
			</div>

			<div className="exc-form__fields-grid">
				<div className="exc-form__field">
					<label className="exc-form__label" htmlFor="exc-role-select">
						Rol a otorgar por excepción *
					</label>
					<select
						className="exc-form__select"
						id="exc-role-select"
						onChange={(e) => setSelectedRoleId(e.target.value)}
						value={selectedRoleId}
					>
						{activeRoles.map((role) => (
							<option key={role.id} value={role.id}>
								{role.name} ({role.code})
							</option>
						))}
					</select>
				</div>

				<div className="exc-form__field">
					<label className="exc-form__label" htmlFor="exc-location-select">
						Ubicación autorizada *
					</label>
					<select
						className="exc-form__select"
						id="exc-location-select"
						onChange={(e) => setSelectedLocationCode(e.target.value)}
						value={selectedLocationCode}
					>
						{EXCEPTION_LOCATIONS.map((loc) => (
							<option key={loc.code} value={loc.code}>
								{loc.name}
							</option>
						))}
					</select>
				</div>

				<div className="exc-form__field">
					<label className="exc-form__label" htmlFor="exc-valid-from">
						Vigencia: Fecha inicio *
					</label>
					<input
						className="exc-form__input"
						id="exc-valid-from"
						onChange={(e) => setValidFrom(e.target.value)}
						type="date"
						value={validFrom}
					/>
				</div>

				<div className="exc-form__field">
					<label className="exc-form__label" htmlFor="exc-valid-until">
						Vigencia: Fecha fin *
					</label>
					<input
						className="exc-form__input"
						id="exc-valid-until"
						onChange={(e) => setValidUntil(e.target.value)}
						type="date"
						value={validUntil}
					/>
				</div>

				<div className="exc-form__field exc-form__field--full">
					<label className="exc-form__label" htmlFor="exc-reason-input">
						Motivo obligatorio (Justificación para auditoría) *
					</label>
					<textarea
						className="exc-form__textarea"
						id="exc-reason-input"
						onChange={(e) => setReason(e.target.value)}
						placeholder="Describe el motivo operativo o de negocio que justifica esta asignación temporal (mínimo 10 caracteres)…"
						value={reason}
					/>
				</div>
			</div>

			{error ? (
				<div className="exc-form__alert exc-form__alert--error" role="alert">
					{error}
				</div>
			) : null}

			<div className="exc-form__actions">
				<button
					className="role-workspace__btn role-workspace__btn--secondary"
					onClick={onCancel}
					type="button"
				>
					Cancelar
				</button>
				<button
					className="role-workspace__btn role-workspace__btn--primary"
					disabled={selectedCollaborator?.status === 'INACTIVE'}
					type="submit"
				>
					Guardar asignación por excepción
				</button>
			</div>
		</form>
	);
}
