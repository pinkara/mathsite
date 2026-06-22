import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityCalendarProps {
  dailyActivity: { date: string; xp: number }[];
}

const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function formatLocalDate(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, '0');
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ActivityCalendar({ dailyActivity }: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of dailyActivity) {
      map.set(a.date, (map.get(a.date) || 0) + a.xp);
    }
    return map;
  }, [dailyActivity]);

  const maxXp = useMemo(() => {
    return Math.max(1, ...Array.from(activityMap.values()));
  }, [activityMap]);

  const days = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Lundi = 0
    const totalDays = lastDayOfMonth.getDate();
    const result: { date: string; day: number; xp: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const date = formatLocalDate(year, month - 1, d);
      result.push({ date, day: d, xp: activityMap.get(date) || 0, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= totalDays; d++) {
      const date = formatLocalDate(year, month, d);
      result.push({ date, day: d, xp: activityMap.get(date) || 0, isCurrentMonth: true });
    }

    // Next month padding to fill 6 rows (42 cells)
    const remaining = 42 - result.length;
    for (let d = 1; d <= remaining; d++) {
      const date = formatLocalDate(year, month + 1, d);
      result.push({ date, day: d, xp: activityMap.get(date) || 0, isCurrentMonth: false });
    }

    return result;
  }, [year, month, activityMap]);

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-gray-900">
          {MONTH_LABELS[month]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_LABELS.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, day, xp, isCurrentMonth }) => {
          const hasActivity = activityMap.has(date);
          const intensity = hasActivity ? Math.min(1, xp / maxXp) : 0;
          const bgColor = hasActivity ? `rgba(59, 130, 246, ${0.1 + intensity * 0.9})` : undefined;
          return (
            <div
              key={date}
              className={cn(
                'aspect-square rounded-lg border flex flex-col items-center justify-center text-sm font-medium relative group',
                isCurrentMonth ? 'bg-white border-gray-200 text-gray-900' : 'bg-gray-50 border-transparent text-gray-300'
              )}
              style={bgColor ? { backgroundColor: bgColor, borderColor: `rgba(59, 130, 246, ${0.3 + intensity * 0.7})` } : undefined}
            >
              {day}
              {xp > 0 && (
                <span className="absolute bottom-1 text-[9px] font-bold text-blue-800">
                  {xp}
                </span>
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap">
                {date} : {xp} XP
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3 mt-4 text-xs text-gray-500">
        <span>Moins</span>
        <div className="flex gap-1">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
            <div
              key={opacity}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
            />
          ))}
        </div>
        <span>Plus d’XP</span>
      </div>
    </div>
  );
}
