import { useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
}

// Composant pour rendre du contenu avec des formules mathématiques
export function MathRenderer({ content, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Charger MathJax si nécessaire
    if (typeof window !== 'undefined' && !(window as any).MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.id = 'mathjax-script';
      
      // Configuration MathJax
      (window as any).MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
        },
        svg: {
          fontCache: 'global',
        },
      };
      
      script.onload = () => {
        // Run typeset on load for any content already rendered
        if (containerRef.current && (window as any).MathJax?.typesetPromise) {
          (window as any).MathJax.typesetPromise([containerRef.current]).catch(console.error);
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Typeset les formules après le rendu; retry a few times if MathJax not yet loaded
    let tries = 0;
    const tryTypeset = () => {
      if (containerRef.current && (window as any).MathJax?.typesetPromise) {
        (window as any).MathJax.typesetPromise([containerRef.current]).catch(console.error);
      } else if (tries < 5) {
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
