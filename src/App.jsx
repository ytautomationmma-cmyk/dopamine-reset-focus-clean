import { useState, useEffect } from 'react';

export default function ResetFocusTracker() {
  const STORAGE_KEY = 'dopamine-reset-data-v2';
  const SELECTED_DAY_KEY = 'dopamine-reset-selected-day';
  const CUSTOM_EXERCISES_KEY = 'dopamine-reset-custom-exercises';
  const EXERCISE_RENAMES_KEY = 'dopamine-reset-exercise-renames';

  const habits = [
    { name: 'Gym 45+ min', icon: '🏋️', points: 3 },
    { name: 'No porno', icon: '🚫', points: 3 },
    { name: 'No weed antes de 12 PM', icon: '🌿', points: 2 },
    { name: '2h Deep Work', icon: '💼', points: 3 },
    { name: 'Dormir antes de 12', icon: '😴', points: 2 },
    { name: '2L+ de agua', icon: '💧', points: 1 },
    { name: 'Xbox máximo 2h', icon: '🎮', points: 1 },
  ];

  const muscleGroups = [
    { name: 'Pecho', emoji: '🛡️', exercises: ['Bench Press', 'Incline Dumbbell Press', 'Chest Fly', 'Push Ups', 'Dips'] },
    { name: 'Hombros', emoji: '🔺', exercises: ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Fly', 'Arnold Press'] },
    { name: 'Trapecio', emoji: '⛰️', exercises: ['Shrugs', 'Upright Row', 'Face Pulls', 'Farmer Walk'] },
    { name: 'Bíceps', emoji: '💪', exercises: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Cable Curl'] },
    { name: 'Tríceps', emoji: '🔱', exercises: ['Tricep Pushdown', 'Skull Crushers', 'Close Grip Bench', 'Overhead Extension', 'Dips'] },
    { name: 'Antebrazo', emoji: '✊', exercises: ['Wrist Curl', 'Reverse Wrist Curl', 'Farmer Walk', 'Reverse Curl'] },
    { name: 'Espalda', emoji: '🦍', exercises: ['Lat Pulldown', 'Pull Ups', 'Barbell Row', 'Seated Cable Row', 'Deadlift'] },
    { name: 'Abdominales', emoji: '⚡', exercises: ['Crunches', 'Leg Raises', 'Cable Crunch', 'Plank', 'Hanging Knee Raises'] },
    { name: 'Lumbares', emoji: '🧱', exercises: ['Back Extensions', 'Good Mornings', 'Deadlift', 'Superman Hold'] },
    { name: 'Cuádriceps', emoji: '🦵', exercises: ['Squat', 'Leg Press', 'Leg Extension', 'Lunges', 'Hack Squat'] },
    { name: 'Bíceps femoral', emoji: '⚙️', exercises: ['Romanian Deadlift', 'Leg Curl', 'Good Mornings', 'Hip Thrust'] },
    { name: 'Abductores', emoji: '↔️', exercises: ['Hip Abduction Machine', 'Cable Hip Abduction', 'Side Lunges', 'Banded Walks'] },
    { name: 'Pantorrilla', emoji: '🐄', exercises: ['Standing Calf Raise', 'Seated Calf Raise', 'Leg Press Calf Raise', 'Single Leg Calf Raise'] },
  ];

  const createInitialDays = () =>
    Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      checks: Array(habits.length).fill(false),
      feeling: '🙂 Bien',
      workout: [],
    }));

  const [days, setDays] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : createInitialDays();
    } catch {
      return createInitialDays();
    }
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    try {
      const savedDay = localStorage.getItem(SELECTED_DAY_KEY);
      if (savedDay !== null) return Number(savedDay);
      return 0;
    } catch {
      return 0;
    }
  });

  const [customExercises, setCustomExercises] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_EXERCISES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [exerciseRenames, setExerciseRenames] = useState(() => {
    try {
      const saved = localStorage.getItem(EXERCISE_RENAMES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedMuscle, setSelectedMuscle] = useState('Pecho');
  const [selectedExercise, setSelectedExercise] = useState('Bench Press');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [renameExerciseName, setRenameExerciseName] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
    } catch {
      // Storage unavailable
    }
  }, [days]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_DAY_KEY, String(selectedDayIndex));
    } catch {
      // Storage unavailable
    }
  }, [selectedDayIndex]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customExercises));
    } catch {
      // Storage unavailable
    }
  }, [customExercises]);

  useEffect(() => {
    try {
      localStorage.setItem(EXERCISE_RENAMES_KEY, JSON.stringify(exerciseRenames));
    } catch {
      // Storage unavailable
    }
  }, [exerciseRenames]);

  const resetTracker = () => {
    const confirmed = window.confirm('¿Seguro que quieres reiniciar todo el progreso?');
    if (confirmed) {
      const fresh = createInitialDays();
      setDays(fresh);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SELECTED_DAY_KEY);
      setSelectedDayIndex(0);
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

  const scoresUntilSelectedDay = scores.slice(0, selectedDayIndex + 1);

  const progressCount = scoresUntilSelectedDay.filter((score) => score >= 8 && score <= 12).length;
  const eliteCount = scoresUntilSelectedDay.filter((score) => score >= 13).length;
  const winCount = progressCount + eliteCount;

  const completedDays = scores.filter((score) => score > 0).length;
  const averageScore = completedDays
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / completedDays)
    : 0;

  let level = '💪 Nivel 1 — Recuperando Control';
  if (winCount >= 30) level = '👑 Nivel 4 — Nueva Identidad';
  else if (winCount >= 15) level = '⚡ Nivel 3 — Disciplina';
  else if (winCount >= 5) level = '🔥 Nivel 2 — Momentum';

  const getScoreState = (score) => {
    if (score >= 13) return { emoji: '🔥', label: 'Día élite', color: 'text-emerald-300', ring: 'ring-emerald-400/40', bg: 'bg-emerald-500/10' };
    if (score >= 8) return { emoji: '💪', label: 'Buen progreso', color: 'text-orange-300', ring: 'ring-orange-400/40', bg: 'bg-orange-500/10' };
    return { emoji: '🧭', label: 'Recalibrar enfoque', color: 'text-sky-300', ring: 'ring-sky-400/40', bg: 'bg-sky-500/10' };
  };

  const scoreState = getScoreState(selectedScore);

  const toggleCheck = (habitIndex) => {
    setDays((currentDays) => {
      const updatedDays = currentDays.map((day, index) =>
        index === selectedDayIndex
          ? {
              ...day,
              checks: day.checks.map((checked, i) => (i === habitIndex ? !checked : checked)),
            }
          : day
      );

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
      } catch {
        // Storage unavailable
      }

      return updatedDays;
    });
  };

  const updateFeeling = (value) => {
    setDays((currentDays) => {
      const updatedDays = currentDays.map((day, index) =>
        index === selectedDayIndex ? { ...day, feeling: value } : day
      );

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
      } catch {
        // Storage unavailable
      }

      return updatedDays;
    });
  };

  const getExercisesForMuscle = (muscleName) => {
    const baseMuscle = muscleGroups.find((group) => group.name === muscleName) || muscleGroups[0];
    const customList = customExercises[muscleName] || [];
    const renameMap = exerciseRenames[muscleName] || {};
    const renamedBaseExercises = baseMuscle.exercises.map((exercise) => renameMap[exercise] || exercise);
    return [...new Set([...renamedBaseExercises, ...customList])];
  };

  const saveExerciseRename = () => {
    const cleanName = renameExerciseName.trim();
    if (!cleanName || cleanName === selectedExercise) return;

    const baseMuscle = muscleGroups.find((group) => group.name === selectedMuscle) || muscleGroups[0];
    const currentRenameMap = exerciseRenames[selectedMuscle] || {};
    const originalBaseExercise = baseMuscle.exercises.find(
      (exercise) => (currentRenameMap[exercise] || exercise) === selectedExercise
    );

    if (originalBaseExercise) {
      setExerciseRenames((current) => ({
        ...current,
        [selectedMuscle]: {
          ...(current[selectedMuscle] || {}),
          [originalBaseExercise]: cleanName,
        },
      }));
    } else {
      setCustomExercises((current) => ({
        ...current,
        [selectedMuscle]: (current[selectedMuscle] || []).map((exercise) =>
          exercise === selectedExercise ? cleanName : exercise
        ),
      }));
    }

    setDays((currentDays) => {
      const updatedDays = currentDays.map((day) => ({
        ...day,
        workout: (day.workout || []).map((item) =>
          item.muscle === selectedMuscle && item.exercise === selectedExercise
            ? { ...item, exercise: cleanName }
            : item
        ),
      }));

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
      } catch {
        // Storage unavailable
      }

      return updatedDays;
    });

    setSelectedExercise(cleanName);
    setRenameExerciseName('');
  };

  const addCustomExercise = () => {
    const cleanName = newExerciseName.trim();
    if (!cleanName) return;

    const currentExercises = getExercisesForMuscle(selectedMuscle);
    const alreadyExists = currentExercises.some(
      (exercise) => exercise.toLowerCase() === cleanName.toLowerCase()
    );

    if (alreadyExists) {
      setSelectedExercise(currentExercises.find((exercise) => exercise.toLowerCase() === cleanName.toLowerCase()) || cleanName);
      setNewExerciseName('');
      return;
    }

    setCustomExercises((current) => ({
      ...current,
      [selectedMuscle]: [...(current[selectedMuscle] || []), cleanName],
    }));

    setSelectedExercise(cleanName);
    setNewExerciseName('');
  };

  const addWorkoutExercise = () => {
    const muscle = muscleGroups.find((group) => group.name === selectedMuscle) || muscleGroups[0];
    const exerciseName = selectedExercise || getExercisesForMuscle(muscle.name)[0];

    setDays((currentDays) => {
      const updatedDays = currentDays.map((day, index) =>
        index === selectedDayIndex
          ? {
              ...day,
              workout: [
                ...(day.workout || []),
                {
                  id: Date.now(),
                  muscle: muscle.name,
                  exercise: exerciseName,
                  setsData: [
                    { id: Date.now() + 1, reps: '', weight: '', unit: 'lbs' },
                  ],
                },
              ],
            }
          : day
      );

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
      } catch {
        // Storage unavailable
      }

      return updatedDays;
    });
  };

  const selectedMuscleData = muscleGroups.find((group) => group.name === selectedMuscle) || muscleGroups[0];
  const selectedMuscleExercises = getExercisesForMuscle(selectedMuscle);

  const getExerciseHistory = (exerciseName) => {
    const history = [];

    days.forEach((day) => {
      (day.workout || []).forEach((item) => {
        if (item.exercise === exerciseName && (item.weight || item.reps || item.sets)) {
          history.push({ day: day.day, ...item });
        }
      });
    });

    return history;
  };

  const selectedExerciseHistory = getExerciseHistory(selectedExercise);
  const lastExerciseEntry = selectedExerciseHistory[selectedExerciseHistory.length - 1];

  const updateWorkoutExercise = (exerciseId, field, value) => {
    setDays((currentDays) => {
      const updatedDays = currentDays.map((day, index) =>
        index === selectedDayIndex
          ? {
              ...day,
              workout: (day.workout || []).map((item) =>
                item.id === exerciseId ? { ...item, [field]: value } : item
              ),
            }
          : day
      );

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
      } catch {
        // Storage unavailable
      }

      return updatedDays;
    });
  };

  const addSetToExercise = (exerciseId) => {
    setDays((currentDays) => {
      const updatedDays = currentDays.map((day, index) =>
        index === selectedDayIndex
          ? {
              ...day,
              workout: (day.workout || []).map((item) => {
                if (item.id !== exerciseId) return item;
                const currentSets = item.setsData || [{ id: Date.now(), reps: item.reps || '', weight: item.weight || '', unit: 'lbs' }];
                return {
                  ...item,
                  setsData: [
                    ...currentSets,
                    { id: Date.now(), reps: '', weight: '', unit: currentSets[currentSets.length - 1]?.unit || 'lbs' },
                  ],
                };
              }),
            }
          : day
      );

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
      } catch {
        // Storage unavailable
      }

      return updatedDays;
    });
  };

  const updateExerciseSet = (exerciseId, setId, field, value) => {
    setDays((currentDays) => {
      const updatedDays = currentDays.map((day, index) =>
        index === selectedDayIndex
          ? {
              ...day,
              workout: (day.workout || []).map((item) =>
                item.id === exerciseId
                  ? {
                      ...item,
                      setsData: (item.setsData || []).map((set) =>
                        set.id === setId ? { ...set, [field]: value } : set
                      ),
                    }
                  : item
              ),
            }
          : day
      );

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
      } catch {
        // Storage unavailable
      }

      return updatedDays;
    });
  };

  const removeExerciseSet = (exerciseId, setId) => {
    setDays((currentDays) => {
      const updatedDays = currentDays.map((day, index) =>
        index === selectedDayIndex
          ? {
              ...day,
              workout: (day.workout || []).map((item) => {
                if (item.id !== exerciseId) return item;
                const currentSets = item.setsData || [];
                if (currentSets.length <= 1) return item;
                return {
                  ...item,
                  setsData: currentSets.filter((set) => set.id !== setId),
                };
              }),
            }
          : day
      );

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
      } catch {
        // Storage unavailable
      }

      return updatedDays;
    });
  };

  const removeWorkoutExercise = (exerciseId) => {
    setDays((currentDays) => {
      const updatedDays = currentDays.map((day, index) =>
        index === selectedDayIndex
          ? {
              ...day,
              workout: (day.workout || []).filter((item) => item.id !== exerciseId),
            }
          : day
      );

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
      } catch {
        // Storage unavailable
      }

      return updatedDays;
    });
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
            <p className="text-2xl font-black">{winCount}</p>
            <p className="text-xs text-zinc-400">🏆 Wins</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4">
            <p className="text-2xl font-black">{eliteCount}</p>
            <p className="text-xs text-zinc-400">🔥 Élite</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4">
            <p className="text-2xl font-black">{progressCount}</p>
            <p className="text-xs text-zinc-400">💪 Progreso</p>
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

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
          <div className="mb-5">
            <h2 className="text-2xl font-black">🏋️ Workout Log</h2>
            <p className="text-sm text-zinc-400">
              Selecciona músculo, ejercicio y registra tu progreso del Día {selectedDay.day}
            </p>
          </div>

          <div className="mb-5 rounded-3xl border border-white/10 bg-black/30 p-4">
            <p className="mb-3 text-sm font-bold text-zinc-300">1. Selecciona músculo</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {muscleGroups.map((group) => {
                const active = selectedMuscle === group.name;
                return (
                  <button
                    key={group.name}
                    onClick={() => {
                      setSelectedMuscle(group.name);
                      const baseExercises = getExercisesForMuscle(group.name);
                      setSelectedExercise(baseExercises[0]);
                    }}
                    className={`rounded-2xl border p-3 text-left transition active:scale-[0.98] ${
                      active
                        ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                        : 'border-white/10 bg-zinc-950 text-zinc-300'
                    }`}
                  >
                    <div className="text-2xl">{group.emoji}</div>
                    <div className="mt-1 text-xs font-bold">{group.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-5 rounded-3xl border border-white/10 bg-black/30 p-4">
            <p className="mb-3 text-sm font-bold text-zinc-300">2. Selecciona ejercicio</p>
            <div className="flex gap-2">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-emerald-400/60"
              >
                {selectedMuscleExercises.map((exercise) => (
                  <option key={exercise}>{exercise}</option>
                ))}
              </select>
              <button
                onClick={addWorkoutExercise}
                className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-black active:scale-95"
              >
                + Añadir
              </button>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-zinc-950 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">Modificar nombre seleccionado</p>
              <div className="flex gap-2">
                <input
                  value={renameExerciseName}
                  onChange={(e) => setRenameExerciseName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveExerciseRename();
                  }}
                  placeholder={`Renombrar ${selectedExercise}`}
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-emerald-400/60"
                />
                <button
                  onClick={saveExerciseRename}
                  className="rounded-2xl border border-sky-400/40 bg-sky-500/10 px-4 py-3 text-sm font-black text-sky-300 active:scale-95"
                >
                  Cambiar
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Útil para crear variaciones como Open, Close, unilateral o máquina específica.
              </p>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-zinc-950 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">Agregar ejercicio nuevo</p>
              <div className="flex gap-2">
                <input
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addCustomExercise();
                  }}
                  placeholder={`Nuevo ejercicio para ${selectedMuscle}`}
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-emerald-400/60"
                />
                <button
                  onClick={addCustomExercise}
                  className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-300 active:scale-95"
                >
                  Guardar
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-zinc-950 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Historial rápido</p>
              {lastExerciseEntry ? (
                <p className="mt-1 text-sm text-zinc-300">
                  Última vez: Día {lastExerciseEntry.day} · {(lastExerciseEntry.setsData || []).length || lastExerciseEntry.sets || '-'} sets registrados
                </p>
              ) : (
                <p className="mt-1 text-sm text-zinc-500">
                  Todavía no hay historial para {selectedExercise}.
                </p>
              )}
            </div>
          </div>

          {(selectedDay.workout || []).length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-5 text-center">
              <p className="text-3xl">💪</p>
              <p className="mt-2 font-bold">Todavía no registraste ejercicios</p>
              <p className="mt-1 text-sm text-zinc-400">
                Añade tu primer ejercicio para medir progreso real en el gimnasio.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(selectedDay.workout || []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-black/40 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-emerald-300">{item.muscle || 'Músculo'}</p>
                      <p className="text-lg font-black">{item.exercise || 'Ejercicio'}</p>
                    </div>
                    <button
                      onClick={() => removeWorkoutExercise(item.id)}
                      className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm font-bold text-red-300"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(item.setsData || [{ id: `${item.id}-legacy`, reps: item.reps || '', weight: item.weight || '', unit: 'lbs' }]).map((set, setIndex) => (
                      <div key={set.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                            Set {setIndex + 1}
                          </p>
                          {(item.setsData || []).length > 1 && (
                            <button
                              onClick={() => removeExerciseSet(item.id, set.id)}
                              className="text-xs font-bold text-red-300"
                            >
                              Borrar set
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">Reps</label>
                            <input
                              value={set.reps}
                              onChange={(e) => updateExerciseSet(item.id, set.id, 'reps', e.target.value)}
                              inputMode="numeric"
                              placeholder="10"
                              className="w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-sm outline-none focus:border-emerald-400/60"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">Peso</label>
                            <input
                              value={set.weight}
                              onChange={(e) => updateExerciseSet(item.id, set.id, 'weight', e.target.value)}
                              inputMode="decimal"
                              placeholder="135"
                              className="w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-sm outline-none focus:border-emerald-400/60"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">Unidad</label>
                            <select
                              value={set.unit || 'lbs'}
                              onChange={(e) => updateExerciseSet(item.id, set.id, 'unit', e.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-sm outline-none focus:border-emerald-400/60"
                            >
                              <option value="lbs">LBS</option>
                              <option value="kg">KG</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addSetToExercise(item.id)}
                      className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-300 active:scale-95"
                    >
                      + Añadir set
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

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
