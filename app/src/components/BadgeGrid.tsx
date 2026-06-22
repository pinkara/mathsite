import { BookOpen, Compass, Crown, Flame, Gift, Puzzle, Target, LayoutGrid, Sparkles, Calculator, Microscope } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BADGES } from '@/types';
import type { BadgeDef } from '@/types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Puzzle,
  Flame,
  Target,
  Compass,
  Crown,
  Gift,
  LayoutGrid,
  Sparkles,
  Calculator,
  Microscope,
};

interface BadgeGridProps {
  unlocked: string[];
}

export function BadgeGrid({ unlocked }: BadgeGridProps) {
  const unlockedSet = new Set(unlocked);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {BADGES.map((badge: BadgeDef) => {
        const isUnlocked = unlockedSet.has(badge.id);
        const Icon = ICON_MAP[badge.icon] || Gift;

        return (
          <div
            key={badge.id}
            className={cn(
              'relative p-4 rounded-xl border text-center transition-all',
              isUnlocked
                ? 'bg-white border-gray-200 shadow-sm'
                : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2',
                isUnlocked ? 'text-white' : 'bg-gray-200 text-gray-400'
              )}
              style={isUnlocked ? { backgroundColor: badge.color } : undefined}
            >
              <Icon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">{badge.name}</h4>
            <p className="text-xs text-gray-500 mt-1 leading-snug">{badge.description}</p>
            {isUnlocked && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500" />
            )}
          </div>
        );
      })}
    </div>
  );
}
