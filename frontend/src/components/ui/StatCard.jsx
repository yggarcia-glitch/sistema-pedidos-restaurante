// KPI card del portal: ícono en círculo de color + valor grande + hint opcional.
const TINTS = {
  primary: 'bg-primary-light text-primary-dark',
  info: 'bg-info text-info-text',
  ok: 'bg-ok text-ok-text',
  warn: 'bg-warn text-warn-text',
};

export function StatCard({ icon, label, value, hint, tint = 'primary' }) {
  return (
    <div className="bg-white border border-border rounded-[12px] p-[15px] shadow-sm">
      <div className="flex items-center justify-between mb-[10px]">
        <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[16px] ${TINTS[tint] ?? TINTS.primary}`}>
          {icon}
        </div>
      </div>
      <p className="text-[22px] font-bold text-txt leading-none">{value}</p>
      <p className="text-[11px] text-txt-2 mt-[5px]">{label}</p>
      {hint && <p className="text-[10px] text-txt-3 mt-[2px]">{hint}</p>}
    </div>
  );
}
