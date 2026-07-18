interface KpiCardDetailProps {
  icon: string;
  iconBg: string;
  label: string;
  value: number;
  delta?: { direction: 'up' | 'down'; value: number; positive: boolean } | null;
  neutralNote?: string;
}

export function KpiCardDetail({ icon, iconBg, label, value, delta, neutralNote }: KpiCardDetailProps) {
  return (
    <div className="flex min-w-[228px] flex-1 flex-col gap-1 rounded-lg border border-neutral-300 bg-neutral-0 p-6 shadow-card">
      <div className="flex h-10 items-center gap-2">
        <div className={`flex size-6 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <i className={`${icon} text-sm`} aria-hidden="true" />
        </div>
        <p className="text-base font-semibold text-neutral-700">{label}</p>
      </div>
      <div className="flex items-center gap-3">
        <p
          className={`text-[33px] leading-tight font-semibold ${
            label === 'Errores' ? 'text-danger-800' : 'text-secondary-800'
          }`}
        >
          {value}
        </p>
        {delta && (
          <p className="text-xs">
            <span className={delta.positive ? 'text-success-700' : 'text-danger-800'}>
              {delta.direction === 'up' ? '▲ ' : '▼ '}
              <span className="font-bold">{delta.value}</span>{' '}
            </span>
            <span className="text-neutral-700">vs día anterior</span>
          </p>
        )}
        {neutralNote && <p className="w-28 text-xs text-black">─ {neutralNote}</p>}
      </div>
    </div>
  );
}
