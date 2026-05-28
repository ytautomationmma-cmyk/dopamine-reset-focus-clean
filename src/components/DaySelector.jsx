const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const parseDate = (dateKey) => new Date(`${dateKey}T00:00:00`);

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMonthRange = (days) => {
  const first = parseDate(days[0].date);
  const last = parseDate(days[days.length - 1].date);
  const firstLabel = first.toLocaleDateString('es-CO', { month: 'long' });
  const lastLabel = last.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return first.getMonth() === last.getMonth() ? lastLabel : `${firstLabel} - ${lastLabel}`;
};

const getCalendarCells = (days) => {
  const firstDay = parseDate(days[0].date);
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;
  return [...Array(mondayFirstOffset).fill(null), ...days];
};

export default function DaySelector({ days, level, selectedDayIndex, setSelectedDayIndex, scoreForDay, getScoreState }) {
  const todayKey = toDateKey(new Date());
  const cells = getCalendarCells(days);

  return (
    <section className="mb-5 rounded-3xl border border-white/10 bg-zinc-900/80 p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-300">{level}</p>
          <p className="mt-1 text-xs font-bold capitalize tracking-[0.12em] text-zinc-500">{formatMonthRange(days)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-right">
          <p className="text-xs font-bold text-zinc-500">Actual</p>
          <p className="text-sm font-black text-white">Día {days[selectedDayIndex]?.day}</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day, index) => (
          <div key={`${day}-${index}`} className="pb-1 text-center text-[10px] font-black text-zinc-600">{day}</div>
        ))}

        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="aspect-square rounded-2xl" />;

          const dayIndex = day.day - 1;
          const score = scoreForDay(day);
          const state = getScoreState(score);
          const isSelected = dayIndex === selectedDayIndex;
          const isToday = day.date === todayKey;
          const date = parseDate(day.date);
          const calendarDay = date.getDate();
          const dayTone = score > 0 ? `${state.bg} ${state.color} ring-1 ${state.ring}` : 'bg-zinc-800/80 text-zinc-500';

          return (
            <button
              key={day.day}
              type="button"
              onClick={() => setSelectedDayIndex(dayIndex)}
              className={`aspect-square rounded-2xl p-1 text-center transition active:scale-95 ${isSelected ? 'bg-white text-black shadow-lg shadow-white/10' : dayTone} ${isToday && !isSelected ? 'outline outline-1 outline-offset-2 outline-emerald-300/60' : ''}`}
              aria-label={`Seleccionar día ${day.day}`}
            >
              <span className="block text-[10px] font-black leading-none opacity-70">{calendarDay}</span>
              <span className="mt-1 block text-sm font-black leading-none">{day.day}</span>
              <span className="mt-1 block text-[8px] font-bold uppercase leading-none opacity-60">día</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
