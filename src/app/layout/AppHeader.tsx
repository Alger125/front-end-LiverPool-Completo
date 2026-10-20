import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
	getHasUnsavedChanges,
	setHasUnsavedChanges,
	useSession,
} from '../../shared/auth';
import { APP_ROUTES } from '../config/routes';

import './AppHeader.css';

interface AppHeaderProps {
	displayName?: string;
	onSignOut?: () => void;
	onExpireSession?: () => void;
	onToggleSidebar?: () => void;
}

export function AppHeader({
	displayName,
	onSignOut,
	onExpireSession,
	onToggleSidebar,
}: AppHeaderProps) {
	const navigate = useNavigate();
	const session = useSession();

	const [searchTerm, setSearchTerm] = useState('');
	const [menuOpen, setMenuOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [simulateDirty, setSimulateDirty] = useState(getHasUnsavedChanges());

	const user = session?.user;
	const resolvedName = displayName?.trim() || user?.fullName || 'Arturo Ocampo';
	const resolvedRole = user?.primaryRoleName ?? 'Administrador de seguridad';
	const resolvedInitials =
		user?.initials ||
		resolvedName
			.split(' ')
			.map((part) => part.charAt(0))
			.join('')
			.slice(0, 2)
			.toUpperCase() ||
		'AO';

	function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		const trimmed = searchTerm.trim();
		if (trimmed.length > 0) {
			navigate(`${APP_ROUTES.globalSearch}?q=${encodeURIComponent(trimmed)}`);
		} else {
			navigate(APP_ROUTES.globalSearch);
		}
	}

	function handleToggleDirty(): void {
		const next = !simulateDirty;
		setSimulateDirty(next);
		setHasUnsavedChanges(next);
	}

	return (
		<header className="app-header">
			<div className="app-header__left">
				<button
					aria-label="Abrir o cerrar menú lateral"
					className="app-header__menu-toggle"
					onClick={onToggleSidebar}
					type="button"
				>
					☰
				</button>

				<Link className="app-header__brand-group" to={APP_ROUTES.home}>
					<span className="app-header__liverpool">Liverpool</span>
					<span className="app-header__solution-name">
						Gestión de Estructuras Comerciales
					</span>
				</Link>
			</div>

			<div className="app-header__right">
				<form
					aria-label="Búsqueda global rápida"
					className="app-header__search-form"
					onSubmit={handleSearchSubmit}
					role="search"
				>
					<span aria-hidden="true" className="app-header__search-icon">
						🔍
					</span>
					<input
						aria-label="Buscar departamento, colaborador o ID"
						className="app-header__search-input"
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Buscar"
						type="search"
						value={searchTerm}
					/>
				</form>

				<button
					className="app-header__help-btn"
					onClick={() => {
						setHelpOpen((prev) => !prev);
						setMenuOpen(false);
					}}
					type="button"
				>
					Ayuda
				</button>

				<div className="app-header__profile-wrapper">
					<button
						aria-expanded={menuOpen}
						aria-haspopup="menu"
						className="app-header__profile-trigger"
						onClick={() => {
							setMenuOpen((prev) => !prev);
							setHelpOpen(false);
						}}
						type="button"
					>
						<span aria-hidden="true" className="app-header__avatar">
							{resolvedInitials}
						</span>
						<span className="app-header__user-name">{resolvedName} ▾</span>
					</button>

					{menuOpen ? (
						<div
							aria-label="Menú de sesión de usuario"
							className="app-header__dropdown"
							role="menu"
						>
							<p className="app-header__dropdown-name">{resolvedName}</p>
							<p className="app-header__dropdown-role">{resolvedRole}</p>

							<hr className="app-header__dropdown-divider" />

							<button
								className="app-header__dropdown-item"
								onClick={() => {
									setProfileOpen((prev) => !prev);
								}}
								role="menuitem"
								type="button"
							>
								<span>Mi perfil</span>
								<span aria-hidden="true">›</span>
							</button>

							{profileOpen && user ? (
								<div
									style={{
										padding: '8px 10px',
										margin: '6px 0',
										backgroundColor: '#f8f5fc',
										borderRadius: '8px',
										fontSize: '12px',
										color: '#3b3446',
										lineHeight: 1.45,
									}}
								>
									<div>
										<strong>ID Usuario:</strong> {user.userId}
									</div>
									<div>
										<strong>No. Empleado:</strong> {user.employeeNumber}
									</div>
									<div>
										<strong>Correo:</strong> {user.email}
									</div>
									<div>
										<strong>Ubicación:</strong> {user.location}
									</div>
									<div>
										<strong>Roles:</strong> {user.activeRoleCodes.join(', ')}
									</div>
								</div>
							) : null}

							<label
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									padding: '6px 10px',
									fontSize: '12px',
									color: '#4e4759',
									cursor: 'pointer',
								}}
							>
								<input
									checked={simulateDirty}
									onChange={handleToggleDirty}
									type="checkbox"
								/>
								<span>Simular cambios sin guardar</span>
							</label>

							{onExpireSession ? (
								<button
									className="app-header__dropdown-item"
									onClick={() => {
										setMenuOpen(false);
										onExpireSession();
									}}
									role="menuitem"
									style={{ fontSize: '12px', color: '#9a5b00' }}
									type="button"
								>
									<span>Simular expiración por inactividad</span>
								</button>
							) : null}

							<button
								className="app-header__dropdown-logout"
								onClick={() => {
									setMenuOpen(false);
									onSignOut?.();
								}}
								role="menuitem"
								type="button"
							>
								Cerrar sesión
							</button>
						</div>
					) : null}
				</div>
			</div>

			{helpOpen ? (
				<div
					aria-label="Ayuda contextual"
					role="dialog"
					style={{
						position: 'fixed',
						top: '72px',
						right: '20px',
						width: 'min(320px, calc(100vw - 32px))',
						backgroundColor: '#ffffff',
						border: '1px solid #ded8e6',
						borderRadius: '12px',
						boxShadow: '0 14px 32px rgba(28, 18, 44, 0.14)',
						padding: '16px 18px',
						fontSize: '13px',
						color: '#2c2635',
						zIndex: 450,
					}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '8px',
						}}
					>
						<strong>Ayuda contextual · ZDeptos</strong>
						<button
							aria-label="Cerrar ayuda"
							onClick={() => setHelpOpen(false)}
							style={{
								border: 'none',
								background: 'transparent',
								cursor: 'pointer',
								fontSize: '16px',
							}}
							type="button"
						>
							×
						</button>
					</div>
					<p style={{ margin: '0 0 8px', lineHeight: 1.45 }}>
						Las acciones y estructuras mostradas están acotadas por tu rol
						efectivo (<strong>{resolvedRole}</strong>) y alcance organizacional.
					</p>
					<p style={{ margin: 0, fontSize: '12px', color: '#5c5468' }}>
						Usa el buscador superior para localizar departamentos, grupos,
						secciones o colaboradores dentro de tu alcance.
					</p>
				</div>
			) : null}
		</header>
	);
}
