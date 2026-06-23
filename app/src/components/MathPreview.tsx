import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MathPreviewProps {
  content: string;
  className?: string;
  maxLength?: number;
  mode?: 'mixed' | 'formula';
}

function extractPreview(content: string, maxLength: number, mode: 'mixed' | 'formula'): string {
  if (!content) return '';

  if (mode === 'formula') {
    const trimmed = content.trim();
    if (!trimmed) return '';

    if (trimmed.startsWith('$$')) {
      const preview = trimmed.slice(0, maxLength);
      return preview.endsWith('$$') ? preview : `${preview}$$`;
    }

    if (trimmed.startsWith('$')) {
      const preview = trimmed.slice(0, maxLength);
      return preview.endsWith('$') ? preview : `${preview}$`;
    }

    const formula = trimmed.slice(0, Math.max(maxLength - 2, 0));
    return `$${formula}$`;
  }

  // Mixed mode: strip HTML, collapse whitespace, keep LaTeX delimiters
  const plain = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.slice(0, maxLength) + (plain.length > maxLength ? '…' : '');
}

export function MathPreview({
  content,
  className,
  maxLength = 110,
  mode = 'mixed',
}: MathPreviewProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const preview = extractPreview(content, maxLength, mode);

  useEffect(() => {
    let tries = 0;
    const maxTries = 15;

    const tryTypeset = () => {
      const mj = (window as any).MathJax;
      if (ref.current && mj?.typesetPromise) {
        mj.typesetPromise([ref.current])
          .then(() => setReady(true))
          .catch(() => setReady(true));
        return;
      }
      if (tries < maxTries) {
        tries += 1;
        setTimeout(tryTypeset, 400);
      } else {
        setReady(true);
      }
    };

    setReady(false);
    tryTypeset();
  }, [preview]);

  if (!preview) return null;

  return (
    <span
      ref={ref}
      className={cn(
        'block text-xs text-gray-500 mt-2 line-clamp-2 min-h-[1.25rem]',
        !ready && 'opacity-60',
        className
      )}
    >
      {!ready && <Loader2 className="inline w-3 h-3 mr-1 animate-spin" />}
      {preview}
    </span>
  );
}
