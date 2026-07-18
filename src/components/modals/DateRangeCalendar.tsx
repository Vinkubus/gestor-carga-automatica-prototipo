import { MONTH_NAMES_ES, WEEKDAY_LETTERS_ES, daysInMonth, mondayFirstDay, sameDay } from '../../lib/dates';

interface DateRangeCalendarProps {
  year: number;
  month: number; // 0-indexed
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onSelectDay: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onYearChange: (year: number) => void;
  showNav: 'left' | 'right';
}

type DaySlot = { date: Date } | null;

function buildWeeks(year: number, month: number): DaySlot[][] {
  const total = daysInMonth(year, month);
  const firstDay = mondayFirstDay(new Date(year, month, 1));
  const slots: DaySlot[] = [];
  for (let i = 0; i < firstDay; i++) slots.push(null);
  for (let d = 1; d <= total; d++) slots.push({ date: new Date(year, month, d) });
  while (slots.length % 7 !== 0) slots.push(null);
  const weeks: DaySlot[][] = [];
  for (let i = 0; i < slots.length; i += 7) weeks.push(slots.slice(i, i + 7));
  return weeks;
}

const YEAR_OPTIONS = Array.from({ length: 9 }, (_, i) => 2022 + i);

export function DateRangeCalendar({
  year,
  month,
  rangeStart,
  rangeEnd,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onYearChange,
  showNav,
}: DateRangeCalendarProps) {
  const weeks = buildWeeks(year, month);
  const today = new Date();

  return (
    <div className="flex w-64 flex-col items-start">
      <div className="flex w-full items-start justify-center bg-neutral-0 px-6 py-3">
        <div className="flex h-6 items-center gap-10">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Mes anterior"
            className={`flex size-6 items-center justify-center text-neutral-700 ${showNav === 'right' ? 'invisible' : ''}`}
          >
            <i className="ri-arrow-left-s-line text-xl" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-0.5">
            <label className="sr-only" htmlFor={`year-select-${month}`}>
              Año
            </label>
            <span className="text-xs font-bold text-neutral-700">
              {MONTH_NAMES_ES[month][0].toUpperCase() + MONTH_NAMES_ES[month].slice(1)}
            </span>
            <select
              id={`year-select-${month}`}
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="cursor-pointer border-none bg-transparent text-xs font-bold text-neutral-700 focus:outline-none"
              aria-label="Seleccionar año"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Mes siguiente"
            className={`flex size-6 items-center justify-center text-neutral-700 ${showNav === 'left' ? 'invisible' : ''}`}
          >
            <i className="ri-arrow-right-s-line text-xl" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex h-8 w-full items-start justify-center bg-neutral-0 px-4">
        {WEEKDAY_LETTERS_ES.map((letter, i) => (
          <div key={i} className="flex size-8 shrink-0 items-center justify-center text-[10px] text-neutral-700">
            {letter}
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col items-center gap-0.5 bg-neutral-0 px-4 pb-2">
        {weeks.map((week, wi) => {
          const inRangeIndices = week
            .map((slot, i) => ({ slot, i }))
            .filter(({ slot }) => slot && isInRange(slot.date, rangeStart, rangeEnd))
            .map(({ i }) => i);
          const rowStartIdx = inRangeIndices[0];
          const rowEndIdx = inRangeIndices[inRangeIndices.length - 1];

          return (
            <div key={wi} className="flex items-start">
              {week.map((slot, di) => {
                if (!slot) {
                  return <div key={di} className="size-8 shrink-0" aria-hidden="true" />;
                }
                const { date } = slot;
                const isStart = rangeStart ? sameDay(date, rangeStart) : false;
                const isEnd = rangeEnd ? sameDay(date, rangeEnd) : false;
                const inRange = isInRange(date, rangeStart, rangeEnd);
                const isToday = sameDay(date, today);
                const isRowStart = di === rowStartIdx;
                const isRowEnd = di === rowEndIdx;
                const leftPainted = inRange && !isStart;
                const rightPainted = inRange && !isEnd;

                return (
                  <button
                    key={di}
                    type="button"
                    onClick={() => onSelectDay(date)}
                    className="relative size-8 shrink-0"
                    aria-pressed={isStart || isEnd}
                    aria-label={date.toDateString()}
                  >
                    {leftPainted && (
                      <span
                        className={`absolute top-[1px] bottom-[1px] left-0 right-1/2 bg-primary-300 ${
                          isRowStart ? 'rounded-l-[15px]' : ''
                        }`}
                      />
                    )}
                    {rightPainted && (
                      <span
                        className={`absolute top-[1px] bottom-[1px] left-1/2 right-0 bg-primary-300 ${
                          isRowEnd ? 'rounded-r-[15px]' : ''
                        }`}
                      />
                    )}
                    {(isStart || isEnd) && (
                      <span className="absolute inset-[1px] rounded-full bg-primary-700" aria-hidden="true" />
                    )}
                    {!isStart && !isEnd && isToday && (
                      <span className="absolute inset-[1px] rounded-full border border-primary-500" aria-hidden="true" />
                    )}
                    <span
                      className={`relative flex h-full w-full items-center justify-center text-[10px] ${
                        isStart || isEnd ? 'text-neutral-0' : 'text-neutral-950'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}
