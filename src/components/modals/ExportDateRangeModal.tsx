import { useState } from 'react';
import { ModalShell } from '../ui/ModalShell';
import { DateRangeCalendar } from './DateRangeCalendar';
import { formatLongDateEs } from '../../lib/dates';
import { useToastStore } from '../../store/useToastStore';

interface ExportDateRangeModalProps {
  onClose: () => void;
}

export function ExportDateRangeModal({ onClose }: ExportDateRangeModalProps) {
  const showToast = useToastStore((s) => s.showToast);
  const today = new Date();
  const [anchor, setAnchor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const rightMonth = anchor.month === 11 ? 0 : anchor.month + 1;
  const rightYear = anchor.month === 11 ? anchor.year + 1 : anchor.year;

  function shiftAnchor(delta: number) {
    setAnchor((prev) => {
      let month = prev.month + delta;
      let year = prev.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      } else if (month > 11) {
        month = 0;
        year += 1;
      }
      return { year, month };
    });
  }

  function handleSelectDay(date: Date) {
    if (rangeStart && rangeEnd) {
      setRangeStart(date);
      setRangeEnd(null);
      return;
    }
    if (!rangeStart) {
      setRangeStart(date);
      return;
    }
    if (date.getTime() < rangeStart.getTime()) {
      setRangeEnd(rangeStart);
      setRangeStart(date);
    } else {
      setRangeEnd(date);
    }
  }

  function handleLeftYearChange(year: number) {
    setAnchor((prev) => ({ ...prev, year }));
  }

  function handleRightYearChange(year: number) {
    setAnchor((prev) => (prev.month === 11 ? { year: year - 1, month: 11 } : { ...prev, year }));
  }

  const canExport = Boolean(rangeStart && rangeEnd);

  function handleExport() {
    if (!canExport) return;
    onClose();
    showToast('Se descargó el archivo con los resultados exportados');
  }

  const rangeLabel =
    rangeStart && rangeEnd
      ? `${formatLongDateEs(rangeStart)} al ${formatLongDateEs(rangeEnd)}`
      : rangeStart
        ? `${formatLongDateEs(rangeStart)} — selecciona la fecha final`
        : 'Selecciona el rango de fechas';

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-[577px]" labelledBy="export-modal-title">
      <div className="flex flex-col items-center gap-6 px-8 py-8">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-share-forward-2-fill text-4xl text-neutral-900" aria-hidden="true" />
          <div className="flex flex-col items-center gap-2 text-center text-neutral-700">
            <p id="export-modal-title" className="text-xl font-bold">
              Exportar resultados
            </p>
            <p className="text-lg">Selecciona el periodo de resultados que deseas exportar</p>
          </div>
        </div>

        <div className="flex overflow-hidden rounded-3xl border border-neutral-300 shadow-card">
          <DateRangeCalendar
            year={anchor.year}
            month={anchor.month}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onSelectDay={handleSelectDay}
            onPrevMonth={() => shiftAnchor(-1)}
            onNextMonth={() => shiftAnchor(1)}
            onYearChange={handleLeftYearChange}
            showNav="left"
          />
          <div className="w-px shrink-0 bg-neutral-300" aria-hidden="true" />
          <DateRangeCalendar
            year={rightYear}
            month={rightMonth}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onSelectDay={handleSelectDay}
            onPrevMonth={() => shiftAnchor(-1)}
            onNextMonth={() => shiftAnchor(1)}
            onYearChange={handleRightYearChange}
            showNav="right"
          />
        </div>

        <p className="text-center text-lg text-neutral-900" aria-live="polite">
          {rangeLabel}
        </p>

        <div className="flex w-full justify-center gap-6">
          <button
            type="button"
            onClick={onClose}
            className="flex h-14 flex-1 items-center justify-center rounded-xl border border-secondary-700 bg-primary-100 text-lg font-bold text-secondary-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!canExport}
            className="flex h-14 flex-1 items-center justify-center rounded-xl bg-primary-700 text-lg font-bold text-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exportar
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
