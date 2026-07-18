import type { ProcessStatus } from '../../types/process';

const STATUS_STYLES: Record<
  ProcessStatus,
  { bg: string; border: string; text: string; icon: string }
> = {
  Completado: {
    bg: 'bg-success-200',
    border: 'border-success-300',
    text: 'text-success-800',
    icon: 'ri-checkbox-circle-line',
  },
  'Con errores': {
    bg: 'bg-danger-200',
    border: 'border-danger-300',
    text: 'text-danger-800',
    icon: 'ri-close-line',
  },
  Parcial: {
    bg: 'bg-warning-200',
    border: 'border-warning-300',
    text: 'text-warning-900',
    icon: 'ri-file-damage-line',
  },
  'En proceso': {
    bg: 'bg-primary-100',
    border: 'border-primary-500',
    text: 'text-primary-700',
    icon: 'ri-restart-line',
  },
  Desactivado: {
    bg: 'bg-neutral-100',
    border: 'border-neutral-300',
    text: 'text-neutral-700',
    icon: 'ri-shut-down-line',
  },
  Programado: {
    bg: 'bg-info-100',
    border: 'border-info-400',
    text: 'text-info-800',
    icon: 'ri-calendar-check-line',
  },
};

export function StatusBadge({ status }: { status: ProcessStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-xl border px-3 py-1 text-xs whitespace-nowrap ${s.bg} ${s.border} ${s.text}`}
    >
      <i className={`${s.icon} text-base leading-none`} aria-hidden="true" />
      {status}
    </span>
  );
}
