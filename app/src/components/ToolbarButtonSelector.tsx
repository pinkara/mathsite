import { TOOLBAR_GROUPS } from '@/lib/toolbarConfig';
import { cn } from '@/lib/utils';

interface ToolbarButtonSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function ToolbarButtonSelector({ selected, onChange, className }: ToolbarButtonSelectorProps) {
  const toggleButton = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const toggleGroup = (_groupId: string, buttonIds: string[]) => {
    const allSelected = buttonIds.every((id) => selected.includes(id));
    if (allSelected) {
      onChange(selected.filter((id) => !buttonIds.includes(id)));
    } else {
      const merged = new Set([...selected, ...buttonIds]);
      onChange(Array.from(merged));
    }
  };

  const isGroupPartial = (buttonIds: string[]) => {
    const count = buttonIds.filter((id) => selected.includes(id)).length;
    return count > 0 && count < buttonIds.length;
  };

  const isGroupFull = (buttonIds: string[]) => buttonIds.every((id) => selected.includes(id));

  return (
    <div className={cn('space-y-4', className)}>
      {TOOLBAR_GROUPS.map((group) => {
        const buttonIds = group.buttons.map((b) => b.id);
        const full = isGroupFull(buttonIds);
        const partial = isGroupPartial(buttonIds);

        return (
          <div key={group.id} className="border border-gray-200 rounded-lg p-3 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id={`group-${group.id}`}
                checked={full}
                ref={(el) => {
                  if (el) el.indeterminate = partial;
                }}
                onChange={() => toggleGroup(group.id, buttonIds)}
                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
              />
              <label htmlFor={`group-${group.id}`} className="text-sm font-semibold text-gray-800 cursor-pointer">
                {group.name}
              </label>
              {partial && <span className="text-xs text-orange-600">(partiel)</span>}
            </div>
            <div className="flex flex-wrap gap-1.5 pl-6">
              {group.buttons.map((btn) => (
                <label
                  key={btn.id}
                  title={btn.title || btn.label}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded cursor-pointer transition-colors select-none',
                    selected.includes(btn.id)
                      ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected.includes(btn.id)}
                    onChange={() => toggleButton(btn.id)}
                  />
                  {btn.label}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
