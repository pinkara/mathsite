import { useEffect, useCallback } from 'react';

// Hook pour forcer le re-rendu MathJax après changement du DOM
export function useMathJaxTypeset() {
  const typeset = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).MathJax?.typesetPromise) {
      // Petit délai pour laisser React mettre à jour le DOM
      setTimeout(() => {
        (window as any).MathJax.typesetPromise().catch((err: Error) => {
          // Ignorer les erreurs si MathJax n'est pas encore prêt
          if (!err.message?.includes('MathJax')) {
            console.error('MathJax typeset error:', err);
          }
        });
      }, 50);
    }
  }, []);

  return typeset;
}

// Hook pour déclencher MathJax après chaque mise à jour de dépendances
export function useMathJaxEffect(deps: React.DependencyList) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).MathJax?.typesetPromise) {
      const timer = setTimeout(() => {
        (window as any).MathJax.typesetPromise().catch((err: Error) => {
          if (!err.message?.includes('MathJax')) {
            console.error('MathJax typeset error:', err);
          }
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, deps);
}
