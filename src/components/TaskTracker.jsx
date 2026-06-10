import { useState } from 'react';

const formatFullDate = (dateKey) => {
  if (!dateKey) return 'Fecha no asignada';
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
};

export default function TaskTracker({ selectedDay, addTask, toggleTask, removeTask }) {
  const [taskTitle, setTaskTitle] = useState('');
  const tasks = selectedDay.tasks || [];
  const completedTasks = tasks.filter((task) => task.done).length;
  const title = selectedDay.challengeDay ? `Día ${selectedDay.challengeDay}` : 'Registro diario';

  const submitTask = () => {
    addTask(taskTitle);
    setTaskTitle('');
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-300">Tasks</p>
          <h1 className="mt-1 text-3xl font-black">{title}</h1>
          <p className="mt-1 text-sm capitalize text-zinc-400">{formatFullDate(selectedDay.date)}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-right">
          <p className="text-2xl font-black text-emerald-300">{completedTasks}/{tasks.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">hechas</p>
        </div>
      </div>

      <div className="mb-5 rounded-3xl border border-white/10 bg-black/35 p-3">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-500" htmlFor="new-task">Nueva tarea</label>
        <div className="flex gap-2">
          <input
            id="new-task"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') submitTask(); }}
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-300/60"
            placeholder="Nueva tarea..."
          />
          <button
            type="button"
            onClick={submitTask}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-black transition active:scale-95"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/25 p-6 text-center">
            <p className="text-lg font-black text-white">Sin tareas para este día</p>
            <p className="mt-1 text-sm text-zinc-500">Agrega lo que quieres resolver hoy.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/30 p-3">
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border text-lg font-black transition active:scale-95 ${task.done ? 'border-emerald-300/60 bg-emerald-400 text-black' : 'border-white/10 bg-zinc-950 text-zinc-500'}`}
                aria-label={task.done ? 'Marcar tarea pendiente' : 'Completar tarea'}
              >
                {task.done ? '✓' : ''}
              </button>
              <p className={`min-w-0 flex-1 text-sm font-bold ${task.done ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>{task.title}</p>
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                className="rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 transition active:scale-95"
              >
                Borrar
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
