interface MoviWordmarkProps {
  compact?: boolean;
  subtitle?: string;
}

export function MoviWordmark({
  compact = false,
  subtitle = 'PROJETOS INDEPENDENTES',
}: MoviWordmarkProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#14233C] text-white shadow-[0_12px_24px_rgba(20,35,60,0.25)]">
        <svg viewBox="0 0 44 44" className="h-6 w-6" aria-hidden="true">
          <rect x="4" y="11" width="30" height="12" rx="6" fill="#FFD200" />
          <rect x="10" y="23" width="27" height="6" rx="3" fill="#1E7F3B" />
          <circle cx="12" cy="32" r="3" fill="#2D6CA2" />
          <circle cx="26" cy="32" r="3" fill="#2D6CA2" />
        </svg>
      </span>
      {compact ? null : (
        <div className="leading-tight">
          <p className="text-[17px] font-black uppercase tracking-[0.08em] text-[#14233C]">MOVI</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E7F3B]">{subtitle}</p>
        </div>
      )}
    </div>
  );
}
