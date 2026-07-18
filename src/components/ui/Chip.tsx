interface ChipProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

export function Chip({ label, count, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-10 shrink-0 items-center justify-center gap-1 rounded-3xl border px-4 py-3 text-sm whitespace-nowrap transition-colors ${
        active
          ? 'border-primary-800 bg-primary-200 font-semibold text-primary-800'
          : 'border-neutral-300 bg-neutral-0 text-neutral-700 hover:bg-neutral-50'
      }`}
    >
      <span className="flex items-center gap-0.5">
        {label}
        <span aria-hidden="true">·</span>
        {count}
      </span>
    </button>
  );
}
