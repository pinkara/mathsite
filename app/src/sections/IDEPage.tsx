import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Terminal, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  Code2, 
  FileCode,
  Sparkles,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { IDELanguage, CodeSnippet } from '@/types/ide';

// Exemples de code par défaut
const DEFAULT_CODES: Record<IDELanguage, string> = {
  python: `# Bienvenue dans l'IDE Python !
# Écrivez votre code ici et cliquez sur "Exécuter"

print("Hello, MathUnivers!")

# Exemple : Calcul de factorielle
def factorielle(n):
    if n <= 1:
        return 1
    return n * factorielle(n - 1)

print(f"5! = {factorielle(5)}")

# Exemple : Suite de Fibonacci
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print("Suite de Fibonacci:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,

  javascript: `// Bienvenue dans l'IDE JavaScript !
// Écrivez votre code ici et cliquez sur "Exécuter"

console.log("Hello, MathUnivers!");

// Exemple : Calcul de factorielle
function factorielle(n) {
    if (n <= 1) return 1;
    return n * factorielle(n - 1);
}

console.log("5! =", factorielle(5));

// Exemple : Suite de Fibonacci
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Suite de Fibonacci:");
for (let i = 0; i < 10; i++) {
    console.log("F(" + i + ") = " + fibonacci(i));
}

// Exemple : Calcul de π avec la série de Leibniz
let pi = 0;
for (let i = 0; i < 1000000; i++) {
    pi += (i % 2 === 0 ? 1 : -1) / (2 * i + 1);
}
console.log("π ≈", pi * 4);`
};

// Snippets d'exemple
const EXAMPLE_SNIPPETS: CodeSnippet[] = [
  {
    id: '1',
    title: 'Résolution équation du 2nd degré',
    description: 'Calcule les racines d\'une équation ax² + bx + c = 0',
    language: 'python',
    category: 'Mathématiques',
    level: 'Débutant',
    code: `import math

def resoudre_equation(a, b, c):
    """Résout ax² + bx + c = 0"""
    delta = b**2 - 4*a*c
    
    print(f"Équation: {a}x² + {b}x + {c} = 0")
    print(f"Δ = {delta}")
    
    if delta > 0:
        x1 = (-b - math.sqrt(delta)) / (2*a)
        x2 = (-b + math.sqrt(delta)) / (2*a)
        print(f"Deux solutions: x₁ = {x1}, x₂ = {x2}")
    elif delta == 0:
        x = -b / (2*a)
        print(f"Solution unique: x = {x}")
    else:
        print("Pas de solution réelle")

# Test
resoudre_equation(1, -5, 6)  # x² - 5x + 6 = 0`
  },
  {
    id: '2',
    title: 'Approximation de π (Méthode de Monte Carlo)',
    description: 'Estime π en générant des points aléatoires',
    language: 'python',
    category: 'Mathématiques',
    level: 'Intermédiaire',
    code: `import random

def approximer_pi(n_points=100000):
    """Approxime π par la méthode de Monte Carlo"""
    points_dans_cercle = 0
    
    for _ in range(n_points):
        x = random.random()
        y = random.random()
        if x**2 + y**2 <= 1:
            points_dans_cercle += 1
    
    pi_approx = 4 * points_dans_cercle / n_points
    print(f"π ≈ {pi_approx}")
    print(f"Erreur: {abs(math.pi - pi_approx):.6f}")
    return pi_approx

approximer_pi(100000)`
  },
  {
    id: '3',
    title: 'Graphique avec Matplotlib',
    description: 'Trace une fonction mathématique',
    language: 'python',
    category: 'Visualisation',
    level: 'Débutant',
    code: `import numpy as np
import matplotlib.pyplot as plt

# Création des données
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Création du graphique
plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2, label='sin(x)')
plt.axhline(y=0, color='k', linestyle='-', linewidth=0.5)
plt.axvline(x=0, color='k', linestyle='-', linewidth=0.5)
plt.grid(True, alpha=0.3)
plt.xlabel('x')
plt.ylabel('y')
plt.title('Fonction sinus')
plt.legend()
plt.show()

print("Graphique généré avec succès!")`
  },
  {
    id: '4',
    title: 'Dérivée numérique',
    description: 'Calcule la dérivée d\'une fonction par différence finie',
    language: 'javascript',
    category: 'Analyse',
    level: 'Intermédiaire',
    code: `// Dérivée numérique par la méthode des différences finies
function derivee(f, x, h = 0.0001) {
    return (f(x + h) - f(x - h)) / (2 * h);
}

// Test avec f(x) = x²
function f(x) {
    return x * x;
}

console.log("f(x) = x²");
console.log("f'(2) ≈", derivee(f, 2));  // Devrait être 4
console.log("f'(3) ≈", derivee(f, 3));  // Devrait être 6

// Test avec f(x) = sin(x)
console.log("\\nf(x) = sin(x)");
console.log("f'(π/4) ≈", derivee(Math.sin, Math.PI/4));  // Devrait être cos(π/4) ≈ 0.707`
  }
];

export function IDEPage() {
  const [language, setLanguage] = useState<IDELanguage>('python');
  const [code, setCode] = useState(DEFAULT_CODES.python);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Charger Pyodide pour Python
  const [pyodide, setPyodide] = useState<any>(null);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [plotImage, setPlotImage] = useState<string | null>(null);

  useEffect(() => {
    if (language === 'python' && !pyodide && !pyodideLoading) {
      setPyodideLoading(true);
      loadPyodide();
    }
  }, [language]);

  const loadPyodide = async () => {
    try {
      // @ts-ignore
      const loadPyodideScript = async () => {
        if ((window as any).loadPyodide) {
          const py = await (window as any).loadPyodide();
          // Charger matplotlib et numpy
          await py.loadPackage(['matplotlib', 'numpy', 'mpmath']);
          // Configurer matplotlib pour utiliser le backend AGG (qui génère des images)
          await py.runPythonAsync(`
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
import io
import base64

# Fonction pour afficher le graphique
def show_plot():
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return img_str
`);
          setPyodide(py);
          setPyodideLoading(false);
        } else {
          // Charger le script Pyodide
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
          script.onload = async () => {
            const py = await (window as any).loadPyodide();
            // Charger matplotlib et numpy
            await py.loadPackage(['matplotlib', 'numpy', 'mpmath']);
            // Configurer matplotlib
            await py.runPythonAsync(`
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
import io
import base64

def show_plot():
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return img_str
`);
            setPyodide(py);
            setPyodideLoading(false);
          };
          document.head.appendChild(script);
        }
      };
      await loadPyodideScript();
    } catch (err) {
      setError('Erreur de chargement de Python. Réessayez.');
      setPyodideLoading(false);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');
    setPlotImage(null);

    const startTime = performance.now();

    try {
      if (language === 'javascript') {
        // Capturer console.log
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(a => String(a)).join(' '));
        };

        // Exécuter le code
        // eslint-disable-next-line no-new-func
        new Function(code)();

        // Restaurer console.log
        console.log = originalLog;

        setOutput(logs.join('\n') || '(Aucune sortie)');
      } else if (language === 'python') {
        if (!pyodide) {
          setError('Python est encore en chargement...');
          setIsRunning(false);
          return;
        }

        // Rediriger stdout
        let pyOutput = '';
        pyodide.setStdout({ batched: (text: string) => {
          pyOutput += text + '\n';
        }});

        // Exécuter le code
        await pyodide.runPythonAsync(code);
        
        // Vérifier si un graphique a été créé
        try {
          const hasPlot = pyodide.runPython('len(plt.get_fignums()) > 0');
          if (hasPlot) {
            const imgBase64 = pyodide.runPython('show_plot()');
            setPlotImage(`data:image/png;base64,${imgBase64}`);
          }
        } catch (e) {
          // Pas de graphique, ignorer
        }
        
        setOutput(pyOutput || '(Aucune sortie)');
      }
    } catch (err: any) {
      setError(err.message || String(err));
    }

    const executionTime = performance.now() - startTime;
    setOutput(prev => prev + `\n\n---\n⏱️ Exécuté en ${executionTime.toFixed(2)}ms`);
    setIsRunning(false);

    // Scroll vers la sortie
    outputRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearCode = () => {
    setCode('');
    setOutput('');
    setError('');
    setPlotImage(null);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const extension = language === 'python' ? 'py' : 'js';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathunivers_code.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSnippet = (snippet: CodeSnippet) => {
    setLanguage(snippet.language);
    setCode(snippet.code);
    setSelectedSnippet(snippet);
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-indigo-600" />
            IDE MathUnivers
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Éditeur et exécuteur de code Python & JavaScript
          </p>
        </div>
        
        {/* Language Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setLanguage('python');
              setCode(DEFAULT_CODES.python);
            }}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
              language === 'python'
                ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <FileCode className="w-4 h-4" />
            Python
          </button>
          <button
            onClick={() => {
              setLanguage('javascript');
              setCode(DEFAULT_CODES.javascript);
            }}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
              language === 'javascript'
                ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Code2 className="w-4 h-4" />
            JavaScript
          </button>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
        <h2 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Exemples de code
        </h2>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_SNIPPETS.map(snippet => (
            <button
              key={snippet.id}
              onClick={() => loadSnippet(snippet)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm transition-all text-left',
                selectedSnippet?.id === snippet.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-indigo-100 border border-indigo-200'
              )}
            >
              <span className="font-medium">{snippet.title}</span>
              <span className="text-xs opacity-75 block">
                {snippet.language === 'python' ? '🐍' : '📜'} {snippet.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Code Input */}
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-gray-400 text-sm font-mono">
                {language === 'python' ? 'main.py' : 'main.js'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyCode}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Copier"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={downloadCode}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={clearCode}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                title="Effacer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Code Area */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
            placeholder={`Écrivez votre code ${language} ici...`}
          />

          {/* Run Button */}
          <div className="p-3 bg-gray-800 border-t border-gray-700">
            <Button
              onClick={runCode}
              disabled={isRunning || (language === 'python' && pyodideLoading)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Exécution...
                </>
              ) : pyodideLoading && language === 'python' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Chargement Python...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Exécuter
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output */}
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg" ref={outputRef}>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <span className="text-gray-400 text-sm font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Console
            </span>
            <button
              onClick={() => { setOutput(''); setError(''); setPlotImage(null); }}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Effacer
            </button>
          </div>

          <div className="h-96 p-4 overflow-auto">
            {error ? (
              <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                {error}
              </pre>
            ) : output || plotImage ? (
              <>
                {plotImage && (
                  <div className="mb-4">
                    <img 
                      src={plotImage} 
                      alt="Graphique généré" 
                      className="max-w-full h-auto rounded-lg border border-gray-700"
                    />
                  </div>
                )}
                {output && (
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                    {output}
                  </pre>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Terminal className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Cliquez sur "Exécuter" pour voir le résultat</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <Sparkles className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-bold text-blue-800 text-sm">Python + Matplotlib</h3>
          <p className="text-xs text-blue-600 mt-1">
            Créez des graphiques avec matplotlib, numpy et mpmath. Les figures s'affichent automatiquement !
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <Code2 className="w-6 h-6 text-yellow-600 mb-2" />
          <h3 className="font-bold text-yellow-800 text-sm">JavaScript natif</h3>
          <p className="text-xs text-yellow-600 mt-1">
            JavaScript s'exécute instantanément avec les mêmes performances que votre navigateur.
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <BookOpen className="w-6 h-6 text-purple-600 mb-2" />
          <h3 className="font-bold text-purple-800 text-sm">Apprentissage interactif</h3>
          <p className="text-xs text-purple-600 mt-1">
            Testez vos algorithmes mathématiques directement sans installer quoi que ce soit.
          </p>
        </div>
      </div>
    </div>
  );
}

export default IDEPage;
