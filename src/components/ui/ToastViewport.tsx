import { useToastStore } from '../../store/useToastStore';

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 rounded-xl border border-success-300 bg-neutral-0 px-4 py-3 shadow-elevation3"
        >
          <i className="ri-checkbox-circle-line text-lg text-success-700" aria-hidden="true" />
          <p className="text-sm font-semibold text-neutral-900">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Cerrar notificación"
            className="ml-2 flex size-6 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <i className="ri-close-line" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
