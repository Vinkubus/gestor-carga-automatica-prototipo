interface KpiCardOverviewProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
}

export function KpiCardOverview({ icon, iconBg, iconColor, value, label }: KpiCardOverviewProps) {
  return (
    <div className="flex flex-1 min-w-[160px] flex-col items-start gap-3 border-r border-neutral-300 p-6 last:border-r-0">
      <div className="flex h-10 w-full items-center gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <i className={`${icon} text-xl ${iconColor}`} aria-hidden="true" />
        </div>
        <p className="text-3xl font-semibold tracking-tight text-neutral-900">{value}</p>
      </div>
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
    </div>
  );
}
