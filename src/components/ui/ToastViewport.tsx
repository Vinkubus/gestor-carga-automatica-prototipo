import { useEffect, useState } from 'react';
import { useToastStore, type ToastItem, type ToastType } from '../../store/useToastStore';

const VISIBLE_MS = 4000;

const TOAST_TYPE_CONFIG: Record<ToastType, { icon: string; colorClass: string; barClass: string }> = {
  success: { icon: 'ri-checkbox-circle-fill', colorClass: 'text-success-500', barClass: 'bg-success-500' },
  error: { icon: 'ri-error-warning-fill', colorClass: 'text-danger-600', barClass: 'bg-danger-600' },
  warning: { icon: 'ri-alert-fill', colorClass: 'text-warning-600', barClass: 'bg-warning-600' },
  info: { icon: 'ri-information-fill', colorClass: 'text-info-600', barClass: 'bg-info-600' },
};

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');
  const config = TOAST_TYPE_CONFIG[toast.type];

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setPhase('visible'));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  const startExit = () => setPhase('exit');

  return (
    <div
      className={`relative flex w-[360px] items-start gap-3 overflow-hidden rounded-[8px] bg-neutral-900/90 px-4 py-3 shadow-elevation3 transition-[opacity,transform] duration-200 ease-out ${
        phase === 'visible' ? 'translate-y-0 opacity-90' : '-translate-y-6 opacity-0'
      }`}
      onTransitionEnd={(e) => {
        if (e.propertyName === 'opacity' && phase === 'exit') onDismiss(toast.id);
      }}
      role="status"
      aria-live="polite"
    >
      <i className={`${config.icon} ${config.colorClass} text-xl`} aria-hidden="true" />
      <p className="flex-1 text-base font-semibold leading-6 text-white">{toast.message}</p>
      <button
        type="button"
        onClick={startExit}
        aria-label="Cerrar notificación"
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
      >
        <i className="ri-close-line" aria-hidden="true" />
      </button>
      <div
        className={`absolute inset-x-0 bottom-0 h-1 ${config.barClass} transition-[width] ease-linear`}
        style={{
          width: phase === 'enter' ? '0%' : '100%',
          transitionDuration: phase === 'enter' ? '0ms' : `${VISIBLE_MS}ms`,
        }}
        onTransitionEnd={(e) => {
          if (e.propertyName === 'width' && phase === 'visible') startExit();
        }}
      />
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed left-1/2 top-[260px] z-[100] flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
