export default function Stats({
  scores,
  selectedDayIndex,
  winCount,
  eliteCount,
  progressCount,
  lowCount,
  averageScore,
  bestDay,
  lowestDay,
  currentStreak,
  topHabits,
  weakHabits,
  workoutSummary,
  getScoreState,
}) {
  const visibleScores = scores.slice(0, selectedDayIndex + 1);
  const lastWorkout = workoutSummary.lastWorkout;

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl shadow-black/40">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">Stats</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black leading-tight">Tu progreso</h2>
            <p className="mt-1 text-sm text-zinc-400">Día {selectedDayIndex + 1} de 30</p>
          </div>
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-right">
            <p className="text-3xl font-black text-emerald-300">{currentStreak}</p>
            <p className="text-[10px] font-bold uppercase text-zinc-400">racha</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Promedio" value={averageScore} hint="score" accent="text-sky-300" />
        <StatCard label="Wins" value={winCount} hint={`${eliteCount} élite · ${progressCount} progreso`} accent="text-emerald-300" />
        <StatCard label="Mejor día" value={bestDay.day ? `Día ${bestDay.day}` : '--'} hint={`${bestDay.score} puntos`} accent="text-orange-300" />
        <StatCard label="Días bajos" value={lowCount} hint={lowestDay.day ? `mínimo: día ${lowestDay.day}` : 'sin datos'} accent="text-red-300" />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">Mapa de 30 días</h3>
            <p className="text-sm text-zinc-400">Cada bloque cambia según el score del día.</p>
          </div>
          <p className="text-xs font-bold uppercase text-zinc-500">{winCount}/30 wins</p>
        </div>
        <div className="grid grid-cols-10 gap-2">
          {scores.map((score, index) => {
            const state = getScoreState(score);
            const isFuture = index > selectedDayIndex;
            return (
              <div key={index} className={`aspect-square rounded-xl border text-[10px] font-black ${isFuture ? 'border-white/5 bg-zinc-950 text-zinc-700' : score > 0 ? `border-white/10 ${state.bg} ${state.color}` : 'border-white/5 bg-zinc-800 text-zinc-500'}`}>
                <div className="grid h-full place-items-center">{index + 1}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <HabitPanel title="Más fuertes" habits={topHabits} tone="good" />
        <HabitPanel title="A mejorar" habits={weakHabits} tone="weak" />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
        <h3 className="text-xl font-black">Workout</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <p className="text-2xl font-black text-emerald-300">{workoutSummary.totalExercises}</p>
            <p className="text-xs text-zinc-400">ejercicios registrados</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <p className="text-2xl font-black text-sky-300">{workoutSummary.workoutDays}</p>
            <p className="text-xs text-zinc-400">días con workout</p>
          </div>
        </div>
        <div className="mt-3 rounded-3xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Último registro</p>
          {lastWorkout ? (
            <p className="mt-1 text-sm text-zinc-300">Día {lastWorkout.day} · {lastWorkout.muscle} · <span className="font-bold text-white">{lastWorkout.exercise}</span></p>
          ) : (
            <p className="mt-1 text-sm text-zinc-500">Todavía no hay ejercicios registrados.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, hint, accent }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4 shadow-xl shadow-black/20">
      <p className={`text-2xl font-black ${accent}`}>{value}</p>
      <p className="mt-1 text-sm font-bold text-zinc-200">{label}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

function HabitPanel({ title, habits, tone }) {
  const color = tone === 'good' ? 'text-emerald-300' : 'text-orange-300';

  return (
    <section className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
      <h3 className="text-xl font-black">{title}</h3>
      <div className="mt-4 space-y-3">
        {habits.map((habit) => (
          <div key={habit.name}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <p className="font-bold text-zinc-200">{habit.icon} {habit.name}</p>
              <p className={`font-black ${color}`}>{habit.percent}%</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div className={`h-full rounded-full ${tone === 'good' ? 'bg-emerald-400' : 'bg-orange-300'}`} style={{ width: `${habit.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
