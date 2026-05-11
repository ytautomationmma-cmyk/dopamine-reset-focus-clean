import { useState, useEffect } from 'react';

export default function ResetFocusTracker() {
  const habits = [
    { name: 'Gym 45+ min', icon: '🏋️', points: 3 },
    { name: 'No porno', icon: '🚫', points: 3 },
    { name: 'No weed antes de 12 PM', icon: '🌿', points: 2 },
    { name: '2h Deep Work', icon: '💼', points: 3 },
    { name: 'Dormir antes de 12', icon: '😴', points: 2 },
    { name: '2L+ de agua', icon: '💧', points: 1 },
    { name: 'Xbox máximo 2h', icon: '🎮', points: 1 },
  ];

  const createInitialDays = () =>
    Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      checks: Array(habits.length).fill(false),
      feeling: '🙂 Bien',
    }));

  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem('dopamine-reset-data');
    return saved ? JSON.parse(saved) : createInitialDays();
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const today = new Date().getDate();
    return today <= 30 ? today - 1 : 0;
  });

  useEffect(() => {
    localStorage.setItem('dopamine-reset-data', JSON.stringify(days));
  }, [days]);

  const resetTracker = () => {
    const confirmed = window.confirm('¿Seguro que quieres reiniciar todo el progreso?');
    if (confirmed) {
      const fresh = createInitialDays();
      setDays(fresh);
      localStorage.removeItem('dopamine-reset-data');
    }
  };

  const scoreForDay = (day) =>
    day.checks.reduce((total, checked, i) => (checked ? total + habits[i].points : total), 0);

  const scores = days.map(scoreForDay);
  const selectedDay = days[selectedDayIndex];
  const selectedScore = scoreForDay(selectedDay);
  const completedHabits = selectedDay.checks.filter(Boolean).length;
  const totalPossible = habits.reduce((sum, habit) => sum + habit.points, 0);
  const progressPercent = Math.round((selectedScore / totalPossible) * 100);

  const progressStreak = scores.reduce((streak, score) => (score >= 8 ? streak + 1 : 0), 0);
  const eliteStreak = scores.reduce((streak, score) => (score >= 13 ? streak + 1 : 0), 0);
  const completedDays = scores.filter((score) => score > 0).length;
  const averageScore = completedDays
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / completedDays)
    : 0;

  let level = '💪 Nivel 1 — Recuperando Control';
  if (progressStreak >= 30) level = '👑 Nivel 4 — Nueva Identidad';
  else if (progressStreak >= 15) level = '⚡ Nivel 3 — Disciplina';
  else if (progressStreak >= 5) level = '🔥 Nivel 2 — Momentum';

  const getScoreState = (score) => {
    if (score >= 13) return { emoji: '🔥', label: 'Día élite', color: 'text-emerald-300', ring: 'ring-emerald-400/40', bg: 'bg-emerald-500/10' };
    if (score >= 8) return { emoji: '💪', label: 'Buen progreso', color: 'text-orange-300', ring: 'ring-orange-400/40', bg: 'bg-orange-500/10' };
    return { emoji: '🧭', label: 'Recalibrar enfoque', color: 'text-sky-300', ring: 'ring-sky-400/40', bg: 'bg-sky-500/10' };
  };

  const scoreState = getScoreState(selectedScore);

  const toggleCheck = (habitIndex) => {
    setDays((currentDays) =>
      currentDays.map((day, index) =>
        index === selectedDayIndex
          ? {
              ...day,
              checks: day.checks.map((checked, i) => (i === habitIndex ? !checked : checked)),
            }
          : day
      )
    );
  };

  const updateFeeling = (value) => {
    setDays((currentDays) =>
      currentDays.map((day, index) =>
        index === selectedDayIndex ? { ...day, feeling: value } : day
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto max-w-md px-4 py-6 md:max-w-5xl md:px-8">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl shadow-black/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-emerald-300">
                30 Day System
              </p>
              <h1 className="text-3xl font-black leading-tight md:text-5xl">
                Dopamine Reset
                <span className="block text-zinc-400">& Focus</span>
              </h1>
            </div>
            <div className={`rounded-3xl px-4 py-3 text-center ring-1 ${scoreState.ring} ${scoreState.bg}`}>
              <div className="text-3xl">{scoreState.emoji}</div>
              <div className="text-xl font-black">{selectedScore}</div>
              <div className="text-[10px] uppercase text-zinc-400">score</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
              <span>{scoreState.label}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-orange-300 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4">
            <p className="text-2xl font-black">{progressStreak}</p>
            <p className="text-xs text-zinc-400">💪 Streak</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4">
            <p className="text-2xl font-black">{eliteStreak}</p>
            <p className="text-xs text-zinc-400">🔥 Élite</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4">
            <p className="text-2xl font-black">{averageScore}</p>
            <p className="text-xs text-zinc-400">⚡ Promedio</p>
          </div>
        </section>

        <section className="mb-5 rounded-3xl border border-white/10 bg-zinc-900/80 p-4">
          <p className="mb-3 text-sm font-semibold text-zinc-300">{level}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((day, index) => {
              const score = scoreForDay(day);
              const state = getScoreState(score);
              const isSelected = index === selectedDayIndex;
              return (
                <button
                  key={day.day}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`min-w-12 rounded-2xl px-3 py-3 text-center transition ${
                    isSelected
                      ? 'bg-white text-black'
                      : score > 0
                      ? `${state.bg} ${state.color} ring-1 ${state.ring}`
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  <div className="text-xs font-bold">Día</div>
                  <div className="text-lg font-black">{day.day}</div>
                </button>
              );
            })}
          </div>
        </section>

        <main className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">Día {selectedDay.day}</h2>
              <p className="text-sm text-zinc-400">
                {completedHabits}/{habits.length} hábitos completados
              </p>
            </div>
            <select
              value={selectedDay.feeling}
              onChange={(e) => updateFeeling(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black px-3 py-3 text-sm outline-none"
            >
              <option>🔥 Imparable</option>
              <option>💪 Enfocado</option>
              <option>🙂 Bien</option>
              <option>🧭 Recalibrando</option>
              <option>😵 Distraído</option>
            </select>
          </div>

          <div className="space-y-3">
            {habits.map((habit, index) => {
              const checked = selectedDay.checks[index];
              return (
                <button
                  key={habit.name}
                  onClick={() => toggleCheck(index)}
                  className={`flex w-full items-center justify-between rounded-3xl border p-4 text-left transition active:scale-[0.99] ${
                    checked
                      ? 'border-emerald-400/40 bg-emerald-500/15'
                      : 'border-white/10 bg-black/40 hover:bg-zinc-800/70'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${checked ? 'bg-emerald-400 text-black' : 'bg-zinc-800'}`}>
                      {habit.icon}
                    </div>
                    <div>
                      <p className="font-bold">{habit.name}</p>
                      <p className="text-sm text-zinc-400">+{habit.points} puntos</p>
                    </div>
                  </div>
                  <div className={`grid h-8 w-8 place-items-center rounded-full border ${checked ? 'border-emerald-300 bg-emerald-400 text-black' : 'border-zinc-600 text-transparent'}`}>
                    ✓
                  </div>
                </button>
              );
            })}
          </div>
        </main>

        <section className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4">
            <h3 className="mb-2 font-bold">🧠 Mentalidad</h3>
            <p className="text-sm text-zinc-400">La meta no es perfección. La meta es control.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4">
            <h3 className="mb-2 font-bold">🔥 Score</h3>
            <p className="text-sm text-zinc-400">🔥 13–15 élite · 💪 8–12 progreso · 🧭 menos de 8 recalibrar.</p>
          </div>
          <button
            onClick={resetTracker}
            className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-left text-sm font-bold text-red-300"
          >
            Reiniciar progreso
          </button>
        </section>
      </div>
    </div>
  );
}
