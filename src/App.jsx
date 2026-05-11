import { useState, useEffect } from 'react';

export default function ResetFocusTracker() {
  const createInitialDays = () =>
    Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      checks: Array(7).fill(false),
      feeling: '🙂 Bien',
    }));

  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem('dopamine-reset-data');
    return saved ? JSON.parse(saved) : createInitialDays();
  });

  useEffect(() => {
    localStorage.setItem('dopamine-reset-data', JSON.stringify(days));
  }, [days]);

  const resetTracker = () => {
    const confirmed = window.confirm(
      '¿Seguro que quieres reiniciar todo el progreso?'
    );

    if (confirmed) {
      const fresh = createInitialDays();
      setDays(fresh);
      localStorage.removeItem('dopamine-reset-data');
    }
  };

  const habits = [
    { name: '🏋️ Gym 45+ min', points: 3 },
    { name: '🚫 No porno', points: 3 },
    { name: '🌿 No weed antes de 12 PM', points: 2 },
    { name: '💼 2h Deep Work', points: 3 },
    { name: '😴 Dormir antes de 12', points: 2 },
    { name: '💧 2L+ de agua', points: 1 },
    { name: '🎮 Xbox máximo 2h', points: 1 },
  ];

  const toggleCheck = (dayIndex, habitIndex) => {
    const updated = [...days];
    updated[dayIndex].checks[habitIndex] =
      !updated[dayIndex].checks[habitIndex];
    setDays(updated);
  };

  const updateFeeling = (dayIndex, value) => {
    const updated = [...days];
    updated[dayIndex].feeling = value;
    setDays(updated);
  };

  const scores = days.map((day) =>
    day.checks.reduce((total, checked, i) => {
      return checked ? total + habits[i].points : total;
    }, 0)
  );

  const eliteStreak = scores.reduce((streak, score) => {
    return score >= 13 ? streak + 1 : streak;
  }, 0);

  const progressStreak = scores.reduce((streak, score) => {
    return score >= 8 ? streak + 1 : streak;
  }, 0);

  let level = '💪 Nivel 1 — Recuperando Control';

  if (progressStreak >= 30) {
    level = '👑 Nivel 4 — Nueva Identidad';
  } else if (progressStreak >= 15) {
    level = '⚡ Nivel 3 — Disciplina';
  } else if (progressStreak >= 5) {
    level = '🔥 Nivel 2 — Momentum';
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            DOPAMINE RESET & FOCUS
          </h1>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-zinc-400 text-lg">
              Sistema de control de hábitos — 30 días
            </p>

            <button
              onClick={resetTracker}
              className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-xl hover:bg-red-500/30 transition text-sm font-semibold"
            >
              Reiniciar progreso
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-2">🎯 Objetivo</h2>
            <p className="text-zinc-400">
              Construir disciplina, enfoque y control mental.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-2">🔥 Regla</h2>
            <p className="text-zinc-400">
              Nunca 2 días malos seguidos.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-2">⚡ Meta</h2>
            <p className="text-zinc-400">
              Acumular días buenos y construir momentum.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-2">🔥 Streaks</h2>

            <div className="space-y-2 text-zinc-400">
              <p>🔥 Días élite: {eliteStreak}</p>
              <p>💪 Buen progreso: {progressStreak}</p>

              <div className="mt-3 pt-3 border-t border-zinc-800">
                <p className="text-white font-semibold">{level}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-zinc-800 sticky top-0">
                <tr>
                  <th className="text-left p-4">Día</th>

                  {habits.map((habit, index) => (
                    <th key={index} className="text-left p-4 text-sm">
                      <div>{habit.name}</div>

                      <div className="text-zinc-400 text-xs mt-1">
                        +{habit.points} pts
                      </div>
                    </th>
                  ))}

                  <th className="text-left p-4">Score</th>
                  <th className="text-left p-4">Estado Mental</th>
                </tr>
              </thead>

              <tbody>
                {days.map((day, dayIndex) => {
                  const score = day.checks.reduce((total, checked, i) => {
                    return checked ? total + habits[i].points : total;
                  }, 0);

                  let scoreColor = 'text-red-400';
                  let scoreEmoji = '🧭';

                  if (score >= 13) {
                    scoreColor = 'text-green-400';
                    scoreEmoji = '🔥';
                  } else if (score >= 8) {
                    scoreColor = 'text-orange-400';
                    scoreEmoji = '💪';
                  }

                  return (
                    <tr
                      key={dayIndex}
                      className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"
                    >
                      <td className="p-4 font-semibold">
                        Día {day.day}
                      </td>

                      {habits.map((_, habitIndex) => (
                        <td key={habitIndex} className="p-4">
                          <button
                            onClick={() =>
                              toggleCheck(dayIndex, habitIndex)
                            }
                            className={`w-7 h-7 rounded-lg border transition flex items-center justify-center text-sm font-bold ${
                              day.checks[habitIndex]
                                ? 'bg-green-500 border-green-400 text-black'
                                : 'bg-zinc-800 border-zinc-600 text-transparent hover:border-zinc-400'
                            }`}
                          >
                            ✓
                          </button>
                        </td>
                      ))}

                      <td className={`p-4 font-bold text-lg ${scoreColor}`}>
                        <div className="flex items-center gap-2">
                          <span>{scoreEmoji}</span>
                          <span>{score}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <select
                          value={day.feeling}
                          onChange={(e) =>
                            updateFeeling(dayIndex, e.target.value)
                          }
                          className="w-full h-10 rounded-xl bg-zinc-800 border border-zinc-700 px-3 text-sm outline-none focus:border-zinc-500"
                        >
                          <option>🔥 Imparable</option>
                          <option>💪 Enfocado</option>
                          <option>🙂 Bien</option>
                          <option>🧭 Recalibrando</option>
                          <option>😵 Distraído</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-lg font-semibold mb-3">🟢 Score</h3>
            <div className="space-y-2 text-zinc-400">
              <p>🔥 13–15 = Día élite</p>
              <p>💪 8–12 = Buen progreso</p>
              <p>🧭 Menos de 8 = Recalibrar enfoque</p>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-lg font-semibold mb-3">🧠 Mentalidad</h3>
            <div className="space-y-2 text-zinc-400">
              <p>La meta no es perfección.</p>
              <p>La meta es control.</p>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-lg font-semibold mb-3">🔥 Identidad</h3>
            <div className="space-y-2 text-zinc-400">
              <p>Estás construyendo disciplina.</p>
              <p>Estás construyendo enfoque.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
