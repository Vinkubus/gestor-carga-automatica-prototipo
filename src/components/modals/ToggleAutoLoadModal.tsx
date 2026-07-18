import { ModalShell } from '../ui/ModalShell';
import type { Process } from '../../types/process';

interface ToggleAutoLoadModalProps {
  process: Process;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ToggleAutoLoadModal({ process, onCancel, onConfirm }: ToggleAutoLoadModalProps) {
  const isTurningOff = process.autoLoadEnabled;

  const title = isTurningOff ? '¿Apagar la carga automática?' : '¿Encender la carga automática?';
  const description = isTurningOff
    ? 'El sistema dejará de procesar documentos automáticamente hasta que vuelvas a encenderlo.'
    : 'El sistema reanudará el procesamiento automático de documentos según la frecuencia configurada.';
  const confirmLabel = isTurningOff ? 'Apagar carga' : 'Encender carga';

  return (
    <ModalShell onClose={onCancel} maxWidth="max-w-[498px]" labelledBy="toggle-modal-title">
      <div className="flex flex-col items-center gap-8 px-10 py-8">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-information-fill text-[56px] text-warning-700" aria-hidden="true" />
          <div className="flex flex-col items-center gap-2 text-center text-neutral-700">
            <p id="toggle-modal-title" className="text-xl font-bold">
              {title}
            </p>
            <p className="text-lg">{description}</p>
          </div>
        </div>
        <div className="flex w-full justify-center gap-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-14 flex-1 items-center justify-center rounded-xl border border-secondary-700 bg-primary-100 text-lg font-bold text-secondary-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-14 flex-1 items-center justify-center rounded-xl bg-primary-700 text-lg font-bold text-primary-100"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
