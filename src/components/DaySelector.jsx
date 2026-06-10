import { useEffect, useMemo, useState } from 'react';

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const parseDate = (dateKey) => new Date(`${dateKey}T00:00:00`);

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

const formatMonth = (date) => date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
const formatSelectedLabel = (day) => {
  if (day?.challengeDay) return `Día ${day.challengeDay}`;
  if (!day?.date) return '--';
  return parseDate(day.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const buildMonthCells = (visibleMonth) => {
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1);
    return { calendarDay: index + 1, dateKey: toDateKey(date) };
  });

  return [...Array(mondayFirstOffset).fill(null), ...calendarDays];
};

export default function DaySelector({ days, level, selectedDayIndex, setSelectedDayIndex, selectCalendarDate, scoreForDay, getScoreState }) {
  const selectedDay = days[selectedDayIndex];
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const selectedDate = parseDate(selectedDay.date);
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  });
  const todayKey = toDateKey(new Date());
  const monthCells = buildMonthCells(visibleMonth);
  const dayByDate = useMemo(() => new Map(days.map((day, index) => [day.date, { day, index }])), [days]);
  const firstDate = parseDate(days[0].date);

  useEffect(() => {
    const selectedDate = parseDate(selectedDay.date);
    setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDay.date]);

  return (
    <section className="mb-5 rounded-3xl border border-white/10 bg-zinc-900/80 p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-300">{level}</p>
          <p className="mt-1 text-xs font-bold capitalize tracking-[0.12em] text-zinc-500">{formatMonth(visibleMonth)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-right">
          <p className="text-xs font-bold text-zinc-500">Actual</p>
          <p className="text-sm font-black capitalize text-white">{formatSelectedLabel(selectedDay)}</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2">
        <button
          type="button"
          onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
          className="h-11 rounded-2xl border border-white/10 bg-black/30 text-lg font-black text-zinc-300 transition active:scale-95"
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <p className="text-center text-sm font-black capitalize text-white">{formatMonth(visibleMonth)}</p>
        <button
          type="button"
          onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
          className="h-11 rounded-2xl border border-white/10 bg-black/30 text-lg font-black text-zinc-300 transition active:scale-95"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day, index) => (
          <div key={`${day}-${index}`} className="pb-1 text-center text-[10px] font-black text-zinc-600">{day}</div>
        ))}

        {monthCells.map((cell, index) => {
          if (!cell) return <div key={`empty-${index}`} className="aspect-square rounded-2xl" />;

          const planDay = dayByDate.get(cell.dateKey);
          const isToday = cell.dateKey === todayKey;
          const isBeforeTracking = parseDate(cell.dateKey) < firstDate;

          if (!planDay) {
            const className = `aspect-square rounded-2xl border border-white/[0.04] bg-black/20 p-1 text-center ${isBeforeTracking ? 'text-zinc-800' : 'text-zinc-600 transition active:scale-95 hover:bg-white/5'} ${isToday ? 'outline outline-1 outline-offset-2 outline-emerald-300/50' : ''}`;
            return isBeforeTracking ? (
              <div key={cell.dateKey} className={className}>
                <span className="block text-xs font-black leading-none">{cell.calendarDay}</span>
              </div>
            ) : (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => selectCalendarDate(cell.dateKey)}
                className={className}
                aria-label={`Seleccionar ${cell.calendarDay}`}
              >
                <span className="block text-xs font-black leading-none">{cell.calendarDay}</span>
              </button>
            );
          }

          const score = scoreForDay(planDay.day);
          const state = getScoreState(score);
          const isSelected = planDay.index === selectedDayIndex;
          const isChallengeDay = Boolean(planDay.day.challengeDay);

          if (!isChallengeDay) {
            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => setSelectedDayIndex(planDay.index)}
                className={`aspect-square rounded-2xl border p-1 text-center transition active:scale-95 ${isSelected ? 'border-white bg-white text-black shadow-lg shadow-white/10' : score > 0 ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200' : 'border-white/[0.04] bg-black/20 text-zinc-600 hover:bg-white/5'} ${isToday && !isSelected ? 'outline outline-1 outline-offset-2 outline-emerald-300/50' : ''}`}
                aria-label={`Seleccionar ${cell.calendarDay}`}
              >
                <span className="block text-xs font-black leading-none">{cell.calendarDay}</span>
              </button>
            );
          }

          const dayTone = score > 0 ? `${state.bg} ${state.color} ring-1 ${state.ring}` : 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/25';

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => setSelectedDayIndex(planDay.index)}
              className={`aspect-square rounded-2xl p-1 text-center transition active:scale-95 ${isSelected ? 'bg-white text-black shadow-lg shadow-white/10' : dayTone} ${isToday && !isSelected ? 'outline outline-1 outline-offset-2 outline-emerald-300/60' : ''}`}
              aria-label={`Seleccionar día ${planDay.day.challengeDay}`}
            >
              <span className="block text-[10px] font-black leading-none opacity-70">{cell.calendarDay}</span>
              <span className="mt-1 block text-sm font-black leading-none">{planDay.day.challengeDay}</span>
              <span className="mt-1 block text-[8px] font-bold uppercase leading-none opacity-60">día</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
