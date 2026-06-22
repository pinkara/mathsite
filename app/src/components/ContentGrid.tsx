import { BookOpen, CheckCircle, Calculator, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MathPreview } from './MathPreview';

interface ContentItem {
  id: string;
  title?: string;
  name?: string;
  subjectType?: string;
  isBonus?: boolean;
}

interface ContentGridProps<T extends ContentItem> {
  items: T[];
  empty: string;
  onClick: (item: T) => void;
  color: string;
  icon?: 'course' | 'formula';
  completedIds?: string[];
  renderPreview?: (item: T) => string | null | undefined;
}

export function ContentGrid<T extends ContentItem>({
  items,
  empty,
  onClick,
  color,
  icon = 'course',
  completedIds = [],
  renderPreview,
}: ContentGridProps<T>) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
        <p className="text-gray-500 font-medium">{empty}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => {
        const completed = completedIds.includes(item.id);
        const Icon = icon === 'formula' ? Calculator : BookOpen;
        const title = (item as any).title || (item as any).name || 'Sans titre';
        const preview = renderPreview?.(item);

        return (
          <button
            key={item.id}
            onClick={() => onClick(item)}
            className={cn(
              'group relative w-full text-left rounded-2xl border-2 bg-white p-4',
              'transition-all duration-200 ease-out',
              'hover:-translate-y-1 hover:shadow-lg',
              completed
                ? 'border-emerald-300 bg-emerald-50/60 hover:border-emerald-400'
                : item.isBonus
                ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 hover:border-amber-400'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm',
                  completed ? 'bg-emerald-500' : 'bg-gradient-to-br'
                )}
                style={
                  completed
                    ? undefined
                    : {
                        backgroundImage: `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})`,
                      }
                }
              >
                {completed ? (
                  <CheckCircle className="w-6 h-6" />
                ) : item.isBonus ? (
                  <Sparkles className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    'font-bold text-gray-900 text-sm leading-snug line-clamp-2',
                    completed && 'text-emerald-900'
                  )}
                >
                  {title}
                </h3>
                {item.subjectType && (
                  <p className="text-[10px] text-gray-400 mt-1 font-medium uppercase tracking-wide">
                    {item.subjectType}
                  </p>
                )}

                {preview && (
                  <MathPreview
                    content={preview}
                    className="text-gray-500"
                    maxLength={100}
                    mode={icon === 'formula' ? 'formula' : 'mixed'}
                  />
                )}

                <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: completed ? '100%' : '35%',
                      backgroundColor: completed ? '#10b981' : color,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Hover accent line */}
            <div
              className={cn(
                'absolute bottom-0 left-4 right-4 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity',
                completed ? 'bg-emerald-400' : item.isBonus ? 'bg-amber-400' : 'bg-gray-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// Simple helper to darken/lighten a hex color
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
