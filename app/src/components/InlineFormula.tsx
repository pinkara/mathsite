import { useEffect, useRef } from 'react';

interface InlineFormulaProps {
  tex: string;
  className?: string;
}

export function InlineFormula({ tex, className = '' }: InlineFormulaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise([containerRef.current]);
    }
  }, [tex]);

  const formattedTex = tex.trim().startsWith('$') ? tex : `$${tex}$`;

  return (
    <div ref={containerRef} className={className}>
      {formattedTex}
    </div>
  );
}

// Component for titles with LaTeX support
export function TitleWithFormula({ text, className = '' }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise([containerRef.current]);
    }
  }, [text]);

  // Check if text contains LaTeX
  const hasLatex = text.includes('$');
  
  if (!hasLatex) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span ref={containerRef} className={className}>
      {text}
    </span>
  );
}
