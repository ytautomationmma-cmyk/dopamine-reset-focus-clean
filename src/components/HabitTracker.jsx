export default function HabitTracker({ selectedDay, habits, completedHabits, toggleCheck, updateFeeling }) {
  return (
    <main className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/30">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div><h2 className="text-2xl font-black">Día {selectedDay.day}</h2><p className="text-sm text-zinc-400">{completedHabits}/{habits.length} hábitos completados</p></div>
        <select value={selectedDay.feeling} onChange={(e) => updateFeeling(e.target.value)} className="rounded-2xl border border-white/10 bg-black px-3 py-3 text-sm outline-none"><option>🔥 Imparable</option><option>💪 Enfocado</option><option>🙂 Bien</option><option>🧭 Recalibrando</option><option>😵 Distraído</option></select>
      </div>
      <div className="space-y-3">
        {habits.map((habit, index) => { const checked = selectedDay.checks[index]; return (
          <button key={habit.name} onClick={() => toggleCheck(index)} className={`flex w-full items-center justify-between rounded-3xl border p-4 text-left transition active:scale-[0.99] ${checked ? 'border-emerald-400/40 bg-emerald-500/15' : 'border-white/10 bg-black/40 hover:bg-zinc-800/70'}`}>
            <div className="flex items-center gap-4"><div className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${checked ? 'bg-emerald-400 text-black' : 'bg-zinc-800'}`}>{habit.icon}</div><div><p className="font-bold">{habit.name}</p><p className="text-sm text-zinc-400">+{habit.points} puntos</p></div></div>
            <div className={`grid h-8 w-8 place-items-center rounded-full border ${checked ? 'border-emerald-300 bg-emerald-400 text-black' : 'border-zinc-600 text-transparent'}`}>✓</div>
          </button>
        );})}
      </div>
    </main>
  );
}
