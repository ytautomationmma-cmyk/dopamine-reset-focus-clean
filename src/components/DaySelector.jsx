const formatDayDate = (dateKey) => {
  if (!dateKey) return '';
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
};

export default function DaySelector({ days, level, selectedDayIndex, setSelectedDayIndex, scoreForDay, getScoreState }) {
  return (
    <section className="mb-5 rounded-3xl border border-white/10 bg-zinc-900/80 p-4">
      <p className="mb-3 text-sm font-semibold text-zinc-300">{level}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day, index) => {
          const score = scoreForDay(day); const state = getScoreState(score); const isSelected = index === selectedDayIndex;
          return (
            <button key={day.day} onClick={() => setSelectedDayIndex(index)} className={`min-w-16 rounded-2xl px-3 py-3 text-center transition ${isSelected ? 'bg-white text-black' : score > 0 ? `${state.bg} ${state.color} ring-1 ${state.ring}` : 'bg-zinc-800 text-zinc-500'}`}>
              <div className="text-xs font-bold">Día</div>
              <div className="text-lg font-black">{day.day}</div>
              <div className="mt-1 text-[10px] font-bold capitalize opacity-70">{formatDayDate(day.date)}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
