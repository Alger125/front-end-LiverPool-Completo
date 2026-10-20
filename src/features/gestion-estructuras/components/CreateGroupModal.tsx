import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
  parentDepartmentName?: string;
  existingGroupNames?: string[];
  mode?: 'create' | 'rename';
  initialName?: string;
  initialDescription?: string;
}

export function CreateGroupModal({
  open,
  onClose,
  onCreate,
  parentDepartmentName = 'Departamento Belleza',
  existingGroupNames = [],
  mode = 'create',
  initialName = '',
  initialDescription = '',
}: CreateGroupModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState('');

  const titleId = useId();
  const descriptionId = useId();
  const inputId = useId();
  const descInputId = useId();
  const errorId = useId();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(initialName);
    setDescription(initialDescription);
    setError('');

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [open, initialName, initialDescription]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const isRename = mode === 'rename';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      setError('Escribe el nombre del grupo.');
      inputRef.current?.focus();
      return;
    }

    const isDuplicate = existingGroupNames.some(
      (existing) =>
        existing.trim().toLowerCase() === normalizedName.toLowerCase() &&
        existing.trim().toLowerCase() !== initialName.trim().toLowerCase(),
    );

    if (isDuplicate) {
      setError('Ya existe un grupo con ese nombre en este departamento.');
      inputRef.current?.focus();
      return;
    }

    onCreate(normalizedName, description.trim() || undefined);
  };

  return (
    <div
      className="ge-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="ge-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <h2 id={titleId} className="ge-modal__title">
          {isRename ? 'Editar nombre del grupo' : 'Crear grupo'}
        </h2>

        <p id={descriptionId} className="ge-modal__description">
          {isRename
            ? 'Actualiza el nombre e identificación comercial del grupo.'
            : 'Escribe el nombre del grupo comercial para este departamento.'}
        </p>

        <div className="gm-modal-parent-box">
          <span>Departamento padre (fijo):</span>
          <strong>{parentDepartmentName}</strong>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label className="gm-modal-label" htmlFor={inputId}>
            Nombre del grupo *
          </label>

          <input
            ref={inputRef}
            id={inputId}
            className={
              error
                ? 'ge-modal__input ge-modal__input--error'
                : 'ge-modal__input'
            }
            type="text"
            value={name}
            placeholder="Ej. Grupo dulcería"
            maxLength={100}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setName(event.target.value);

              if (error) {
                setError('');
              }
            }}
          />

          {error && (
            <p id={errorId} className="ge-modal__error" role="alert">
              {error}
            </p>
          )}

          <label className="gm-modal-label" htmlFor={descInputId}>
            Descripción comercial (opcional)
          </label>

          <input
            id={descInputId}
            className="ge-modal__input"
            type="text"
            value={description}
            placeholder="Ej. Perfumería selectiva y sets de regalo"
            maxLength={140}
            onChange={(event) => setDescription(event.target.value)}
          />

          <div className="ge-modal__actions">
            <button
              type="button"
              className="ge-modal__cancel"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="ge-modal__submit"
              disabled={!name.trim()}
            >
              {isRename ? 'Guardar cambios' : 'Crear grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}