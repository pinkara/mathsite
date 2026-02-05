import { useEffect, useRef, useState } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Si MathJax existe déjà, le réinitialiser
      if ((window as any).MathJax) {
        delete (window as any).MathJax;
        const oldScript = document.getElementById('MathJax-script');
        if (oldScript) oldScript.remove();
      }

      // Configuration MathJax
      (window as any).MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
        },
        svg: {
          fontCache: 'global'
        },
        loader: {
          load: ['[tex]/color']
        },
        startup: {
          ready: () => {
            console.log('MathJax startup ready');
            (window as any).MathJax.startup.defaultReady();
          }
        }
      };
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
      script.async = true;
      script.id = 'MathJax-script';
      
      script.onload = async () => {
        console.log('Script loaded, waiting for MathJax...');
        
        // Attendre que MathJax soit prêt
        const checkMathJax = setInterval(async () => {
          const jax = (window as any).MathJax;
          if (jax?.loader?.ready) {
            clearInterval(checkMathJax);
            console.log('MathJax found, loading color extension...');
            
            try {
              // Charger explicitement l'extension color
              await jax.loader.load('[tex]/color');
              console.log('Color extension loaded successfully!');
              
              // Vérifier
              const packages = jax.tex?.parseOptions?.packages;
              if (packages) {
                console.log('Packages:', Array.from(packages));
              }
              
              setMathJaxLoaded(true);
              
              // Typeset initial
              if (containerRef.current && jax.typesetPromise) {
                await jax.typesetPromise([containerRef.current]);
              }
            } catch (err) {
              console.error('Failed to load color:', err);
            }
          }
        }, 100);
      };
      
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (mathJaxLoaded && containerRef.current && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise([containerRef.current])
        .catch(console.error);
    }
  }, [content, mathJaxLoaded]);

  return (
    <div 
      ref={containerRef}
      className={`prose prose-gray max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

interface FormulaDisplayProps {
  tex: string;
  display?: boolean;
  className?: string;
}

export function FormulaDisplay({ tex, display = false, className = '' }: FormulaDisplayProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise([ref.current])
        .catch(console.error);
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
