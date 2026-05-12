export default function Header({ scoreState, selectedScore, progressPercent }) {
  return (
    <header className="mb-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl shadow-black/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-emerald-300">30 Day System</p>
          <h1 className="text-3xl font-black leading-tight md:text-5xl">Dopamine Reset<span className="block text-zinc-400">& Focus</span></h1>
        </div>
        <div className={`rounded-3xl px-4 py-3 text-center ring-1 ${scoreState.ring} ${scoreState.bg}`}>
          <div className="text-3xl">{scoreState.emoji}</div><div className="text-xl font-black">{selectedScore}</div><div className="text-[10px] uppercase text-zinc-400">score</div>
        </div>
      </div>
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm text-zinc-400"><span>{scoreState.label}</span><span>{progressPercent}%</span></div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-orange-300 transition-all duration-500" style={{ width: `${progressPercent}%` }} /></div>
      </div>
    </header>
  );
}
