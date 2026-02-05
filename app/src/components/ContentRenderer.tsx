import { useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface ContentRendererProps {
  content: string;
  className?: string;
}

// Composant pour un bloc de code individuel
function CodeBlock({ code, language = 'python' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 my-4 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="ml-2 text-xs text-gray-500 font-mono uppercase">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-600">Copié !</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          backgroundColor: '#fafafa',
        }}
        showLineNumbers
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: '#9ca3af',
          textAlign: 'right',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// Fonction pour parser le contenu et séparer texte/code
function parseContent(content: string): Array<{ type: 'html' | 'code'; content: string; language?: string }> {
  const parts: Array<{ type: 'html' | 'code'; content: string; language?: string }> = [];
  
  // Regex pour détecter les blocs de code
  // Supporte: <pre><code class="language-xxx">...</code></pre> ou <pre><code>...</code></pre>
  const codeBlockRegex = /<pre><code(?:\s+class=["']language-(\w+)["'])?\s*>([\s\S]*?)<\/code><\/pre>/gi;
  
  let lastIndex = 0;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Ajouter le texte avant le bloc de code
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push({ type: 'html', content: textBefore });
      }
    }
    
    // Extraire le langage et le code
    const language = match[1] || 'text';
    const code = match[2]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    parts.push({ type: 'code', content: code, language });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Ajouter le texte restant après le dernier bloc de code
  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex);
    if (textAfter.trim()) {
      parts.push({ type: 'html', content: textAfter });
    }
  }
  
  // Si pas de blocs de code trouvés, retourner le contenu complet
  if (parts.length === 0) {
    parts.push({ type: 'html', content });
  }
  
  return parts;
}

// Composant principal
export function ContentRenderer({ content, className = '' }: ContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const parsedParts = parseContent(content);

  useEffect(() => {
    // Charger MathJax si nécessaire
    if (typeof window !== 'undefined' && !(window as any).MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.id = 'mathjax-script';
      
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
        if (containerRef.current && (window as any).MathJax?.typesetPromise) {
          (window as any).MathJax.typesetPromise([containerRef.current]).catch(console.error);
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Typeset MathJax après chaque rendu
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
    <div ref={containerRef} className={`prose prose-gray max-w-none w-full ${className}`}>
      {parsedParts.map((part, index) => (
        part.type === 'code' ? (
          <CodeBlock key={index} code={part.content} language={part.language} />
        ) : (
          <div key={index} dangerouslySetInnerHTML={{ __html: part.content }} />
        )
      ))}
    </div>
  );
}

export default ContentRenderer;
