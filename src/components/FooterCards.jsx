export default function FooterCards({ resetTracker }) {
  return (
    <section className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4"><h3 className="mb-2 font-bold">🧠 Mentalidad</h3><p className="text-sm text-zinc-400">La meta no es perfección. La meta es control.</p></div>
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4"><h3 className="mb-2 font-bold">🔥 Score</h3><p className="text-sm text-zinc-400">🔥 13–15 élite · 💪 8–12 progreso · 🧭 menos de 8 recalibrar.</p></div>
      <button onClick={resetTracker} className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-left text-sm font-bold text-red-300">Reiniciar progreso</button>
    </section>
  );
}
