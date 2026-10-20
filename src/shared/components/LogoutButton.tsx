import './LogoutButton.css';

interface LogoutButtonProps {
  onLogout: () => void;
  disabled?: boolean;
}

export function LogoutButton({
  onLogout,
  disabled = false,
}: LogoutButtonProps) {
  return (
    <button
      className="logout-button"
      type="button"
      disabled={disabled}
      aria-label="Cerrar sesión"
      onClick={onLogout}
    >
      <span
        className="logout-button__icon"
        aria-hidden="true"
      >
        ↪
      </span>

      <span className="logout-button__text">
        Cerrar sesión
      </span>
    </button>
  );
}