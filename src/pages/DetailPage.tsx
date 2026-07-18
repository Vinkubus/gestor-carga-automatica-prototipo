import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProcessStore } from '../store/useProcessStore';
import { useToastStore } from '../store/useToastStore';
import { KpiCardDetail } from '../components/ui/KpiCardDetail';
import { ToggleAutoLoadModal } from '../components/modals/ToggleAutoLoadModal';
import { ExportDateRangeModal } from '../components/modals/ExportDateRangeModal';
import { formatShortDateEs, formatTime } from '../lib/dates';
import type { Process, ProcessStatus } from '../types/process';

const BANNER_VARIANTS: Record<
  ProcessStatus,
  { border: string; badgeBg: string; badgeBorder: string; text: string; icon: string; label: string }
> = {
  Completado: {
    border: 'border-l-success-400',
    badgeBg: 'bg-success-200',
    badgeBorder: 'border-success-600',
    text: 'text-success-700',
    icon: 'ri-check-line',
    label: 'Ejecución exitosa',
  },
  'Con errores': {
    border: 'border-l-danger-300',
    badgeBg: 'bg-danger-200',
    badgeBorder: 'border-danger-300',
    text: 'text-danger-800',
    icon: 'ri-close-line',
    label: 'Ejecución con errores',
  },
  Parcial: {
    border: 'border-l-warning-300',
    badgeBg: 'bg-warning-200',
    badgeBorder: 'border-warning-300',
    text: 'text-warning-900',
    icon: 'ri-error-warning-line',
    label: 'Ejecución parcial',
  },
  'En proceso': {
    border: 'border-l-primary-500',
    badgeBg: 'bg-primary-100',
    badgeBorder: 'border-primary-500',
    text: 'text-primary-700',
    icon: 'ri-loader-4-line animate-spin',
    label: 'Ejecución en curso',
  },
  Desactivado: {
    border: 'border-l-neutral-300',
    badgeBg: 'bg-neutral-100',
    badgeBorder: 'border-neutral-300',
    text: 'text-neutral-700',
    icon: 'ri-shut-down-line',
    label: 'Carga automática desactivada',
  },
  Programado: {
    border: 'border-l-info-400',
    badgeBg: 'bg-info-100',
    badgeBorder: 'border-info-400',
    text: 'text-info-800',
    icon: 'ri-calendar-check-line',
    label: 'Aún sin ejecuciones',
  },
};

const PIPELINE_STATUS_STYLES: Record<string, { bg: string; border: string; text: string; icon: string; label: string }> = {
  OK: { bg: 'bg-success-200', border: 'border-success-300', text: 'text-success-800', icon: 'ri-checkbox-circle-line', label: 'OK' },
  PARCIAL: { bg: 'bg-warning-200', border: 'border-warning-300', text: 'text-warning-900', icon: 'ri-error-warning-line', label: 'PARCIAL' },
  ERROR: { bg: 'bg-danger-200', border: 'border-danger-300', text: 'text-danger-800', icon: 'ri-close-line', label: 'ERROR' },
};

const HISTORY_STATUS_STYLES = {
  Completado: { bg: 'bg-success-200', border: 'border-success-300', text: 'text-success-800', icon: 'ri-checkbox-circle-line' },
  'Con errores': { bg: 'bg-danger-200', border: 'border-danger-300', text: 'text-danger-800', icon: 'ri-close-line' },
  Parcial: { bg: 'bg-warning-200', border: 'border-warning-300', text: 'text-warning-900', icon: 'ri-error-warning-line' },
} as const;

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const process = useProcessStore((s) => s.processes.find((p) => p.id === id));
  const toggleAutoLoad = useProcessStore((s) => s.toggleAutoLoad);
  const reprocess = useProcessStore((s) => s.reprocess);
  const setExecuting = useProcessStore((s) => s.setExecuting);
  const showToast = useToastStore((s) => s.showToast);

  const [isToggleModalOpen, setToggleModalOpen] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [isReprocessing, setReprocessing] = useState(false);

  if (!process) {
    return (
      <div className="mx-auto flex w-full max-w-[1500px] flex-col items-start gap-4 px-6 py-16">
        <p className="text-neutral-700">No se encontró el proceso solicitado.</p>
        <Link to="/" className="text-primary-700 hover:underline">
          Volver al concentrador
        </Link>
      </div>
    );
  }

  const banner = BANNER_VARIANTS[process.status];

  function handleReprocessClick() {
    if (isReprocessing || !process) return;
    setReprocessing(true);
    setExecuting(process.id, true);
    setTimeout(() => {
      reprocess(process.id);
      setReprocessing(false);
    }, 1400);
  }

  function handleConfirmToggle(nextEnabled: boolean) {
    if (!process) return;
    toggleAutoLoad(process.id, nextEnabled);
    showToast(nextEnabled ? 'Carga automática encendida' : 'Carga automática apagada');
    setToggleModalOpen(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col items-start gap-6 px-6 py-10 md:px-10">
      <Link to="/" className="flex items-center gap-1 text-sm text-primary-700 hover:underline">
        <i className="ri-arrow-left-s-line" aria-hidden="true" />
        Volver al concentrador
      </Link>

      {/* Header */}
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-[300px] flex-1 flex-col items-start gap-1">
          <p className="text-lg font-bold text-neutral-900">{process.name}</p>
          <span className="inline-block truncate rounded-md border border-neutral-300 bg-neutral-100 px-2 py-1 font-mono text-xs text-neutral-700">
            {process.id}
          </span>
        </div>
        <p className="text-sm font-semibold text-neutral-700">
          Solicitado por {process.requestedBy} · Se ejecuta {process.frequency.toLowerCase()} a las {process.executionTime}
        </p>
      </div>

      {/* Banner */}
      <div
        className={`flex w-full flex-wrap items-center justify-between gap-6 rounded-lg border border-y border-r border-neutral-300 border-l-4 ${banner.border} bg-neutral-0 px-6 py-4`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`flex size-4 items-center justify-center rounded-full border ${banner.badgeBorder} ${banner.badgeBg}`}>
              <i className={`${banner.icon} text-[10px] ${banner.text}`} aria-hidden="true" />
            </span>
            <p className={`text-sm font-semibold ${banner.text}`}>{banner.label}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-neutral-900">
              <span>{process.lastExecution.startTime.toLowerCase()}</span>
              <i className="ri-arrow-right-s-line" aria-hidden="true" />
              <span>{process.lastExecution.endTime.toLowerCase()}</span>
            </div>
            <span className="rounded-3xl border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700">
              {process.lastExecution.durationMin} min
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl px-4 py-2.5">
          <p className="text-sm font-semibold text-neutral-700">Carga automática</p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${process.autoLoadEnabled ? 'text-success-700' : 'text-neutral-500'}`}>
              {process.autoLoadEnabled ? 'Encendida' : 'Apagada'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={process.autoLoadEnabled}
              aria-label="Carga automática"
              onClick={() => setToggleModalOpen(true)}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                process.autoLoadEnabled ? 'bg-primary-700' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-neutral-0 shadow-elevation2 transition-all ${
                  process.autoLoadEnabled ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleReprocessClick}
            disabled={isReprocessing}
            className="flex items-center gap-2 rounded-3xl bg-primary-700 px-6 py-2 text-sm font-semibold text-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReprocessing && <i className="ri-loader-4-line animate-spin" aria-hidden="true" />}
            Reproceso
          </button>
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="rounded-3xl border border-secondary-700 bg-primary-100 px-6 py-2 text-sm font-semibold text-secondary-700"
          >
            Exportar resultados
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="flex w-full flex-wrap items-start gap-6">
        <KpiCardDetail
          icon="ri-folder-5-line"
          iconBg="bg-primary-200"
          label="Contratos"
          value={process.kpis.contratos}
          delta={{ direction: 'up', value: process.kpis.contratosDelta, positive: true }}
        />
        <KpiCardDetail
          icon="ri-file-copy-2-line"
          iconBg="bg-info-300"
          label="Documentos"
          value={process.kpis.documentos}
          delta={{ direction: 'up', value: process.kpis.documentosDelta, positive: true }}
        />
        <KpiCardDetail icon="ri-error-warning-line" iconBg="bg-danger-200" label="Errores" value={process.kpis.errores} delta={{ direction: 'down', value: process.kpis.erroresDelta, positive: false }} />
        <KpiCardDetail icon="ri-file-copy-line" iconBg="bg-tertiary-200" label="Duplicados" value={process.kpis.duplicados} neutralNote="sin cambio" />
      </div>

      {/* Pipeline + Historial */}
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
        <PipelinePanel process={process} />
        <HistoryPanel process={process} />
      </div>

      {isToggleModalOpen && (
        <ToggleAutoLoadModal
          process={process}
          onCancel={() => setToggleModalOpen(false)}
          onConfirm={() => handleConfirmToggle(!process.autoLoadEnabled)}
        />
      )}
      {isExportModalOpen && <ExportDateRangeModal onClose={() => setExportModalOpen(false)} />}
    </div>
  );
}

function PipelinePanel({ process }: { process: Process }) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-neutral-300 bg-neutral-0 p-6 shadow-card">
      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold text-neutral-900">Pipeline de Ejecución</p>
        <span className="inline-flex w-fit items-center gap-1 rounded-xl border border-primary-500 bg-primary-100 px-3 py-1 text-xs text-primary-700">
          <i className="ri-calendar-line" aria-hidden="true" />
          Proceso nocturno {process.executionTime}
        </span>
      </div>
      <hr className="border-neutral-200" />
      <ul className="flex flex-col gap-0">
        {process.pipeline.map((step, idx) => {
          const style = PIPELINE_STATUS_STYLES[step.status];
          const isLast = idx === process.pipeline.length - 1;
          return (
            <li key={step.id} className="flex min-h-[58px] items-start gap-4">
              <div className="flex h-full w-3.5 flex-col items-center gap-0.5 pt-0.5">
                <span className="size-3.5 rounded-full bg-primary-700" aria-hidden="true" />
                {!isLast && <span className="w-0.5 flex-1 bg-neutral-200" aria-hidden="true" />}
              </div>
              <div className="flex flex-1 flex-col justify-center gap-0.5 py-2">
                <p className="text-sm font-medium text-neutral-900">{step.title}</p>
                <p className="text-xs text-neutral-500">{step.subtitle}</p>
              </div>
              <span className={`mt-2 inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 py-1 text-xs ${style.bg} ${style.border} ${style.text}`}>
                <i className={style.icon} aria-hidden="true" />
                {style.label}
              </span>
            </li>
          );
        })}
      </ul>
      <hr className="border-neutral-200" />
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-xl border border-success-300 bg-success-200 px-3 py-1 text-xs text-success-800">
          <i className="ri-checkbox-circle-line" aria-hidden="true" />
          {process.kpis.documentos - process.kpis.errores} cargados
        </span>
        <span className="inline-flex items-center gap-1 rounded-xl border border-danger-300 bg-danger-200 px-3 py-1 text-xs text-danger-800">
          <i className="ri-close-line" aria-hidden="true" />
          {process.kpis.errores} errores
        </span>
        <span className="inline-flex items-center gap-1 rounded-xl border border-warning-300 bg-warning-200 px-3 py-1 text-xs text-warning-900">
          <i className="ri-error-warning-line" aria-hidden="true" />
          {process.kpis.duplicados} duplicados
        </span>
      </div>
    </div>
  );
}

function HistoryPanel({ process }: { process: Process }) {
  return (
    <div className="flex flex-col rounded-lg border border-neutral-300 bg-neutral-0 p-6 shadow-card">
      <p className="pb-6 text-base font-semibold text-neutral-900">Histórico de Ejecuciones {process.name}</p>
      <div className="w-full overflow-x-auto rounded-lg border border-neutral-300">
        <div className="max-h-[432px] overflow-y-auto thin-scrollbar">
          <table className="w-full min-w-[450px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-neutral-50">
              <tr className="border-b border-neutral-300">
                <th className="px-4 py-3 text-xs font-bold text-neutral-500">FECHA</th>
                <th className="px-4 py-3 text-xs font-bold text-neutral-500">TIPO</th>
                <th className="px-6 py-3 text-xs font-bold text-neutral-500">ESTATUS</th>
              </tr>
            </thead>
            <tbody>
              {process.history.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-sm text-neutral-500">
                    Este proceso todavía no tiene ejecuciones registradas.
                  </td>
                </tr>
              )}
              {process.history.map((row, i) => {
                const style = HISTORY_STATUS_STYLES[row.status];
                return (
                  <tr key={row.id} className={`border-b border-neutral-300 ${i % 2 === 1 ? 'bg-neutral-50' : 'bg-neutral-0'}`}>
                    <td className="px-4 py-4 text-xs text-neutral-700">
                      <span className="font-bold">{formatShortDateEs(row.date)} ⋅ </span>
                      {formatTime(row.date)}
                    </td>
                    <td className={`px-4 py-4 text-sm font-semibold ${row.type === 'Reproceso' ? 'text-info-800' : 'text-neutral-700'}`}>
                      {row.type}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex w-[120px] items-center justify-center gap-1 rounded-xl border px-3 py-1 text-xs ${style.bg} ${style.border} ${style.text}`}>
                        <i className={style.icon} aria-hidden="true" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
