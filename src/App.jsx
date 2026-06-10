import { useEffect, useState } from 'react';
import { habits, muscleGroups } from './data.js';
import Header from './components/Header.jsx';
import Stats from './components/Stats.jsx';
import DaySelector from './components/DaySelector.jsx';
import HabitTracker from './components/HabitTracker.jsx';
import WorkoutLog from './components/WorkoutLog.jsx';
import TaskTracker from './components/TaskTracker.jsx';
import ChallengeSummary from './components/ChallengeSummary.jsx';
import FooterCards from './components/FooterCards.jsx';

const STORAGE_KEY = 'dopamine-reset-data-v2';
const SELECTED_DAY_KEY = 'dopamine-reset-selected-day';
const CUSTOM_EXERCISES_KEY = 'dopamine-reset-custom-exercises';
const EXERCISE_RENAMES_KEY = 'dopamine-reset-exercise-renames';
const LEGACY_STORAGE_KEY = 'dopamine-reset-data';
const CHALLENGE_LENGTH = 30;
const ANCHOR_DATE_KEY = '2026-05-28';
const ANCHOR_DAY_INDEX = 17;
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'habits', label: 'Hábitos', icon: '✓' },
  { id: 'workout', label: 'Workout', icon: '◇' },
  { id: 'tasks', label: 'Tasks', icon: '□' },
  { id: 'stats', label: 'Stats', icon: '▦' },
];

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};
const daysBetween = (startDateKey, endDateKey) => Math.round((parseDateKey(endDateKey) - parseDateKey(startDateKey)) / 86400000);
const parseDateKey = (dateKey) => new Date(`${dateKey}T00:00:00`);
const getCurrentChallengeIndex = () => Math.max(0, ANCHOR_DAY_INDEX + daysBetween(ANCHOR_DATE_KEY, toDateKey(new Date())));
const getChallengeStartDate = () => addDays(parseDateKey(ANCHOR_DATE_KEY), -ANCHOR_DAY_INDEX);
const getSavedSelectedDayIndex = () => {
  try {
    const saved = localStorage.getItem(SELECTED_DAY_KEY);
    const parsed = saved !== null ? Number(saved) : getCurrentChallengeIndex();
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : getCurrentChallengeIndex();
  } catch {
    return getCurrentChallengeIndex();
  }
};
const createDay = (dayNumber, dateKey) => ({
  day: dayNumber,
  date: dateKey,
  checks: Array(habits.length).fill(false),
  feeling: '🙂 Bien',
  workout: [],
  tasks: [],
});
const createInitialDays = (length = CHALLENGE_LENGTH) => {
  const startDate = getChallengeStartDate();
  return Array.from({ length }, (_, i) => createDay(i + 1, toDateKey(addDays(startDate, i))));
};
const safeLoad = (key, fallback) => { try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback; } catch { return fallback; } };
const safeSave = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
const parseDecimalInput = (value) => parseFloat(String(value).trim().replace(',', '.'));
const getExerciseTrackingType = (muscleName, exerciseName) => {
  if (muscleName === 'Cardio') return 'cardio';
  if (muscleName !== 'Abdominales') return 'weighted';
  const normalized = String(exerciseName || '').toLowerCase();
  if (normalized.includes('plank') || normalized.includes('plancha') || normalized.includes('hold')) return 'time';
  if (normalized.includes('cable') || normalized.includes('machine') || normalized.includes('weighted')) return 'weighted';
  return 'bodyweight';
};
const createInitialSet = (trackingType, unit = 'lbs') => {
  if (trackingType === 'time') return { id: Date.now() + Math.random(), duration: '' };
  if (trackingType === 'bodyweight') return { id: Date.now() + Math.random(), reps: '', weightMode: 'none', weight: '', unit };
  return { id: Date.now() + Math.random(), reps: '', weight: '', unit };
};
const normalizeDays = (loadedDays) => {
  const fallbackLength = Array.isArray(loadedDays) ? Math.max(CHALLENGE_LENGTH, getCurrentChallengeIndex() + 1, loadedDays.length) : Math.max(CHALLENGE_LENGTH, getCurrentChallengeIndex() + 1);
  const fallback = createInitialDays(fallbackLength);
  if (!Array.isArray(loadedDays)) return fallback;
  return fallback.map((baseDay, index) => {
    const savedDay = loadedDays[index] || {};
    const savedChecks = Array.isArray(savedDay.checks) ? savedDay.checks : [];
    return {
      ...baseDay,
      ...savedDay,
      checks: habits.map((_, habitIndex) => Boolean(savedChecks[habitIndex])),
      date: baseDay.date,
      feeling: savedDay.feeling || baseDay.feeling,
      workout: Array.isArray(savedDay.workout) ? savedDay.workout : [],
      tasks: Array.isArray(savedDay.tasks) ? savedDay.tasks : [],
    };
  });
};
const loadDays = () => {
  const current = safeLoad(STORAGE_KEY, null);
  if (current) return normalizeDays(current);
  const legacy = safeLoad(LEGACY_STORAGE_KEY, null);
  if (legacy) {
    const migrated = normalizeDays(legacy);
    safeSave(STORAGE_KEY, migrated);
    return migrated;
  }
  return createInitialDays(Math.max(CHALLENGE_LENGTH, getCurrentChallengeIndex() + 1));
};
const getScoreState = (score) => {
  if (score >= 13) return { emoji: '🔥', label: 'Día élite', color: 'text-emerald-300', ring: 'ring-emerald-400/40', bg: 'bg-emerald-500/10' };
  if (score >= 8) return { emoji: '💪', label: 'Buen progreso', color: 'text-orange-300', ring: 'ring-orange-400/40', bg: 'bg-orange-500/10' };
  return { emoji: '🧭', label: 'Recalibrar enfoque', color: 'text-sky-300', ring: 'ring-sky-400/40', bg: 'bg-sky-500/10' };
};

export default function ResetFocusTracker() {
  const [days, setDays] = useState(loadDays);
  const [selectedDayIndex, setSelectedDayIndex] = useState(getSavedSelectedDayIndex);
  const [customExercises, setCustomExercises] = useState(() => safeLoad(CUSTOM_EXERCISES_KEY, {}));
  const [exerciseRenames, setExerciseRenames] = useState(() => safeLoad(EXERCISE_RENAMES_KEY, {}));
  const [selectedMuscle, setSelectedMuscle] = useState('Pecho');
  const [selectedExercise, setSelectedExercise] = useState('Bench Press');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [renameExerciseName, setRenameExerciseName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showChallengeSummary, setShowChallengeSummary] = useState(() => Boolean(loadDays()[0]?.challengeCompleted));

  useEffect(() => safeSave(STORAGE_KEY, days), [days]);
  useEffect(() => { try { localStorage.setItem(SELECTED_DAY_KEY, String(selectedDayIndex)); } catch {} }, [selectedDayIndex]);
  useEffect(() => safeSave(CUSTOM_EXERCISES_KEY, customExercises), [customExercises]);
  useEffect(() => safeSave(EXERCISE_RENAMES_KEY, exerciseRenames), [exerciseRenames]);

  const selectedDay = days[selectedDayIndex];
  const setDaysAndSave = (updater) => setDays((current) => { const updated = typeof updater === 'function' ? updater(current) : updater; safeSave(STORAGE_KEY, updated); return updated; });
  const resetTracker = () => { if (!window.confirm('¿Seguro que quieres reiniciar todo el progreso?')) return; const fresh = createInitialDays(Math.max(CHALLENGE_LENGTH, getCurrentChallengeIndex() + 1)); setDays(fresh); localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(SELECTED_DAY_KEY); setSelectedDayIndex(getCurrentChallengeIndex()); setShowChallengeSummary(false); };
  const scoreForDay = (day) => day.checks.reduce((total, checked, i) => (checked ? total + habits[i].points : total), 0);
  const scores = days.map(scoreForDay);
  const challengeDays = days.slice(0, CHALLENGE_LENGTH);
  const challengeScores = challengeDays.map(scoreForDay);
  const challengeCompleted = Boolean(days[0]?.challengeCompleted);
  const selectedScore = scoreForDay(selectedDay);
  const completedHabits = selectedDay.checks.filter(Boolean).length;
  const completedTasks = (selectedDay.tasks || []).filter((task) => task.done).length;
  const totalPossible = habits.reduce((sum, habit) => sum + habit.points, 0);
  const progressPercent = Math.round((selectedScore / totalPossible) * 100);
  const scoresUntilSelectedDay = scores.slice(0, selectedDayIndex + 1);
  const progressCount = scoresUntilSelectedDay.filter((score) => score >= 8 && score <= 12).length;
  const eliteCount = scoresUntilSelectedDay.filter((score) => score >= 13).length;
  const winCount = progressCount + eliteCount;
  const lowCount = scoresUntilSelectedDay.filter((score) => score > 0 && score < 8).length;
  const trackedDays = days.slice(0, selectedDayIndex + 1);
  const activeScores = scoresUntilSelectedDay.filter((score) => score > 0);
  const averageScore = activeScores.length ? (activeScores.reduce((sum, score) => sum + score, 0) / activeScores.length).toFixed(1) : '0.0';
  const bestDay = trackedDays.reduce((best, day, index) => scoresUntilSelectedDay[index] > best.score ? { day: day.day, score: scoresUntilSelectedDay[index] } : best, { day: 0, score: 0 });
  const scoredDays = trackedDays.map((day, index) => ({ day: day.day, score: scoresUntilSelectedDay[index] })).filter((day) => day.score > 0);
  const lowestDay = scoredDays.reduce((lowest, day) => day.score < lowest.score ? day : lowest, scoredDays[0] || { day: 0, score: 0 });
  const currentStreak = scoresUntilSelectedDay.reduceRight((streak, score) => (streak.active && score >= 8 ? { count: streak.count + 1, active: true } : { count: streak.count, active: false }), { count: 0, active: true }).count;
  const habitStats = habits.map((habit, habitIndex) => {
    const count = trackedDays.filter((day) => day.checks[habitIndex]).length;
    const percent = trackedDays.length ? Math.round((count / trackedDays.length) * 100) : 0;
    return { name: habit.name, icon: habit.icon, count, percent };
  });
  const topHabits = [...habitStats].sort((a, b) => b.percent - a.percent).slice(0, 3);
  const weakHabits = [...habitStats].sort((a, b) => a.percent - b.percent).slice(0, 3);
  const workoutEntries = trackedDays.flatMap((day) => (day.workout || []).map((item) => ({ day: day.day, ...item })));
  const workoutDays = trackedDays.filter((day) => (day.workout || []).length > 0).length;
  const lastWorkoutDay = [...trackedDays].reverse().find((day) => (day.workout || []).length > 0);
  const lastWorkout = lastWorkoutDay ? { day: lastWorkoutDay.day, ...lastWorkoutDay.workout[0] } : null;
  const statsData = { scores, selectedDayIndex, winCount, eliteCount, progressCount, lowCount, averageScore, bestDay, lowestDay, currentStreak, topHabits, weakHabits, workoutSummary: { totalExercises: workoutEntries.length, workoutDays, lastWorkout }, getScoreState };
  const challengeHabitStats = habits.map((habit, habitIndex) => {
    const count = challengeDays.filter((day) => day.checks[habitIndex]).length;
    const percent = Math.round((count / CHALLENGE_LENGTH) * 100);
    return { name: habit.name, icon: habit.icon, count, percent };
  });
  const challengeWins = challengeScores.filter((score) => score >= 8).length;
  const challengeEliteDays = challengeScores.filter((score) => score >= 13).length;
  const challengeWorkoutDays = challengeDays.filter((day) => (day.workout || []).length > 0).length;
  const challengeAverageScore = challengeScores.length ? challengeScores.reduce((sum, score) => sum + score, 0) / challengeScores.length : 0;
  const challengeEffectiveness = Math.round((challengeAverageScore / totalPossible) * 100);
  const challengeLongestStreak = challengeScores.reduce((best, score) => {
    const current = score >= 8 ? best.current + 1 : 0;
    return { current, max: Math.max(best.max, current) };
  }, { current: 0, max: 0 }).max;
  const challengeSummaryData = {
    days: challengeDays,
    scores: challengeScores,
    habitStats: challengeHabitStats,
    topHabits: [...challengeHabitStats].sort((a, b) => b.percent - a.percent).slice(0, 3),
    weakHabits: [...challengeHabitStats].sort((a, b) => a.percent - b.percent).slice(0, 3),
    effectiveness: challengeEffectiveness,
    wins: challengeWins,
    eliteDays: challengeEliteDays,
    longestStreak: challengeLongestStreak,
    workoutDays: challengeWorkoutDays,
    completedAt: days[0]?.challengeCompletedAt,
    getScoreState,
  };
  let level = '💪 Nivel 1 — Recuperando Control';
  if (winCount >= 30) level = '👑 Nivel 4 — Nueva Identidad'; else if (winCount >= 15) level = '⚡ Nivel 3 — Disciplina'; else if (winCount >= 5) level = '🔥 Nivel 2 — Momentum';
  const scoreState = getScoreState(selectedScore);

  const toggleCheck = (habitIndex) => setDaysAndSave((current) => current.map((day, index) => index === selectedDayIndex ? { ...day, checks: day.checks.map((checked, i) => i === habitIndex ? !checked : checked) } : day));
  const updateFeeling = (value) => setDaysAndSave((current) => current.map((day, index) => index === selectedDayIndex ? { ...day, feeling: value } : day));
  const completeChallenge = () => {
    if (!window.confirm('¿Quieres culminar este challenge y ver tu resumen final?')) return;
    setDaysAndSave((current) => current.map((day, index) => index === 0 ? { ...day, challengeCompleted: true, challengeCompletedAt: toDateKey(new Date()) } : day));
    setShowChallengeSummary(true);
  };
  const selectCalendarDate = (dateKey) => {
    const existingIndex = days.findIndex((day) => day.date === dateKey);
    if (existingIndex >= 0) {
      setSelectedDayIndex(existingIndex);
      return;
    }

    const firstDate = parseDateKey(days[0].date);
    const selectedDate = parseDateKey(dateKey);
    if (selectedDate < firstDate) return;

    const next = [...days];
    let cursor = parseDateKey(next[next.length - 1].date);
    while (cursor < selectedDate) {
      cursor = addDays(cursor, 1);
      next.push(createDay(next.length + 1, toDateKey(cursor)));
    }
    setDaysAndSave(next);
    setSelectedDayIndex(next.findIndex((day) => day.date === dateKey));
  };
  const addTask = (title) => {
    const clean = title.trim();
    if (!clean) return;
    setDaysAndSave((current) => current.map((day, index) => index === selectedDayIndex ? { ...day, tasks: [{ id: Date.now() + Math.random(), title: clean, done: false }, ...(day.tasks || [])] } : day));
  };
  const toggleTask = (taskId) => setDaysAndSave((current) => current.map((day, index) => index === selectedDayIndex ? { ...day, tasks: (day.tasks || []).map((task) => task.id === taskId ? { ...task, done: !task.done } : task) } : day));
  const removeTask = (taskId) => setDaysAndSave((current) => current.map((day, index) => index === selectedDayIndex ? { ...day, tasks: (day.tasks || []).filter((task) => task.id !== taskId) } : day));
  const getExercisesForMuscle = (muscleName) => { const base = muscleGroups.find((g) => g.name === muscleName) || muscleGroups[0]; const custom = customExercises[muscleName] || []; const renames = exerciseRenames[muscleName] || {}; return [...new Set([...base.exercises.map((ex) => renames[ex] || ex), ...custom])]; };
  const selectedMuscleExercises = getExercisesForMuscle(selectedMuscle);

  const saveExerciseRename = () => {
    const clean = renameExerciseName.trim(); if (!clean || clean === selectedExercise) return;
    const base = muscleGroups.find((g) => g.name === selectedMuscle) || muscleGroups[0]; const map = exerciseRenames[selectedMuscle] || {}; const original = base.exercises.find((ex) => (map[ex] || ex) === selectedExercise);
    if (original) setExerciseRenames((cur) => ({ ...cur, [selectedMuscle]: { ...(cur[selectedMuscle] || {}), [original]: clean } })); else setCustomExercises((cur) => ({ ...cur, [selectedMuscle]: (cur[selectedMuscle] || []).map((ex) => ex === selectedExercise ? clean : ex) }));
    setDaysAndSave((current) => current.map((day) => ({ ...day, workout: (day.workout || []).map((item) => item.muscle === selectedMuscle && item.exercise === selectedExercise ? { ...item, exercise: clean } : item) })));
    setSelectedExercise(clean); setRenameExerciseName('');
  };
  const addCustomExercise = () => { const clean = newExerciseName.trim(); if (!clean) return; const current = getExercisesForMuscle(selectedMuscle); const existing = current.find((ex) => ex.toLowerCase() === clean.toLowerCase()); if (existing) { setSelectedExercise(existing); setNewExerciseName(''); return; } setCustomExercises((cur) => ({ ...cur, [selectedMuscle]: [...(cur[selectedMuscle] || []), clean] })); setSelectedExercise(clean); setNewExerciseName(''); };
  const addWorkoutExercise = () => { const muscle = muscleGroups.find((g) => g.name === selectedMuscle) || muscleGroups[0]; const exerciseName = selectedExercise || getExercisesForMuscle(muscle.name)[0]; const trackingType = getExerciseTrackingType(muscle.name, exerciseName); setDaysAndSave((current) => current.map((day, index) => index === selectedDayIndex ? { ...day, workout: [{ id: Date.now() + Math.random(), muscle: muscle.name, exercise: exerciseName, type: trackingType === 'cardio' ? 'cardio' : 'strength', trackingType, setsData: trackingType === 'cardio' ? [] : [createInitialSet(trackingType)], cardioData: { time: '', distance: '', distanceUnit: 'km' } }, ...(day.workout || [])] } : day)); };
  const getExerciseHistory = (exerciseName) => { const history = []; days.forEach((day) => (day.workout || []).forEach((item) => { const strength = (item.setsData || []).some((set) => set.reps || set.weight || set.duration); const cardio = item.cardioData?.time || item.cardioData?.distance; if (item.exercise === exerciseName && (strength || cardio)) history.push({ day: day.day, ...item }); })); return history; };
  const lastExerciseEntry = getExerciseHistory(selectedExercise).at(-1);
  const selectedExerciseHistory = getExerciseHistory(selectedExercise);
  const addSetToExercise = (exerciseId) => setDaysAndSave((current) => current.map((day, dayIndex) => dayIndex === selectedDayIndex ? { ...day, workout: (day.workout || []).map((item) => { if (item.id !== exerciseId) return item; const trackingType = item.trackingType || getExerciseTrackingType(item.muscle, item.exercise); const currentSets = item.setsData?.length ? item.setsData : [createInitialSet(trackingType)]; return { ...item, trackingType, setsData: [...currentSets, createInitialSet(trackingType, currentSets.at(-1)?.unit || 'lbs')] }; }) } : day));
  const updateExerciseSet = (exerciseId, setIndex, field, value) => setDaysAndSave((current) => current.map((day, dayIndex) => dayIndex === selectedDayIndex ? { ...day, workout: (day.workout || []).map((item) => item.id === exerciseId ? { ...item, setsData: (item.setsData || []).map((set, index) => index === setIndex ? { ...set, [field]: value } : set) } : item) } : day));
  const removeExerciseSet = (exerciseId, setIndex) => setDaysAndSave((current) => current.map((day, dayIndex) => dayIndex === selectedDayIndex ? { ...day, workout: (day.workout || []).map((item) => item.id !== exerciseId ? item : { ...item, setsData: (item.setsData || []).length <= 1 ? item.setsData : item.setsData.filter((_, index) => index !== setIndex) }) } : day));
  const updateCardioData = (exerciseId, field, value) => setDaysAndSave((current) => current.map((day, dayIndex) => dayIndex === selectedDayIndex ? { ...day, workout: (day.workout || []).map((item) => item.id === exerciseId ? { ...item, cardioData: { ...(item.cardioData || {}), [field]: value } } : item) } : day));
  const removeWorkoutExercise = (exerciseId) => setDaysAndSave((current) => current.map((day, index) => index === selectedDayIndex ? { ...day, workout: (day.workout || []).filter((item) => item.id !== exerciseId) } : day));
  const calculatePace = (time, distance) => {
    if (!time || !distance) return null;
    const parts = String(time).trim().split(':');
    const totalMinutes = parts.length === 2
      ? (parseInt(parts[0], 10) || 0) + (parseInt(parts[1], 10) || 0) / 60
      : parseDecimalInput(time);
    const numericDistance = parseDecimalInput(distance);
    if (!totalMinutes || !numericDistance) return null;
    const pace = totalMinutes / numericDistance;
    const roundedSeconds = Math.round((pace - Math.floor(pace)) * 60);
    const minutes = Math.floor(pace) + (roundedSeconds === 60 ? 1 : 0);
    const seconds = roundedSeconds === 60 ? 0 : roundedSeconds;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const workoutProps = {
    selectedDay,
    selectedMuscle,
    setSelectedMuscle,
    selectedExercise,
    setSelectedExercise,
    selectedMuscleExercises,
    muscleGroups,
    getExercisesForMuscle,
    addWorkoutExercise,
    renameExerciseName,
    setRenameExerciseName,
    saveExerciseRename,
    newExerciseName,
    setNewExerciseName,
    addCustomExercise,
    lastExerciseEntry,
    selectedExerciseHistory,
    removeWorkoutExercise,
    updateCardioData,
    calculatePace,
    updateExerciseSet,
    removeExerciseSet,
    addSetToExercise,
  };

  const dashboardMetrics = [
    { label: 'Wins', value: winCount, accent: 'text-emerald-300' },
    { label: 'Élite', value: eliteCount, accent: 'text-orange-300' },
    { label: 'Hábitos', value: `${completedHabits}/${habits.length}`, accent: 'text-sky-300' },
    { label: 'Tasks', value: `${completedTasks}/${(selectedDay.tasks || []).length}`, accent: 'text-violet-300' },
  ];
  const canCompleteChallenge = selectedDayIndex >= CHALLENGE_LENGTH - 1;

  const renderActiveTab = () => {
    if (activeTab === 'habits') {
      return (
        <HabitTracker selectedDay={selectedDay} habits={habits} completedHabits={completedHabits} toggleCheck={toggleCheck} updateFeeling={updateFeeling} />
      );
    }

    if (activeTab === 'workout') {
      return (
        <WorkoutLog {...workoutProps} />
      );
    }

    if (activeTab === 'stats') {
      return (
        <Stats {...statsData} />
      );
    }

    if (activeTab === 'tasks') {
      return (
        <TaskTracker selectedDay={selectedDay} addTask={addTask} toggleTask={toggleTask} removeTask={removeTask} />
      );
    }

    return (
      <>
        <Header scoreState={scoreState} selectedScore={selectedScore} progressPercent={progressPercent} />
        <section className="mb-5 grid grid-cols-2 gap-3">
          {dashboardMetrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4 shadow-xl shadow-black/20">
              <p className={`text-2xl font-black ${metric.accent}`}>{metric.value}</p>
              <p className="text-xs text-zinc-400">{metric.label}</p>
            </div>
          ))}
        </section>
        <DaySelector days={days} level={level} selectedDayIndex={selectedDayIndex} setSelectedDayIndex={setSelectedDayIndex} selectCalendarDate={selectCalendarDate} scoreForDay={scoreForDay} getScoreState={getScoreState} />
        <section className="mb-5 rounded-[2rem] border border-white/10 bg-zinc-900/80 p-4 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black">Challenge</h3>
              <p className="text-sm text-zinc-400">{challengeCompleted ? 'Tu primer challenge ya está culminado.' : `Día ${Math.min(selectedDayIndex + 1, CHALLENGE_LENGTH)} de ${CHALLENGE_LENGTH}`}</p>
            </div>
            {challengeCompleted ? (
              <button type="button" onClick={() => setShowChallengeSummary((current) => !current)} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-black transition active:scale-95">
                {showChallengeSummary ? 'Ocultar' : 'Ver resumen'}
              </button>
            ) : canCompleteChallenge ? (
              <button type="button" onClick={completeChallenge} className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-200 transition active:scale-95">
                Culminar
              </button>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-right">
                <p className="text-xs font-bold uppercase text-zinc-500">Final</p>
                <p className="text-sm font-black text-zinc-300">Día 30</p>
              </div>
            )}
          </div>
        </section>
        {showChallengeSummary && <ChallengeSummary summary={challengeSummaryData} />}
        <FooterCards resetTracker={resetTracker} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto max-w-md px-4 pb-28 pt-6 md:max-w-5xl md:px-8">
        {renderActiveTab()}
      </div>
      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

function BottomTabBar({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/90 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 shadow-2xl shadow-black/60 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1.5 md:max-w-xl">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl px-1.5 py-2.5 text-center transition active:scale-95 ${active ? 'bg-white text-black shadow-lg shadow-emerald-400/10' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="block text-xl leading-none">{tab.icon}</span>
              <span className="mt-1 block text-[10px] font-black">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
