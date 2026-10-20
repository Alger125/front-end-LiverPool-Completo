import './CreateRoleButton.css';

interface CreateRoleButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function CreateRoleButton({
  onClick,
  disabled = false,
}: CreateRoleButtonProps) {
  return (
    <button
      className="create-role-button"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <span
        className="create-role-button__icon"
        aria-hidden="true"
      >
        +
      </span>

      <span>Crear rol</span>
    </button>
  );
}