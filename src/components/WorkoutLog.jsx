import FitnessIcon from './FitnessIcon.jsx';

export default function WorkoutLog({
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
  removeWorkoutExercise,
  updateCardioData,
  calculatePace,
  updateExerciseSet,
  removeExerciseSet,
  addSetToExercise,
}) {
  return (
    <section className="mt-5 rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
      <div className="mb-5">
        <h2 className="text-2xl font-black">🏋️ Workout Log</h2>
        <p className="text-sm text-zinc-400">
          Selecciona músculo, ejercicio y registra tu progreso del Día {selectedDay.day}
        </p>
      </div>

      <MusclePicker
        muscleGroups={muscleGroups}
        selectedMuscle={selectedMuscle}
        setSelectedMuscle={setSelectedMuscle}
        setSelectedExercise={setSelectedExercise}
        getExercisesForMuscle={getExercisesForMuscle}
      />

      <ExercisePicker
        selectedMuscle={selectedMuscle}
        selectedExercise={selectedExercise}
        setSelectedExercise={setSelectedExercise}
        selectedMuscleExercises={selectedMuscleExercises}
        addWorkoutExercise={addWorkoutExercise}
        renameExerciseName={renameExerciseName}
        setRenameExerciseName={setRenameExerciseName}
        saveExerciseRename={saveExerciseRename}
        newExerciseName={newExerciseName}
        setNewExerciseName={setNewExerciseName}
        addCustomExercise={addCustomExercise}
        lastExerciseEntry={lastExerciseEntry}
      />

      <WorkoutEntries
        selectedDay={selectedDay}
        removeWorkoutExercise={removeWorkoutExercise}
        updateCardioData={updateCardioData}
        calculatePace={calculatePace}
        updateExerciseSet={updateExerciseSet}
        removeExerciseSet={removeExerciseSet}
        addSetToExercise={addSetToExercise}
      />
    </section>
  );
}

function MusclePicker({
  muscleGroups,
  selectedMuscle,
  setSelectedMuscle,
  setSelectedExercise,
  getExercisesForMuscle,
}) {
  return (
    <div className="mb-5 rounded-3xl border border-white/10 bg-black/30 p-4">
      <p className="mb-3 text-sm font-bold text-zinc-300">1. Selecciona músculo</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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
              className={`rounded-3xl border p-3 text-left transition active:scale-[0.98] ${
                active
                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                  : 'border-white/10 bg-zinc-950 text-zinc-300'
              }`}
            >
              <div className="flex flex-col items-start gap-3">
                <FitnessIcon type={group.iconType} active={active} />

                <div className="text-base font-black leading-tight">
                  {group.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExercisePicker({
  selectedMuscle,
  selectedExercise,
  setSelectedExercise,
  selectedMuscleExercises,
  addWorkoutExercise,
  renameExerciseName,
  setRenameExerciseName,
  saveExerciseRename,
  newExerciseName,
  setNewExerciseName,
  addCustomExercise,
  lastExerciseEntry,
}) {
  return (
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
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
          Modificar nombre seleccionado
        </p>
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
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
          Agregar ejercicio nuevo
        </p>
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
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
          Historial rápido
        </p>
        {lastExerciseEntry ? (
          <p className="mt-1 text-sm text-zinc-300">
            Última vez: Día {lastExerciseEntry.day}
          </p>
        ) : (
          <p className="mt-1 text-sm text-zinc-500">
            Todavía no hay historial para {selectedExercise}.
          </p>
        )}
      </div>
    </div>
  );
}

function WorkoutEntries({
  selectedDay,
  removeWorkoutExercise,
  updateCardioData,
  calculatePace,
  updateExerciseSet,
  removeExerciseSet,
  addSetToExercise,
}) {
  if ((selectedDay.workout || []).length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-5 text-center">
        <p className="text-3xl">💪</p>
        <p className="mt-2 font-bold">Todavía no registraste ejercicios</p>
        <p className="mt-1 text-sm text-zinc-400">
          Añade tu primer ejercicio para medir progreso real en el gimnasio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(selectedDay.workout || []).map((item) => (
        <div key={item.id} className="rounded-3xl border border-white/10 bg-black/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-emerald-300">
                {item.muscle || 'Músculo'}
              </p>
              <p className="text-lg font-black">{item.exercise || 'Ejercicio'}</p>
            </div>
            <button
              onClick={() => removeWorkoutExercise(item.id)}
              className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm font-bold text-red-300"
            >
              ✕
            </button>
          </div>

          {item.type === 'cardio' ? (
            <CardioEntry
              item={item}
              updateCardioData={updateCardioData}
              calculatePace={calculatePace}
            />
          ) : (
            <StrengthEntry
              item={item}
              updateExerciseSet={updateExerciseSet}
              removeExerciseSet={removeExerciseSet}
              addSetToExercise={addSetToExercise}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function CardioEntry({ item, updateCardioData, calculatePace }) {
  const pace = calculatePace(item.cardioData?.time, item.cardioData?.distance);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">
            Tiempo
          </label>
          <input
            value={item.cardioData?.time || ''}
            onChange={(e) => updateCardioData(item.id, 'time', e.target.value)}
            inputMode="text"
            placeholder="18:33"
            className="w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-sm outline-none focus:border-emerald-400/60"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">
            Distancia
          </label>
          <div className="flex gap-2">
            <input
              value={item.cardioData?.distance || ''}
              onChange={(e) => updateCardioData(item.id, 'distance', e.target.value)}
              inputMode="decimal"
              placeholder="5"
              className="w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-sm outline-none focus:border-emerald-400/60"
            />
            <select
              value={item.cardioData?.distanceUnit || 'km'}
              onChange={(e) => updateCardioData(item.id, 'distanceUnit', e.target.value)}
              className="rounded-2xl border border-white/10 bg-black px-3 py-3 text-sm outline-none focus:border-emerald-400/60"
            >
              <option value="km">KM</option>
              <option value="mi">MI</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">
          Pace automático
        </p>
        <p className="mt-1 text-lg font-black text-white">
          {pace ? `${pace} min/${item.cardioData?.distanceUnit || 'km'}` : '--'}
        </p>
      </div>
    </div>
  );
}

function StrengthEntry({
  item,
  updateExerciseSet,
  removeExerciseSet,
  addSetToExercise,
}) {
  const sets = item.setsData?.length
    ? item.setsData
    : [{ id: `${item.id}-legacy`, reps: item.reps || '', weight: item.weight || '', unit: 'lbs' }];

  return (
    <div className="space-y-2">
      {sets.map((set, setIndex) => (
        <div
          key={`${item.id}-${set.id || setIndex}`}
          className="rounded-2xl border border-white/10 bg-zinc-950 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
              Set {setIndex + 1}
            </p>
            {sets.length > 1 && (
              <button
                onClick={() => removeExerciseSet(item.id, setIndex)}
                className="text-xs font-bold text-red-300"
              >
                Borrar set
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">
                Reps
              </label>
              <input
                value={set.reps}
                onChange={(e) =>
                  updateExerciseSet(item.id, setIndex, 'reps', e.target.value)
                }
                inputMode="numeric"
                placeholder="10"
                className="w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-sm outline-none focus:border-emerald-400/60"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">
                Peso
              </label>
              <input
                value={set.weight}
                onChange={(e) =>
                  updateExerciseSet(item.id, setIndex, 'weight', e.target.value)
                }
                inputMode="decimal"
                placeholder="135"
                className="w-full rounded-2xl border border-white/10 bg-black px-3 py-3 text-sm outline-none focus:border-emerald-400/60"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-500">
                Unidad
              </label>
              <select
                value={set.unit || 'lbs'}
                onChange={(e) =>
                  updateExerciseSet(item.id, setIndex, 'unit', e.target.value)
                }
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
  );
}
