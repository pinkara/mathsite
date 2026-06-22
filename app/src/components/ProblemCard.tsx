import { CheckCircle, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Problem } from '@/types';
import { TitleWithFormula } from './InlineFormula';
import { MathPreview } from './MathPreview';

interface ProblemCardProps {
  problem: Problem;
  index: number;
  completed?: boolean;
  onClick: () => void;
  isOlympiad?: boolean;
  isBonus?: boolean;
  disabled?: boolean;
}

const difficultyConfig = {
  Facile: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: 'bg-emerald-500',
  },
  Moyen: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'bg-amber-500',
  },
  Difficile: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: 'bg-rose-500',
  },
};

export function ProblemCard({
  problem,
  index,
  completed,
  onClick,
  isOlympiad,
  isBonus,
  disabled,
}: ProblemCardProps) {
  const diff = difficultyConfig[problem.difficulty];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative w-full text-left rounded-2xl border-2 bg-white p-4',
        'transition-all duration-200 ease-out',
        disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:-translate-y-1 hover:shadow-lg',
        completed
          ? 'border-emerald-300 bg-emerald-50/60 hover:border-emerald-400'
          : isOlympiad
          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 hover:border-amber-400'
          : 'border-gray-200 hover:border-gray-300'
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {!isOlympiad && !isBonus ? (
              <span
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black',
                  'text-white shadow-sm',
                  diff.icon
                )}
              >
                {index}
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black bg-amber-200 text-amber-800">
                <Trophy className="w-3 h-3" />
                Olympiade
              </span>
            )}
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide',
                diff.bg,
                diff.text
              )}
            >
              {problem.difficulty}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">{problem.category}</span>
          </div>

          <TitleWithFormula
            text={problem.title}
            className={cn(
              'block font-black text-gray-900 text-sm leading-snug line-clamp-2',
              completed && 'text-emerald-900'
            )}
          />

          <MathPreview content={problem.content} className="text-gray-500" mode="mixed" />
        </div>

        {completed && (
          <div className="shrink-0 rounded-full bg-emerald-100 p-1">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
        )}
        {isOlympiad && !completed && (
          <Star className="w-5 h-5 text-amber-400 shrink-0" fill="currentColor" />
        )}
        {isBonus && !isOlympiad && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
            Hors programme
          </span>
        )}
      </div>

      {/* Hover accent line */}
      <div
        className={cn(
          'absolute bottom-0 left-4 right-4 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity',
          completed ? 'bg-emerald-400' : isOlympiad ? 'bg-amber-400' : 'bg-gray-300'
        )}
      />
    </button>
  );
}
