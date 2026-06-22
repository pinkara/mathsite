import { cn } from '@/lib/utils';
import { TOOLBAR_GROUPS } from '@/lib/toolbarConfig';

interface MathToolbarProps {
  onInsert: (latex: string) => void;
  allowedButtons?: string[];
  className?: string;
}

export function MathToolbar({ onInsert, allowedButtons, className }: MathToolbarProps) {
  const hasFilter = allowedButtons && allowedButtons.length > 0;

  const groups = TOOLBAR_GROUPS.map((group) => {
    const buttons = hasFilter
      ? group.buttons.filter((b) => allowedButtons!.includes(b.id))
      : group.buttons;
    return { ...group, buttons };
  }).filter((group) => group.buttons.length > 0);

  if (groups.length === 0) {
    return (
      <div className={cn('text-sm text-gray-500 italic', className)}>
        Aucun bouton autorisé pour ce problème.
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {groups.map((group) => (
        <div key={group.id}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{group.name}</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {group.buttons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => onInsert(btn.latex)}
                title={btn.title || btn.label}
                className="px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
