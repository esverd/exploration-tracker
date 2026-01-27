import { useToast } from '../contexts/ToastContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <span className="toast-message">{toast.message}</span>
          {toast.action && (
            <button
              className="toast-action"
              onClick={() => {
                toast.action!.onClick();
                dismissToast(toast.id);
              }}
            >
              {toast.action.label}
            </button>
          )}
          <button
            className="toast-dismiss"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss"
          >
            {'\u00D7'}
          </button>
        </div>
      ))}
    </div>
  );
}
