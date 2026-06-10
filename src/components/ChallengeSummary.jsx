const clampPercent = (value) => Math.max(0, Math.min(100, value || 0));

export default function ChallengeSummary({ summary }) {
  return (
    <section className="mb-5 space-y-4">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl shadow-black/40">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">Challenge complete</p>
            <h2 className="mt-2 text-3xl font-black leading-tight">Performance review</h2>
            <p className="mt-1 text-sm text-zinc-400">30-day consistency report</p>
          </div>
          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-right">
            <p className="text-xl font-black text-emerald-300">{summary.wins}</p>
            <p className="text-[10px] font-bold uppercase text-zinc-500">wins</p>
          </div>
        </div>

        <Gauge value={summary.effectiveness} />

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Metric label="Elite" value={summary.eliteDays} accent="text-orange-300" />
          <Metric label="Longest" value={`${summary.longestStreak}d`} accent="text-emerald-300" />
          <Metric label="Workout" value={summary.workoutDays} accent="text-sky-300" />
        </div>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">Momentum</h3>
            <p className="text-sm text-zinc-400">Score diario durante el challenge.</p>
          </div>
          <p className="text-xs font-bold uppercase text-zinc-500">30 días</p>
        </div>
        <div className="flex h-24 items-end gap-1.5 rounded-3xl border border-white/10 bg-black/30 p-3">
          {summary.scores.map((score, index) => {
            const state = summary.getScoreState(score);
            const height = Math.max(8, Math.round((score / 15) * 100));
            return (
              <div key={index} className="flex min-w-0 flex-1 items-end">
                <div className={`w-full rounded-full ${score > 0 ? state.bg : 'bg-zinc-800'}`} style={{ height: `${height}%` }}>
                  <div className={`h-full rounded-full ${score >= 13 ? 'bg-emerald-300' : score >= 8 ? 'bg-orange-300' : score > 0 ? 'bg-sky-300' : 'bg-zinc-700'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <HabitRank title="Top 3" habits={summary.topHabits} tone="good" />
        <HabitRank title="Needs work" habits={summary.weakHabits} tone="weak" />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
        <div className="mb-4">
          <h3 className="text-xl font-black">All habits breakdown</h3>
          <p className="text-sm text-zinc-400">Aquí no se pierde ningún hábito del challenge.</p>
        </div>
        <div className="space-y-3">
          {[...summary.habitStats].sort((a, b) => b.percent - a.percent).map((habit) => (
            <HabitBreakdown key={habit.name} habit={habit} />
          ))}
        </div>
      </section>
    </section>
  );
}

function Gauge({ value }) {
  const percent = clampPercent(value);

  return (
    <div className="relative mx-auto max-w-xs">
      <svg viewBox="0 0 240 140" className="h-auto w-full overflow-visible">
        <path d="M 30 115 A 90 90 0 0 1 210 115" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" strokeLinecap="round" pathLength="100" />
        <path d="M 30 115 A 90 90 0 0 1 210 115" fill="none" stroke="url(#summaryGauge)" strokeWidth="18" strokeLinecap="round" pathLength="100" strokeDasharray={`${percent} 100`} />
        <defs>
          <linearGradient id="summaryGauge" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="48%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-x-0 bottom-2 text-center">
        <p className="text-5xl font-black text-white">{percent}%</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Consistency index</p>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-3 text-center">
      <p className={`text-2xl font-black ${accent}`}>{value}</p>
      <p className="text-[10px] font-bold uppercase text-zinc-500">{label}</p>
    </div>
  );
}

function HabitRank({ title, habits, tone }) {
  const color = tone === 'good' ? 'text-emerald-300' : 'text-orange-300';

  return (
    <section className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
      <h3 className="text-xl font-black">{title}</h3>
      <div className="mt-4 space-y-3">
        {habits.map((habit) => (
          <div key={habit.name} className="rounded-3xl border border-white/10 bg-black/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 text-sm font-bold text-zinc-200">{habit.icon} {habit.name}</p>
              <p className={`text-sm font-black ${color}`}>{habit.percent}%</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div className={`h-full rounded-full ${tone === 'good' ? 'bg-emerald-400' : 'bg-orange-300'}`} style={{ width: `${habit.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HabitBreakdown({ habit }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="min-w-0 text-sm font-bold text-zinc-200">{habit.icon} {habit.name}</p>
        <p className="text-sm font-black text-white">{habit.percent}%</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300" style={{ width: `${habit.percent}%` }} />
        </div>
        <p className="w-12 text-right text-[10px] font-bold text-zinc-500">{habit.count}/30</p>
      </div>
    </div>
  );
}
