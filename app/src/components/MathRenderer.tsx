import { useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
}

// Composant pour rendre du contenu avec des formules mathématiques
export function MathRenderer({ content, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).MathJax) {
      // Configuration MathJax - selon documentation officielle
      (window as any).MathJax = {
        loader: {load: ['[tex]/color']},
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          packages: {'[+]': ['color']}
        },
        svg: {
          fontCache: 'global',
        },
      };
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
      script.async = true;
      script.id = 'mathjax-script';
      
      script.onload = () => {
        if (containerRef.current && (window as any).MathJax?.typesetPromise) {
          (window as any).MathJax.typesetPromise([containerRef.current]).catch(console.error);
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    let tries = 0;
    const tryTypeset = () => {
      if (containerRef.current && (window as any).MathJax?.typesetPromise) {
        (window as any).MathJax.typesetPromise([containerRef.current]).catch(console.error);
      } else if (tries < 15) {
        tries += 1;
        setTimeout(tryTypeset, 300);
      }
    };
    tryTypeset();
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className={`prose prose-gray max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// Composant pour afficher une formule simple
interface FormulaDisplayProps {
  tex: string;
  display?: boolean;
  className?: string;
}

export function FormulaDisplay({ tex, display = false, className = '' }: FormulaDisplayProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise([ref.current]);
    }
  }, [tex]);

  if (display) {
    return (
      <div ref={ref} className={`my-4 overflow-x-auto ${className}`}>
        {`$$${tex}$$`}
      </div>
    );
  }

  return (
    <span ref={ref} className={className}>
      {`$${tex}$`}
    </span>
  );
}
