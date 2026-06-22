import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { MENU_ACTIONS } from '@/lib/toolbarConfig';

interface MathInputMenuProps {
  onInsert: (latex: string) => void;
  allowedButtons?: string[];
}

export function MathInputMenu({ onInsert, allowedButtons }: MathInputMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasFilter = allowedButtons && allowedButtons.length > 0;
  const actions = hasFilter
    ? MENU_ACTIONS.filter(
        (a) =>
          allowedButtons!.includes(a.id) ||
          a.allowedButtonIds?.some((id) => allowedButtons!.includes(id))
      )
    : MENU_ACTIONS;

  if (actions.length === 0) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
        title="Insertions rapides"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-72 overflow-auto py-1">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                onInsert(action.latex);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
