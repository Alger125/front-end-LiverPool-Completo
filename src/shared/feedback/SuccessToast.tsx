import './SuccessToast.css';

interface SuccessToastProps {
    message: string;
    onClose: () => void;
}

export function SuccessToast({
    message,
    onClose,
}: SuccessToastProps) {
    return (
        <div
            aria-atomic="true"
            aria-live="polite"
            className="success-toast"
            role="status"
        >
            <span className="success-toast__message">
                {message}
            </span>

            <button
                aria-label="Cerrar notificación"
                className="success-toast__close"
                onClick={
                    onClose
                }
                type="button"
            >
                <span aria-hidden="true">
                    ×
                </span>
            </button>
        </div>
    );
}