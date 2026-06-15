import { useState } from 'react';

export default function Stats({
  days,
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
  activeChallengeSummary,
}) {
  const [scope, setScope] = useState('last30');
  const challengeMode = scope === 'challenge' && activeChallengeSummary;
  const viewDays = challengeMode ? activeChallengeSummary.days : days;
  const viewScores = challengeMode ? activeChallengeSummary.scores : scores;
  const viewSelectedIndex = Math.max(0, viewDays.length - 1);
  const visibleScores = viewScores.slice(0, viewSelectedIndex + 1);
  const selectedLabel = challengeMode ? `${activeChallengeSummary.challengeLength} días · ${formatShortDate(activeChallengeSummary.startDate)} - ${formatShortDate(activeChallengeSummary.endDate)}` : 'Últimos 30 días';
  const viewWinCount = challengeMode ? activeChallengeSummary.wins : winCount;
  const viewEliteCount = challengeMode ? activeChallengeSummary.eliteDays : eliteCount;
  const viewProgressCount = challengeMode ? Math.max(0, activeChallengeSummary.wins - activeChallengeSummary.eliteDays) : progressCount;
  const viewAverageScore = challengeMode ? calculateAverage(activeChallengeSummary.scores) : averageScore;
  const viewBestDay = challengeMode ? getBestDay(activeChallengeSummary.days, activeChallengeSummary.scores) : bestDay;
  const viewLowCount = challengeMode ? activeChallengeSummary.scores.filter((score) => score > 0 && score < 8).length : lowCount;
  const viewLowestDay = challengeMode ? getLowestDay(activeChallengeSummary.days, activeChallengeSummary.scores) : lowestDay;
  const viewStreak = challengeMode ? activeChallengeSummary.longestStreak : currentStreak;
  const viewTopHabits = challengeMode ? activeChallengeSummary.topHabits : topHabits;
  const viewWeakHabits = challengeMode ? activeChallengeSummary.weakHabits : weakHabits;
  const viewWorkoutSummary = challengeMode ? { totalExercises: activeChallengeSummary.days.flatMap((day) => day.workout || []).length, workoutDays: activeChallengeSummary.workoutDays, lastWorkout: getLastWorkout(activeChallengeSummary.days) } : workoutSummary;
  const lastWorkout = viewWorkoutSummary.lastWorkout;
  const formatStatDay = (day) => day?.day ? `Día ${day.day}` : formatShortDate(day?.date);

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl shadow-black/40">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">Stats</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black leading-tight">Tu progreso</h2>
            <p className="mt-1 text-sm capitalize text-zinc-400">{selectedLabel}</p>
          </div>
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-right">
            <p className="text-3xl font-black text-emerald-300">{viewStreak}</p>
            <p className="text-[10px] font-bold uppercase text-zinc-400">{challengeMode ? 'mejor racha' : 'racha'}</p>
          </div>
        </div>
        {activeChallengeSummary && (
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/35 p-1.5">
            <button type="button" onClick={() => setScope('last30')} className={`rounded-xl px-3 py-2 text-xs font-black transition ${scope === 'last30' ? 'bg-white text-black' : 'text-zinc-400'}`}>
              Últimos 30
            </button>
            <button type="button" onClick={() => setScope('challenge')} className={`rounded-xl px-3 py-2 text-xs font-black transition ${scope === 'challenge' ? 'bg-white text-black' : 'text-zinc-400'}`}>
              Challenge activo
            </button>
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Promedio" value={viewAverageScore} hint="score" accent="text-sky-300" />
        <StatCard label="Wins" value={viewWinCount} hint={`${viewEliteCount} élite · ${viewProgressCount} progreso`} accent="text-emerald-300" />
        <StatCard label="Mejor día" value={viewBestDay.score ? formatStatDay(viewBestDay) : '--'} hint={`${viewBestDay.score} puntos`} accent="text-orange-300" />
        <StatCard label="Días bajos" value={viewLowCount} hint={viewLowestDay.score ? `mínimo: ${formatStatDay(viewLowestDay)}` : 'sin datos'} accent="text-red-300" />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">Mapa de días</h3>
            <p className="text-sm text-zinc-400">Cada bloque cambia según el score del día.</p>
          </div>
          <p className="text-xs font-bold uppercase text-zinc-500">{viewWinCount}/{visibleScores.length} wins</p>
        </div>
        <div className="grid grid-cols-10 gap-2">
          {viewScores.map((score, index) => {
            const state = getScoreState(score);
            const isFuture = index > viewSelectedIndex;
            return (
              <div key={index} className={`aspect-square rounded-xl border text-[10px] font-black ${isFuture ? 'border-white/5 bg-zinc-950 text-zinc-700' : score > 0 ? `border-white/10 ${state.bg} ${state.color}` : 'border-white/5 bg-zinc-800 text-zinc-500'}`}>
                <div className="grid h-full place-items-center">{viewDays[index]?.challengeDay || new Date(`${viewDays[index]?.date}T00:00:00`).getDate()}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <HabitPanel title="Más fuertes" habits={viewTopHabits} tone="good" />
        <HabitPanel title="A mejorar" habits={viewWeakHabits} tone="weak" />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
        <h3 className="text-xl font-black">Workout</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <p className="text-2xl font-black text-emerald-300">{viewWorkoutSummary.totalExercises}</p>
            <p className="text-xs text-zinc-400">ejercicios registrados</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <p className="text-2xl font-black text-sky-300">{viewWorkoutSummary.workoutDays}</p>
            <p className="text-xs text-zinc-400">días con workout</p>
          </div>
        </div>
        <div className="mt-3 rounded-3xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Último registro</p>
          {lastWorkout ? (
            <p className="mt-1 text-sm text-zinc-300">{lastWorkout.day ? `Día ${lastWorkout.day}` : formatShortDate(lastWorkout.date)} · {lastWorkout.muscle} · <span className="font-bold text-white">{lastWorkout.exercise}</span></p>
          ) : (
            <p className="mt-1 text-sm text-zinc-500">Todavía no hay ejercicios registrados.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function calculateAverage(scores) {
  const activeScores = scores.filter((score) => score > 0);
  return activeScores.length ? (activeScores.reduce((sum, score) => sum + score, 0) / activeScores.length).toFixed(1) : '0.0';
}

function getBestDay(days, scores) {
  return days.reduce((best, day, index) => scores[index] > best.score ? { day: day.challengeDay, date: day.date, score: scores[index] } : best, { day: null, date: null, score: 0 });
}

function getLowestDay(days, scores) {
  const scoredDays = days.map((day, index) => ({ day: day.challengeDay, date: day.date, score: scores[index] })).filter((day) => day.score > 0);
  return scoredDays.reduce((lowest, day) => day.score < lowest.score ? day : lowest, scoredDays[0] || { day: 0, score: 0 });
}

function getLastWorkout(days) {
  const lastWorkoutDay = [...days].reverse().find((day) => (day.workout || []).length > 0);
  return lastWorkoutDay ? { day: lastWorkoutDay.challengeDay, date: lastWorkoutDay.date, ...lastWorkoutDay.workout[0] } : null;
}

function formatShortDate(dateKey) {
  if (!dateKey) return '--';
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
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
