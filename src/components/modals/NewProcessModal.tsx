import { useState } from 'react';
import { ModalShell } from '../ui/ModalShell';
import { useProcessStore } from '../../store/useProcessStore';
import { useToastStore } from '../../store/useToastStore';
import type { Frequency } from '../../types/process';

const FREQUENCIES: Frequency[] = ['Diario', 'Semanal', 'Quincenal', 'Mensual'];

const NAME_EXAMPLE = 'Carga masiva de contratos';
const PATH_EXAMPLE = '//servidor/compartido/cargas';

interface NewProcessModalProps {
  onClose: () => void;
}

export function NewProcessModal({ onClose }: NewProcessModalProps) {
  const addProcess = useProcessStore((s) => s.addProcess);
  const showToast = useToastStore((s) => s.showToast);

  const [name, setName] = useState('');
  const [sourcePath, setSourcePath] = useState('');
  const [executionTime, setExecutionTime] = useState('');
  const [timeRaw, setTimeRaw] = useState('');
  const [frequency, setFrequency] = useState<Frequency | ''>('');
  const [nameTouched, setNameTouched] = useState(false);
  const [pathTouched, setPathTouched] = useState(false);
  const [isFrequencyOpen, setFrequencyOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  function handleNameFocus() {
    if (!nameTouched) {
      setName(NAME_EXAMPLE);
      setNameTouched(true);
    }
  }

  function handlePathFocus() {
    if (!pathTouched) {
      setSourcePath(PATH_EXAMPLE);
      setPathTouched(true);
    }
  }

  const canSubmit = name.trim() !== '' && sourcePath.trim() !== '' && executionTime.trim() !== '' && frequency !== '';

  function handleSubmit() {
    if (!canSubmit || isSubmitting) return;
    setSubmitting(true);
    setTimeout(() => {
      addProcess({
        name: name.trim(),
        sourcePath: sourcePath.trim(),
        executionTime: executionTime.trim(),
        frequency: frequency as Frequency,
      });
      setSubmitting(false);
      onClose();
      showToast('Se creó un nuevo proceso');
    }, 900);
  }

  return (
    <ModalShell onClose={onClose} labelledBy="new-process-title">
      <div className="border-b border-neutral-300 px-8 pt-6 pb-6">
        <div className="flex items-center gap-2">
          <i className="ri-upload-cloud-2-line text-2xl text-neutral-900" aria-hidden="true" />
          <h2 id="new-process-title" className="text-xl font-semibold tracking-tight text-neutral-900">
            Nuevo proceso de carga
          </h2>
        </div>
        <p className="pt-1.5 text-sm text-neutral-700">Configura un nuevo proceso de carga automática</p>
      </div>

      <div className="flex flex-col gap-6 border border-neutral-300 px-8 py-7">
        <div className="flex flex-col gap-1">
          <label htmlFor="np-name" className="text-xs text-neutral-900">
            Nombre del proceso
          </label>
          <input
            id="np-name"
            type="text"
            value={name}
            onFocus={handleNameFocus}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Carga masiva de contratos"
            className="h-10 w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="np-path" className="text-xs text-neutral-900">
            Ruta de origen — de dónde se toman los archivos
          </label>
          <div className="flex h-10 w-full items-center gap-1 rounded-lg border border-neutral-300 px-4 py-2">
            <i className="ri-folder-open-line text-xl text-neutral-500" aria-hidden="true" />
            <input
              id="np-path"
              type="text"
              value={sourcePath}
              onFocus={handlePathFocus}
              onChange={(e) => setSourcePath(e.target.value)}
              placeholder="//servidor/compartido/cargas  o  s3://bucket/cargas"
              className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-neutral-900">Hora y frecuencia de ejecución</p>
          <div className="flex gap-2.5">
            <div className="w-40">
              <label htmlFor="np-time" className="sr-only">
                Hora de ejecución
              </label>
              <div className="flex h-10 w-full items-center gap-1 rounded-lg border border-neutral-300 px-4 py-2">
                <input
                  id="np-time"
                  type="time"
                  value={timeRaw}
                  onChange={(e) => {
                    setTimeRaw(e.target.value);
                    const [h, m] = e.target.value.split(':').map(Number);
                    if (Number.isNaN(h)) {
                      setExecutionTime('');
                      return;
                    }
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    const hour12 = h % 12 === 0 ? 12 : h % 12;
                    setExecutionTime(`${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`);
                  }}
                  className="w-full bg-transparent text-sm text-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div className="relative flex-1">
              <label htmlFor="np-frequency" className="sr-only">
                Frecuencia
              </label>
              <button
                id="np-frequency"
                type="button"
                onClick={() => setFrequencyOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={isFrequencyOpen}
                className="flex h-10 w-full items-center justify-between gap-1 rounded-lg border border-neutral-300 px-4 py-2 text-left"
              >
                <span className={`text-sm ${frequency ? 'text-neutral-900' : 'text-neutral-500'}`}>
                  {frequency || 'Selecciona la frecuencia'}
                </span>
                <i className="ri-arrow-down-s-line text-xl text-neutral-500" aria-hidden="true" />
              </button>
              {isFrequencyOpen && (
                <ul
                  role="listbox"
                  className="absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-lg border border-neutral-300 bg-neutral-0 shadow-elevation3"
                >
                  {FREQUENCIES.map((f) => (
                    <li key={f} role="option" aria-selected={frequency === f}>
                      <button
                        type="button"
                        onClick={() => {
                          setFrequency(f);
                          setFrequencyOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-neutral-900 hover:bg-neutral-100"
                      >
                        {f}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-neutral-300 bg-neutral-50 px-4 py-4">
          <div className="flex items-center gap-1.5">
            <i className="ri-lock-line text-base text-neutral-700" aria-hidden="true" />
            <p className="text-[11px] font-semibold tracking-[0.66px] text-neutral-700 uppercase">
              Estructura de nombres del sistema (fija)
            </p>
          </div>
          <div className="mt-3 rounded-md border border-neutral-300 bg-neutral-100 px-4 py-3">
            <p className="font-code text-xs tracking-wide text-[#2c4a6e]">
              {'{área_bancaria}_{número_contrato}_{tipo_persona}_{tipo_taxonomía}_{nombre_genérico}.{extensión}'}
            </p>
            <hr className="my-1.5 border-neutral-300" />
            <p className="font-code text-xs tracking-wide text-[#2c4a6e]">
              {'76_12345678_pf_{tipo_taxonomía}_{nombre_genérico}.{extensión}'}
            </p>
          </div>
          <p className="mt-2 text-xs text-neutral-700">Este formato es fijo y lo genera el sistema automáticamente.</p>
        </div>

        <div className="flex gap-2 rounded-lg border border-info-400 bg-primary-200 px-4 py-3">
          <i className="ri-information-line mt-0.5 text-base text-info-700" aria-hidden="true" />
          <p className="text-xs text-info-700">El ID de proceso se generará automáticamente al guardar.</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-neutral-300 px-8 py-5">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-3xl border border-secondary-700 px-6 py-2 text-sm font-semibold text-secondary-700 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="flex items-center gap-2 rounded-3xl bg-primary-700 px-6 py-2 text-sm font-semibold text-neutral-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && <i className="ri-loader-4-line animate-spin" aria-hidden="true" />}
          Crear proceso
        </button>
      </div>
    </ModalShell>
  );
}
