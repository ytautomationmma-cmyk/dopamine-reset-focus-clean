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
const LEGACY_ANCHOR_DATE_KEY = '2026-05-28';
const LEGACY_ANCHOR_DAY_INDEX = 17;
const CHALLENGE_DURATIONS = [7, 15, 30, 45, 60, 90, 180];
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
const getLegacyChallengeStartDateKey = () => toDateKey(addDays(parseDateKey(LEGACY_ANCHOR_DATE_KEY), -LEGACY_ANCHOR_DAY_INDEX));
const getCurrentChallengeIndex = (startDateKey = toDateKey(new Date())) => Math.max(0, daysBetween(startDateKey, toDateKey(new Date())));
const getChallengeEndDateKey = (startDateKey, duration) => toDateKey(addDays(parseDateKey(startDateKey), duration - 1));
const createChallengeId = () => `challenge-${Date.now()}`;
const isDateInRange = (dateKey, startDateKey, endDateKey) => dateKey >= startDateKey && dateKey <= endDateKey;
const getInitialChallengeRecord = (loadedDays) => {
  const startDate = getChallengeStartDateKey(loadedDays);
  const duration = loadedDays?.[0]?.challengeLength || CHALLENGE_LENGTH;
  return {
    id: 'initial-challenge',
    title: 'Reset & Focus',
    startDate,
    duration,
    endDate: getChallengeEndDateKey(startDate, duration),
    status: loadedDays?.[0]?.challengeCompleted ? 'completed' : 'active',
    completedAt: loadedDays?.[0]?.challengeCompletedAt,
  };
};
const getSavedSelectedDayIndex = (fallback = 0) => {
  try {
    const saved = localStorage.getItem(SELECTED_DAY_KEY);
    const parsed = saved !== null ? Number(saved) : fallback;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
};
const getInitialSelectedDayIndex = (loadedDays) => {
  const todayIndex = loadedDays.findIndex((day) => day.date === toDateKey(new Date()));
  return todayIndex >= 0 ? todayIndex : Math.min(getSavedSelectedDayIndex(0), Math.max(0, loadedDays.length - 1));
};
const getChallengeStartDateKey = (loadedDays) => {
  if (Array.isArray(loadedDays) && loadedDays[0]?.challengeStartSource) return loadedDays[0].challengeStartDate || loadedDays[0].date;
  if (Array.isArray(loadedDays)) return getLegacyChallengeStartDateKey();
  return toDateKey(new Date());
};
const createDay = (dayNumber, dateKey, challengeStartDateKey, challengeLength = CHALLENGE_LENGTH, challengeStartSource = 'device') => ({
  day: dayNumber,
  date: dateKey,
  challengeDay: dayNumber <= challengeLength ? dayNumber : null,
  challengeId: dayNumber <= challengeLength ? 'initial-challenge' : null,
  ...(dayNumber === 1 ? {
    challengeStartDate: challengeStartDateKey,
    challengeStartSource,
    challengeLength,
    challenges: [{
      id: 'initial-challenge',
      title: 'Reset & Focus',
      startDate: challengeStartDateKey,
      duration: challengeLength,
      endDate: getChallengeEndDateKey(challengeStartDateKey, challengeLength),
      status: 'active',
    }],
    activeChallengeId: 'initial-challenge',
  } : {}),
  checks: Array(habits.length).fill(false),
  feeling: '🙂 Bien',
  workout: [],
  tasks: [],
});
const createCalendarDay = (dayNumber, dateKey) => ({
  day: dayNumber,
  date: dateKey,
  challengeDay: null,
  challengeId: null,
  checks: Array(habits.length).fill(false),
  feeling: '🙂 Bien',
  workout: [],
  tasks: [],
});
const createInitialDays = (length = CHALLENGE_LENGTH, startDateKey = toDateKey(new Date()), challengeLength = CHALLENGE_LENGTH, challengeStartSource = 'device') => {
  const startDate = parseDateKey(startDateKey);
  return Array.from({ length }, (_, i) => createDay(i + 1, toDateKey(addDays(startDate, i)), startDateKey, challengeLength, challengeStartSource));
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
  const challengeStartDateKey = getChallengeStartDateKey(loadedDays);
  const challengeStartSource = loadedDays?.[0]?.challengeStartSource || (Array.isArray(loadedDays) ? 'legacy-anchor' : 'device');
  const currentIndex = getCurrentChallengeIndex(challengeStartDateKey);
  const fallbackLength = Array.isArray(loadedDays) ? Math.max(CHALLENGE_LENGTH, currentIndex + 1, loadedDays.length) : Math.max(CHALLENGE_LENGTH, currentIndex + 1);
  const fallback = createInitialDays(fallbackLength, challengeStartDateKey, loadedDays?.[0]?.challengeLength || CHALLENGE_LENGTH, challengeStartSource);
  const initialChallenge = getInitialChallengeRecord(loadedDays);
  const challenges = Array.isArray(loadedDays?.[0]?.challenges) ? loadedDays[0].challenges : [initialChallenge];
  const savedActiveChallengeId = loadedDays?.[0]?.activeChallengeId;
  const activeChallengeId = challenges.some((challenge) => challenge.id === savedActiveChallengeId && challenge.status === 'active')
    ? savedActiveChallengeId
    : challenges.find((challenge) => challenge.status === 'active')?.id || null;
  if (!Array.isArray(loadedDays)) return fallback;
  return fallback.map((baseDay, index) => {
    const savedDay = loadedDays[index] || {};
    const savedChecks = Array.isArray(savedDay.checks) ? savedDay.checks : [];
    return {
      ...baseDay,
      ...savedDay,
      checks: habits.map((_, habitIndex) => Boolean(savedChecks[habitIndex])),
      date: baseDay.date,
      challengeDay: savedDay.challengeDay ?? baseDay.challengeDay,
      challengeId: savedDay.challengeId ?? baseDay.challengeId,
      ...(index === 0 ? { challengeStartDate: challengeStartDateKey, challengeStartSource, challengeLength: loadedDays?.[0]?.challengeLength || CHALLENGE_LENGTH, challenges, activeChallengeId } : {}),
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
  return createInitialDays();
};
const getScoreState = (score) => {
  if (score >= 13) return { emoji: '🔥', label: 'Día élite', color: 'text-emerald-300', ring: 'ring-emerald-400/40', bg: 'bg-emerald-500/10' };
  if (score >= 8) return { emoji: '💪', label: 'Buen progreso', color: 'text-orange-300', ring: 'ring-orange-400/40', bg: 'bg-orange-500/10' };
  return { emoji: '🧭', label: 'Recalibrar enfoque', color: 'text-sky-300', ring: 'ring-sky-400/40', bg: 'bg-sky-500/10' };
};

export default function ResetFocusTracker() {
  const [days, setDays] = useState(loadDays);
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => getInitialSelectedDayIndex(loadDays()));
  const [customExercises, setCustomExercises] = useState(() => safeLoad(CUSTOM_EXERCISES_KEY, {}));
  const [exerciseRenames, setExerciseRenames] = useState(() => safeLoad(EXERCISE_RENAMES_KEY, {}));
  const [selectedMuscle, setSelectedMuscle] = useState('Pecho');
  const [selectedExercise, setSelectedExercise] = useState('Bench Press');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [renameExerciseName, setRenameExerciseName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardView, setDashboardView] = useState('home');
  const [selectedReportChallengeId, setSelectedReportChallengeId] = useState(null);
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [newChallengeDuration, setNewChallengeDuration] = useState(7);

  useEffect(() => safeSave(STORAGE_KEY, days), [days]);
  useEffect(() => { try { localStorage.setItem(SELECTED_DAY_KEY, String(selectedDayIndex)); } catch {} }, [selectedDayIndex]);
  useEffect(() => safeSave(CUSTOM_EXERCISES_KEY, customExercises), [customExercises]);
  useEffect(() => safeSave(EXERCISE_RENAMES_KEY, exerciseRenames), [exerciseRenames]);

  const selectedDay = days[selectedDayIndex];
  const setDaysAndSave = (updater) => setDays((current) => { const updated = typeof updater === 'function' ? updater(current) : updater; safeSave(STORAGE_KEY, updated); return updated; });
  const resetTracker = () => { if (!window.confirm('¿Seguro que quieres reiniciar todo el progreso?')) return; const fresh = createInitialDays(); setDays(fresh); localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(SELECTED_DAY_KEY); setSelectedDayIndex(0); setDashboardView('home'); };
  const scoreForDay = (day) => day.checks.reduce((total, checked, i) => (checked ? total + habits[i].points : total), 0);
  const scores = days.map(scoreForDay);
  const challenges = Array.isArray(days[0]?.challenges) ? days[0].challenges : [];
  const activeChallenge = challenges.find((challenge) => challenge.id === days[0]?.activeChallengeId && challenge.status === 'active') || null;
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
  const bestDay = trackedDays.reduce((best, day, index) => scoresUntilSelectedDay[index] > best.score ? { day: day.challengeDay, date: day.date, score: scoresUntilSelectedDay[index] } : best, { day: null, date: null, score: 0 });
  const scoredDays = trackedDays.map((day, index) => ({ day: day.challengeDay, date: day.date, score: scoresUntilSelectedDay[index] })).filter((day) => day.score > 0);
  const lowestDay = scoredDays.reduce((lowest, day) => day.score < lowest.score ? day : lowest, scoredDays[0] || { day: 0, score: 0 });
  const currentStreak = scoresUntilSelectedDay.reduceRight((streak, score) => (streak.active && score >= 8 ? { count: streak.count + 1, active: true } : { count: streak.count, active: false }), { count: 0, active: true }).count;
  const habitStats = habits.map((habit, habitIndex) => {
    const count = trackedDays.filter((day) => day.checks[habitIndex]).length;
    const percent = trackedDays.length ? Math.round((count / trackedDays.length) * 100) : 0;
    return { name: habit.name, icon: habit.icon, count, percent };
  });
  const topHabits = [...habitStats].sort((a, b) => b.percent - a.percent).slice(0, 3);
  const weakHabits = [...habitStats].sort((a, b) => a.percent - b.percent).slice(0, 3);
  const workoutEntries = trackedDays.flatMap((day) => (day.workout || []).map((item) => ({ day: day.challengeDay, date: day.date, ...item })));
  const workoutDays = trackedDays.filter((day) => (day.workout || []).length > 0).length;
  const lastWorkoutDay = [...trackedDays].reverse().find((day) => (day.workout || []).length > 0);
  const lastWorkout = lastWorkoutDay ? { day: lastWorkoutDay.challengeDay, date: lastWorkoutDay.date, ...lastWorkoutDay.workout[0] } : null;
  const buildStatsSnapshot = (snapshotDays) => {
    const snapshotScores = snapshotDays.map(scoreForDay);
    const snapshotTrackedDays = snapshotDays;
    const snapshotActiveScores = snapshotScores.filter((score) => score > 0);
    const snapshotProgressCount = snapshotScores.filter((score) => score >= 8 && score <= 12).length;
    const snapshotEliteCount = snapshotScores.filter((score) => score >= 13).length;
    const snapshotWinCount = snapshotProgressCount + snapshotEliteCount;
    const snapshotLowCount = snapshotScores.filter((score) => score > 0 && score < 8).length;
    const snapshotAverageScore = snapshotActiveScores.length ? (snapshotActiveScores.reduce((sum, score) => sum + score, 0) / snapshotActiveScores.length).toFixed(1) : '0.0';
    const snapshotBestDay = snapshotTrackedDays.reduce((best, day, index) => snapshotScores[index] > best.score ? { day: day.challengeDay, date: day.date, score: snapshotScores[index] } : best, { day: null, date: null, score: 0 });
    const snapshotScoredDays = snapshotTrackedDays.map((day, index) => ({ day: day.challengeDay, date: day.date, score: snapshotScores[index] })).filter((day) => day.score > 0);
    const snapshotLowestDay = snapshotScoredDays.reduce((lowest, day) => day.score < lowest.score ? day : lowest, snapshotScoredDays[0] || { day: 0, score: 0 });
    const snapshotCurrentStreak = snapshotScores.reduceRight((streak, score) => (streak.active && score >= 8 ? { count: streak.count + 1, active: true } : { count: streak.count, active: false }), { count: 0, active: true }).count;
    const snapshotHabitStats = habits.map((habit, habitIndex) => {
      const count = snapshotTrackedDays.filter((day) => day.checks[habitIndex]).length;
      const percent = snapshotTrackedDays.length ? Math.round((count / snapshotTrackedDays.length) * 100) : 0;
      return { name: habit.name, icon: habit.icon, count, percent };
    });
    const snapshotWorkoutEntries = snapshotTrackedDays.flatMap((day) => (day.workout || []).map((item) => ({ day: day.challengeDay, date: day.date, ...item })));
    const snapshotWorkoutDays = snapshotTrackedDays.filter((day) => (day.workout || []).length > 0).length;
    const snapshotLastWorkoutDay = [...snapshotTrackedDays].reverse().find((day) => (day.workout || []).length > 0);
    return {
      days: snapshotDays,
      scores: snapshotScores,
      selectedDayIndex: Math.max(0, snapshotDays.length - 1),
      winCount: snapshotWinCount,
      eliteCount: snapshotEliteCount,
      progressCount: snapshotProgressCount,
      lowCount: snapshotLowCount,
      averageScore: snapshotAverageScore,
      bestDay: snapshotBestDay,
      lowestDay: snapshotLowestDay,
      currentStreak: snapshotCurrentStreak,
      topHabits: [...snapshotHabitStats].sort((a, b) => b.percent - a.percent).slice(0, 3),
      weakHabits: [...snapshotHabitStats].sort((a, b) => a.percent - b.percent).slice(0, 3),
      workoutSummary: {
        totalExercises: snapshotWorkoutEntries.length,
        workoutDays: snapshotWorkoutDays,
        lastWorkout: snapshotLastWorkoutDay ? { day: snapshotLastWorkoutDay.challengeDay, date: snapshotLastWorkoutDay.date, ...snapshotLastWorkoutDay.workout[0] } : null,
      },
      getScoreState,
    };
  };
  const buildChallengeSummary = (challenge) => {
    const challengeDays = days.filter((day) => day.challengeId === challenge.id && isDateInRange(day.date, challenge.startDate, challenge.endDate));
    const challengeScores = challengeDays.map(scoreForDay);
    const challengeHabitStats = habits.map((habit, habitIndex) => {
      const count = challengeDays.filter((day) => day.checks[habitIndex]).length;
      const percent = challenge.duration ? Math.round((count / challenge.duration) * 100) : 0;
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
    return {
      ...challenge,
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
      challengeLength: challenge.duration,
      getScoreState,
    };
  };
  const completedChallengeSummaries = challenges.filter((challenge) => challenge.status === 'completed').map(buildChallengeSummary);
  const activeChallengeSummary = activeChallenge ? buildChallengeSummary(activeChallenge) : null;
  const selectedReportSummary = [...completedChallengeSummaries, activeChallengeSummary].filter(Boolean).find((summary) => summary.id === selectedReportChallengeId) || completedChallengeSummaries.at(-1) || activeChallengeSummary;
  const todayKey = toDateKey(new Date());
  const last30Days = days.filter((day) => day.date <= todayKey).slice(-30);
  const statsData = { ...buildStatsSnapshot(last30Days.length ? last30Days : [selectedDay]), activeChallengeSummary };
  let level = '💪 Nivel 1 — Recuperando Control';
  if (winCount >= 30) level = '👑 Nivel 4 — Nueva Identidad'; else if (winCount >= 15) level = '⚡ Nivel 3 — Disciplina'; else if (winCount >= 5) level = '🔥 Nivel 2 — Momentum';
  const scoreState = getScoreState(selectedScore);

  const toggleCheck = (habitIndex) => setDaysAndSave((current) => current.map((day, index) => index === selectedDayIndex ? { ...day, checks: day.checks.map((checked, i) => i === habitIndex ? !checked : checked) } : day));
  const updateFeeling = (value) => setDaysAndSave((current) => current.map((day, index) => index === selectedDayIndex ? { ...day, feeling: value } : day));
  const completeChallenge = () => {
    if (!activeChallenge) return;
    if (!window.confirm('¿Quieres culminar este challenge y ver tu resumen final?')) return;
    const completedAt = toDateKey(new Date());
    setDaysAndSave((current) => current.map((day, index) => {
      if (index !== 0) return day;
      const nextChallenges = (day.challenges || []).map((challenge) => challenge.id === activeChallenge.id ? { ...challenge, status: 'completed', completedAt } : challenge);
      return {
        ...day,
        challenges: nextChallenges,
        activeChallengeId: null,
        ...(activeChallenge.id === 'initial-challenge' ? { challengeCompleted: true, challengeCompletedAt: completedAt } : {}),
      };
    }));
    setSelectedReportChallengeId(activeChallenge.id);
    setDashboardView('challengeReport');
  };
  const startNewChallenge = () => {
    const duration = Number(newChallengeDuration);
    if (!CHALLENGE_DURATIONS.includes(duration) || !selectedDay?.date) return;
    const startDate = selectedDay.date;
    const endDate = getChallengeEndDateKey(startDate, duration);
    const id = createChallengeId();
    const newChallenge = { id, title: 'Reset & Focus', startDate, duration, endDate, status: 'active' };
    let nextSelectedIndex = selectedDayIndex;
    setDaysAndSave((current) => {
      let next = [...current];
      const firstDate = parseDateKey(next[0]?.date || startDate);
      const start = parseDateKey(startDate);
      if (start < firstDate) return current;
      let cursor = parseDateKey(next[next.length - 1].date);
      while (cursor < parseDateKey(endDate)) {
        cursor = addDays(cursor, 1);
        next.push(createCalendarDay(next.length + 1, toDateKey(cursor)));
      }
      next = next.map((day, index) => {
        if (index === 0) {
          return { ...day, challenges: [...(day.challenges || []), newChallenge], activeChallengeId: id };
        }
        if (!isDateInRange(day.date, startDate, endDate)) return day;
        return { ...day, challengeId: id, challengeDay: daysBetween(startDate, day.date) + 1 };
      });
      if (isDateInRange(next[0].date, startDate, endDate)) {
        next[0] = { ...next[0], challengeId: id, challengeDay: daysBetween(startDate, next[0].date) + 1 };
      }
      nextSelectedIndex = next.findIndex((day) => day.date === startDate);
      return next;
    });
    if (nextSelectedIndex >= 0) setSelectedDayIndex(nextSelectedIndex);
    setShowNewChallenge(false);
    setDashboardView('home');
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
      next.push(createCalendarDay(next.length + 1, toDateKey(cursor)));
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
  const getExerciseHistory = (exerciseName) => { const history = []; days.forEach((day) => (day.workout || []).forEach((item) => { const strength = (item.setsData || []).some((set) => set.reps || set.weight || set.duration); const cardio = item.cardioData?.time || item.cardioData?.distance; if (item.exercise === exerciseName && (strength || cardio)) history.push({ day: day.challengeDay, challengeDay: day.challengeDay, date: day.date, ...item }); })); return history; };
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
  const selectedDateKey = selectedDay.date;
  const canCompleteChallenge = activeChallenge && selectedDateKey >= activeChallenge.endDate;
  const selectedChallengeDay = selectedDay.challengeDay;
  const activeChallengeLength = activeChallenge?.duration || 0;

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

    if (dashboardView === 'challengeHistory') {
      return (
        <ChallengeHistory
          summaries={completedChallengeSummaries}
          onBack={() => setDashboardView('home')}
          onOpenReport={(id) => { setSelectedReportChallengeId(id); setDashboardView('challengeReport'); }}
        />
      );
    }

    if (dashboardView === 'challengeReport') {
      return (
        <main className="space-y-4">
          <button type="button" onClick={() => setDashboardView('challengeHistory')} className="rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm font-black text-zinc-200 transition active:scale-95">
            ← Challenge History
          </button>
          {selectedReportSummary ? (
            <ChallengeSummary summary={selectedReportSummary} />
          ) : (
            <section className="rounded-[2rem] border border-dashed border-white/10 bg-zinc-900/60 p-6 text-center">
              <p className="text-lg font-black">Todavía no hay resumen disponible</p>
              <p className="mt-1 text-sm text-zinc-500">Cuando culmines un challenge, aparecerá aquí.</p>
            </section>
          )}
        </main>
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
              <p className="text-sm text-zinc-400">
                {activeChallenge ? (selectedChallengeDay ? `Día ${selectedChallengeDay} de ${activeChallengeLength}` : 'Challenge activo. Selecciona una fecha dentro del ciclo.') : completedChallengeSummaries.length ? 'Historial disponible. Puedes comenzar otro ciclo.' : 'Comienza tu primer ciclo cuando estés listo.'}
              </p>
            </div>
            {activeChallenge && canCompleteChallenge ? (
              <button type="button" onClick={completeChallenge} className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-200 transition active:scale-95">
                Culminar
              </button>
            ) : activeChallenge ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-right">
                <p className="text-xs font-bold uppercase text-zinc-500">Final</p>
                <p className="text-sm font-black text-zinc-300">{formatShortDate(activeChallenge.endDate)}</p>
              </div>
            ) : (
              <button type="button" onClick={() => setShowNewChallenge((open) => !open)} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-black transition active:scale-95">
                Nuevo
              </button>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            {completedChallengeSummaries.length > 0 && (
              <button type="button" onClick={() => setDashboardView('challengeHistory')} className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-black text-zinc-200 transition active:scale-95">
                Historial
              </button>
            )}
            {!activeChallenge && completedChallengeSummaries.length > 0 && (
              <button type="button" onClick={() => setShowNewChallenge((open) => !open)} className="flex-1 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-200 transition active:scale-95">
                Nuevo challenge
              </button>
            )}
          </div>
          {showNewChallenge && !activeChallenge && (
            <NewChallengeForm
              duration={newChallengeDuration}
              setDuration={setNewChallengeDuration}
              startDate={selectedDay.date}
              onCancel={() => setShowNewChallenge(false)}
              onStart={startNewChallenge}
            />
          )}
        </section>
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

function formatShortDate(dateKey) {
  if (!dateKey) return '--';
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

function NewChallengeForm({ duration, setDuration, startDate, onCancel, onStart }) {
  const endDate = startDate ? getChallengeEndDateKey(startDate, Number(duration)) : null;

  return (
    <section className="mt-4 rounded-[1.75rem] border border-emerald-300/20 bg-black/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Nuevo ciclo</p>
          <h4 className="mt-1 text-xl font-black">Configurar challenge</h4>
        </div>
        <button type="button" onClick={onCancel} className="rounded-2xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-black text-zinc-300 transition active:scale-95">
          Cerrar
        </button>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase text-zinc-500">Duración</p>
        <div className="grid grid-cols-4 gap-2">
          {CHALLENGE_DURATIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDuration(option)}
              className={`rounded-2xl border px-3 py-3 text-sm font-black transition active:scale-95 ${Number(duration) === option ? 'border-emerald-300 bg-emerald-400/15 text-emerald-200' : 'border-white/10 bg-zinc-950 text-zinc-400'}`}
            >
              {option}d
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-3">
        <p className="text-xs text-zinc-500">Inicio</p>
        <p className="text-sm font-black text-zinc-200">{formatShortDate(startDate)}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-3">
        <p className="text-xs text-zinc-500">Termina</p>
        <p className="text-sm font-black text-zinc-200">{formatShortDate(endDate)}</p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-4 w-full rounded-2xl bg-white px-4 py-4 text-sm font-black text-black transition active:scale-95"
      >
        Comenzar challenge
      </button>
    </section>
  );
}

function ChallengeHistory({ summaries, onBack, onOpenReport }) {
  return (
    <main className="space-y-4">
      <button type="button" onClick={onBack} className="rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm font-black text-zinc-200 transition active:scale-95">
        ← Dashboard
      </button>
      <section className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">History</p>
        <h1 className="mt-2 text-3xl font-black">Challenges</h1>
        <p className="mt-1 text-sm text-zinc-400">Tus ciclos completados vivirán aquí.</p>
      </section>

      {summaries.length ? (
        <div className="space-y-3">
          {summaries.map((summary) => (
            <button
              key={summary.id}
              type="button"
              onClick={() => onOpenReport(summary.id)}
              className="w-full rounded-[2rem] border border-emerald-300/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 text-left shadow-2xl shadow-black/30 transition active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Completed</p>
                  <h2 className="mt-2 text-2xl font-black">{summary.title}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{summary.challengeLength} días · {formatShortDate(summary.startDate)} - {formatShortDate(summary.endDate)}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white px-4 py-3 text-center text-black">
                  <p className="text-2xl font-black">{summary.effectiveness}%</p>
                  <p className="text-[10px] font-bold uppercase">index</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <HistoryMetric label="Wins" value={summary.wins} />
                <HistoryMetric label="Streak" value={`${summary.longestStreak}d`} />
                <HistoryMetric label="Workout" value={summary.workoutDays} />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-white/10 bg-zinc-900/60 p-6 text-center">
          <p className="text-lg font-black">Aún no hay challenges completados</p>
          <p className="mt-1 text-sm text-zinc-500">Cuando culmines uno, aparecerá aquí.</p>
        </section>
      )}
    </main>
  );
}

function HistoryMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[10px] font-bold uppercase text-zinc-500">{label}</p>
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
