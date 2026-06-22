import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  if (streak <= 0) return null;

  const isHot = streak >= 7;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold',
        isHot
          ? 'bg-orange-100 text-orange-700 border border-orange-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200',
        className
      )}
    >
      <Flame className={cn('w-4 h-4', isHot && 'animate-pulse')} />
      <span>{streak} jours</span>
    </div>
  );
}
