import { getLevelConfig, type Level } from '@/types';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: Level;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelBadge({ 
  level, 
  showLabel = true, 
  size = 'md',
  className 
}: LevelBadgeProps) {
  const config = getLevelConfig(level);
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-all',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
      title={config.label}
    >
      {showLabel ? config.label : level}
    </span>
  );
}

// === BADGE DE DIFFICULTÉ ===
interface DifficultyBadgeProps {
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DifficultyBadge({ 
  difficulty, 
  size = 'md',
  className 
}: DifficultyBadgeProps) {
  const config = {
    Facile: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    Moyen: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    Difficile: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const { bg, text, border } = config[difficulty];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        bg,
        text,
        border,
        sizeClasses[size],
        className
      )}
    >
      {difficulty}
    </span>
  );
}
