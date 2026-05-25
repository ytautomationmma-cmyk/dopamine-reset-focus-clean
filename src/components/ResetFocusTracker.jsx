import { useEffect, useState } from 'react';
import { habits, muscleGroups } from '../data.js';
import Header from './Header.jsx';
import Stats from './Stats.jsx';
import DaySelector from './DaySelector.jsx';
import HabitTracker from './HabitTracker.jsx';
import WorkoutLog from './WorkoutLog.jsx';
import FooterCards from './FooterCards.jsx';

const STORAGE_KEY = 'dopamine-reset-data-v2';
const SELECTED_DAY_KEY = 'dopamine-reset-selected-day';
const CUSTOM_EXERCISES_KEY = 'dopamine-reset-custom-exercises';
const EXERCISE_RENAMES_KEY = 'dopamine-reset-exercise-renames';
const parseDecimalInput = (value) => parseFloat(String(value).trim().replace(',', '.'));

const createInitialDays = () =>
  Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    checks: Array(habits.length).fill(false),
    feeling: '🙂 Bien',
    workout: [],
  }));

function getScoreState(score) {
  if (score >= 13) {
    return {
      emoji: '🔥',
      label: 'Día élite',
      color: 'text-emerald-300',
      ring: 'ring-emerald-400/40',
      bg: 'bg-emerald-500/10',
    };
  }

  if (score >= 8) {
    return {
      emoji: '💪',
      label: 'Buen progreso',
      color: 'text-orange-300',
      ring: 'ring-orange-400/40',
      bg: 'bg-orange-500/10',
    };
  }

  return {
    emoji: '🧭',
    label: 'Recalibrar enfoque',
    color: 'text-sky-300',
    ring: 'ring-sky-400/40',
    bg: 'bg-sky-500/10',
  };
}

function safeLoad(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function safeSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable
  }
}

export default function ResetFocusTracker() {
  const [days, setDays] = useState(() => safeLoad(STORAGE_KEY, createInitialDays()));

  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    try {
      const savedDay = localStorage.getItem(SELECTED_DAY_KEY);
      return savedDay !== null ? Number(savedDay) : 0;
    } catch {
      return 0;
    }
  });

  const [customExercises, setCustomExercises] = useState(() =>
    safeLoad(CUSTOM_EXERCISES_KEY, {})
  );
  const [exerciseRenames, setExerciseRenames] = useState(() =>
    safeLoad(EXERCISE_RENAMES_KEY, {})
  );

  const [selectedMuscle, setSelectedMuscle] = useState('Pecho');
  const [selectedExercise, setSelectedExercise] = useState('Bench Press');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [renameExerciseName, setRenameExerciseName] = useState('');

  useEffect(() => safeSave(STORAGE_KEY, days), [days]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_DAY_KEY, String(selectedDayIndex));
    } catch {
      // Storage unavailable
    }
  }, [selectedDayIndex]);

  useEffect(() => safeSave(CUSTOM_EXERCISES_KEY, customExercises), [customExercises]);
  useEffect(() => safeSave(EXERCISE_RENAMES_KEY, exerciseRenames), [exerciseRenames]);

  const selectedDay = days[selectedDayIndex] || createInitialDays()[0];

  const setDaysAndSave = (updater) => {
    setDays((currentDays) => {
      const updatedDays = typeof updater === 'function' ? updater(currentDays) : updater;
      safeSave(STORAGE_KEY, updatedDays);
      return updatedDays;
    });
  };

  const resetTracker = () => {
    const confirmed = window.confirm('¿Seguro que quieres reiniciar todo el progreso?');
    if (!confirmed) return;

    const fresh = createInitialDays();
    setDays(fresh);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SELECTED_DAY_KEY);
    setSelectedDayIndex(0);
  };

  const scoreForDay = (day) =>
    day.checks.reduce((total, checked, i) => (checked ? total + habits[i].points : total), 0);

  const scores = days.map(scoreForDay);
  const selectedScore = scoreForDay(selectedDay);
  const completedHabits = selectedDay.checks.filter(Boolean).length;
  const totalPossible = habits.reduce((sum, habit) => sum + habit.points, 0);
  const progressPercent = Math.round((selectedScore / totalPossible) * 100);

  const scoresUntilSelectedDay = scores.slice(0, selectedDayIndex + 1);
  const progressCount = scoresUntilSelectedDay.filter((score) => score >= 8 && score <= 12).length;
  const eliteCount = scoresUntilSelectedDay.filter((score) => score >= 13).length;
  const winCount = progressCount + eliteCount;

  let level = '💪 Nivel 1 — Recuperando Control';
  if (winCount >= 30) level = '👑 Nivel 4 — Nueva Identidad';
  else if (winCount >= 15) level = '⚡ Nivel 3 — Disciplina';
  else if (winCount >= 5) level = '🔥 Nivel 2 — Momentum';

  const scoreState = getScoreState(selectedScore);

  const toggleCheck = (habitIndex) => {
    setDaysAndSave((currentDays) =>
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
    setDaysAndSave((currentDays) =>
      currentDays.map((day, index) =>
        index === selectedDayIndex ? { ...day, feeling: value } : day
      )
    );
  };

  const getExercisesForMuscle = (muscleName) => {
    const baseMuscle = muscleGroups.find((group) => group.name === muscleName) || muscleGroups[0];
    const customList = customExercises[muscleName] || [];
    const renameMap = exerciseRenames[muscleName] || {};
    const renamedBaseExercises = baseMuscle.exercises.map((exercise) => renameMap[exercise] || exercise);
    return [...new Set([...renamedBaseExercises, ...customList])];
  };

  const selectedMuscleExercises = getExercisesForMuscle(selectedMuscle);

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

    setDaysAndSave((currentDays) =>
      currentDays.map((day) => ({
        ...day,
        workout: (day.workout || []).map((item) =>
          item.muscle === selectedMuscle && item.exercise === selectedExercise
            ? { ...item, exercise: cleanName }
            : item
        ),
      }))
    );

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
      setSelectedExercise(
        currentExercises.find((exercise) => exercise.toLowerCase() === cleanName.toLowerCase()) ||
          cleanName
      );
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
    const isCardio = muscle.name === 'Cardio';

    setDaysAndSave((currentDays) =>
      currentDays.map((day, index) =>
        index === selectedDayIndex
          ? {
              ...day,
              workout: [
                ...(day.workout || []),
                {
                  id: Date.now() + Math.random(),
                  muscle: muscle.name,
                  exercise: exerciseName,
                  type: isCardio ? 'cardio' : 'strength',
                  setsData: isCardio
                    ? []
                    : [{ id: Date.now() + Math.random(), reps: '', weight: '', unit: 'lbs' }],
                  cardioData: { time: '', distance: '', distanceUnit: 'km' },
                },
              ],
            }
          : day
      )
    );
  };

  const getExerciseHistory = (exerciseName) => {
    const history = [];
    days.forEach((day) => {
      (day.workout || []).forEach((item) => {
        const hasStrengthData = (item.setsData || []).some((set) => set.reps || set.weight);
        const hasCardioData = item.cardioData?.time || item.cardioData?.distance;
        if (item.exercise === exerciseName && (hasStrengthData || hasCardioData)) {
          history.push({ day: day.day, ...item });
        }
      });
    });
    return history;
  };

  const selectedExerciseHistory = getExerciseHistory(selectedExercise);
  const lastExerciseEntry = selectedExerciseHistory[selectedExerciseHistory.length - 1];

  const addSetToExercise = (exerciseId) => {
    setDaysAndSave((currentDays) =>
      currentDays.map((day, index) =>
        index === selectedDayIndex
          ? {
              ...day,
              workout: (day.workout || []).map((item) => {
                if (item.id !== exerciseId) return item;
                const currentSets = item.setsData?.length
                  ? item.setsData
                  : [{ id: Date.now() + Math.random(), reps: '', weight: '', unit: 'lbs' }];

                return {
                  ...item,
                  setsData: [
                    ...currentSets,
                    {
                      id: Date.now() + Math.random(),
                      reps: '',
                      weight: '',
                      unit: currentSets[currentSets.length - 1]?.unit || 'lbs',
                    },
                  ],
                };
              }),
            }
          : day
      )
    );
  };

  const updateExerciseSet = (exerciseId, setIndex, field, value) => {
    setDaysAndSave((currentDays) =>
      currentDays.map((day, dayIndex) =>
        dayIndex === selectedDayIndex
          ? {
              ...day,
              workout: (day.workout || []).map((item) =>
                item.id === exerciseId
                  ? {
                      ...item,
                      setsData: (item.setsData || []).map((set, index) =>
                        index === setIndex ? { ...set, [field]: value } : set
                      ),
                    }
                  : item
              ),
            }
          : day
      )
    );
  };

  const removeExerciseSet = (exerciseId, setIndex) => {
    setDaysAndSave((currentDays) =>
      currentDays.map((day, dayIndex) =>
        dayIndex === selectedDayIndex
          ? {
              ...day,
              workout: (day.workout || []).map((item) => {
                if (item.id !== exerciseId) return item;
                const currentSets = item.setsData || [];
                if (currentSets.length <= 1) return item;
                return { ...item, setsData: currentSets.filter((_, index) => index !== setIndex) };
              }),
            }
          : day
      )
    );
  };

  const updateCardioData = (exerciseId, field, value) => {
    setDaysAndSave((currentDays) =>
      currentDays.map((day, dayIndex) =>
        dayIndex === selectedDayIndex
          ? {
              ...day,
              workout: (day.workout || []).map((item) =>
                item.id === exerciseId
                  ? { ...item, cardioData: { ...(item.cardioData || {}), [field]: value } }
                  : item
              ),
            }
          : day
      )
    );
  };

  const removeWorkoutExercise = (exerciseId) => {
    setDaysAndSave((currentDays) =>
      currentDays.map((day, index) =>
        index === selectedDayIndex
          ? { ...day, workout: (day.workout || []).filter((item) => item.id !== exerciseId) }
          : day
      )
    );
  };

  const calculatePace = (time, distance) => {
    if (!time || !distance) return null;

    const timeParts = String(time).split(':');
    let totalMinutes = 0;

    if (timeParts.length === 2) {
      const minutes = parseInt(timeParts[0], 10) || 0;
      const seconds = parseInt(timeParts[1], 10) || 0;
      totalMinutes = minutes + seconds / 60;
    } else {
      totalMinutes = parseDecimalInput(time);
    }

    const numericDistance = parseDecimalInput(distance);
    if (!totalMinutes || !numericDistance) return null;

    const pace = totalMinutes / numericDistance;
    const roundedSeconds = Math.round((pace - Math.floor(pace)) * 60);
    const paceMinutes = Math.floor(pace) + (roundedSeconds === 60 ? 1 : 0);
    const paceSeconds = roundedSeconds === 60 ? 0 : roundedSeconds;

    return `${paceMinutes}:${String(paceSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto max-w-md px-4 py-6 md:max-w-5xl md:px-8">
        <Header scoreState={scoreState} selectedScore={selectedScore} progressPercent={progressPercent} />

        <Stats winCount={winCount} eliteCount={eliteCount} progressCount={progressCount} />

        <DaySelector
          days={days}
          level={level}
          selectedDayIndex={selectedDayIndex}
          setSelectedDayIndex={setSelectedDayIndex}
          scoreForDay={scoreForDay}
          getScoreState={getScoreState}
        />

        <HabitTracker
          selectedDay={selectedDay}
          habits={habits}
          completedHabits={completedHabits}
          toggleCheck={toggleCheck}
          updateFeeling={updateFeeling}
        />

        <WorkoutLog
          selectedDay={selectedDay}
          selectedMuscle={selectedMuscle}
          setSelectedMuscle={setSelectedMuscle}
          selectedExercise={selectedExercise}
          setSelectedExercise={setSelectedExercise}
          selectedMuscleExercises={selectedMuscleExercises}
          muscleGroups={muscleGroups}
          getExercisesForMuscle={getExercisesForMuscle}
          addWorkoutExercise={addWorkoutExercise}
          renameExerciseName={renameExerciseName}
          setRenameExerciseName={setRenameExerciseName}
          saveExerciseRename={saveExerciseRename}
          newExerciseName={newExerciseName}
          setNewExerciseName={setNewExerciseName}
          addCustomExercise={addCustomExercise}
          lastExerciseEntry={lastExerciseEntry}
          removeWorkoutExercise={removeWorkoutExercise}
          updateCardioData={updateCardioData}
          calculatePace={calculatePace}
          updateExerciseSet={updateExerciseSet}
          removeExerciseSet={removeExerciseSet}
          addSetToExercise={addSetToExercise}
        />

        <FooterCards resetTracker={resetTracker} />
      </div>
    </div>
  );
}
