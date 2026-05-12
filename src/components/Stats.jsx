export default function Stats({ winCount, eliteCount, progressCount }) {
  return (
    <section className="mb-5 grid grid-cols-3 gap-3">
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4"><p className="text-2xl font-black">{winCount}</p><p className="text-xs text-zinc-400">🏆 Wins</p></div>
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4"><p className="text-2xl font-black">{eliteCount}</p><p className="text-xs text-zinc-400">🔥 Élite</p></div>
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4"><p className="text-2xl font-black">{progressCount}</p><p className="text-xs text-zinc-400">💪 Progreso</p></div>
    </section>
  );
}
