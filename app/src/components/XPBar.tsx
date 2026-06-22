import { Progress } from '@/components/ui/progress';
import { getXpForNextLevel } from '@/types';

interface XPBarProps {
  xp: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function XPBar({ xp, showLabel = true, size = 'md' }: XPBarProps) {
  const { current, next, progress } = getXpForNextLevel(xp);
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5';

  return (
    <div className="w-full">
      <Progress value={progress} className={`${heightClass} bg-amber-100 [&>*]:bg-gradient-to-r [&>*]:from-amber-400 [&>*]:to-orange-500`} />
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{current} XP</span>
          <span>{next} XP</span>
        </div>
      )}
    </div>
  );
}
