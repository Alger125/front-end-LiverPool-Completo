interface AppHeaderProps {
    onMenuToggle: () => void;
    onLogout?: () => void;
}

export function AppHeader({
    onMenuToggle,
    onLogout,
}: AppHeaderProps) {
    const handleLogout = (): void => {
        if (onLogout) {
            onLogout();
            return;
        }

        console.log('Cerrar sesión');
    };

    return (
        <header className="app-header">
            <button
                aria-label="Abrir navegación"
                className="app-header__menu-button"
                type="button"
                onClick={onMenuToggle}
            >
                <span aria-hidden="true">
                    Menú
                </span>
            </button>

            <p className="app-header__brand">
                Z Departamentos
            </p>

            <div className="app-header__session">
                <span
                    aria-hidden="true"
                    className="app-header__avatar"
                >
                    U
                </span>

                <span className="app-header__session-label">
                    Sesión corporativa
                </span>

                <button
                    aria-label="Cerrar sesión"
                    className="app-header__logout"
                    type="button"
                    onClick={handleLogout}
                >
                    <svg
                        aria-hidden="true"
                        className="app-header__logout-icon"
                        fill="none"
                        focusable="false"
                        height="18"
                        viewBox="0 0 24 24"
                        width="18"
                    >
                        <path
                            d="M10 17l5-5-5-5"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                        />

                        <path
                            d="M15 12H3"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="2"
                        />

                        <path
                            d="M14 4h6v16h-6"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                        />
                    </svg>

                    <span>
                        Cerrar sesión
                    </span>
                </button>
            </div>
        </header>
    );
}