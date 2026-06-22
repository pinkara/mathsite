import { SUBJECT_TYPE_LABELS, SUBJECT_TYPE_COLORS, type SubjectType } from '@/types';

interface SubjectTypeBadgeProps {
  type?: SubjectType;
  size?: 'sm' | 'md';
}

export function SubjectTypeBadge({ type = 'academic', size = 'sm' }: SubjectTypeBadgeProps) {
  const colors = SUBJECT_TYPE_COLORS[type] || SUBJECT_TYPE_COLORS.academic;
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium whitespace-nowrap ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
      style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
    >
      {SUBJECT_TYPE_LABELS[type] || SUBJECT_TYPE_LABELS.academic}
    </span>
  );
}
