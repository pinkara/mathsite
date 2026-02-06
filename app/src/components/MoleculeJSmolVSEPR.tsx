import { useEffect, useRef, useState, useCallback } from 'react';
import { Atom, ExternalLink, Eye, EyeOff, Triangle, RotateCcw } from 'lucide-react';

interface MoleculeJSmolVSEPRProps {
  formula?: string;
  title?: string;
  height?: string;
  credits?: string;
}

type VSEPRType = 'AX4' | 'AX3E' | 'AX2E2' | 'AX3' | 'AX2' | 'AX2E';

interface MoleculeConfig {
  name: string;
  notation: VSEPRType;
  geometry: string;
  atoms: string;
  jmolScript: string;
  lonePairs?: { x: number; y: number; z: number }[];
  bondedAtoms?: number[];
}

const MOLECULES: Record<string, MoleculeConfig> = {
  CH4: {
    name: "Méthane",
    notation: "AX4",
    geometry: "Tétraédrique",
    atoms: "CH₄",
    bondedAtoms: [2, 3, 4, 5],
    jmolScript: `load data "model"
CH4
C 0.0 0.0 0.0
H 0.629 0.629 0.629
H -0.629 -0.629 0.629
H -0.629 0.629 -0.629
H 0.629 -0.629 -0.629
end "model"
spacefill 25%
wireframe 0.15
color atoms cpk
background white
zoom 120`
  },
  NH3: {
    name: "Ammoniac",
    notation: "AX3E",
    geometry: "Pyramide",
    atoms: "NH₃",
    bondedAtoms: [2, 3, 4],
    lonePairs: [{ x: 0, y: -0.8, z: 0.5 }],
    jmolScript: `load data "model"
NH3
N 0.0 0.0 0.1
H 0.0 0.94 -0.33
H -0.814 -0.47 -0.33
H 0.814 -0.47 -0.33
end "model"
spacefill 25%
wireframe 0.15
color atoms cpk
background white
zoom 120`
  },
  H2O: {
    name: "Eau",
    notation: "AX2E2",
    geometry: "Coudée",
    atoms: "H₂O",
    bondedAtoms: [2, 3],
    lonePairs: [
      { x: -0.4, y: -0.6, z: 0 },
      { x: 0.4, y: -0.6, z: 0 }
    ],
    jmolScript: `load data "model"
H2O
O 0.0 0.0 0.0
H 0.757 0.586 0.0
H -0.757 0.586 0.0
end "model"
spacefill 25%
wireframe 0.15
color atoms cpk
background white
zoom 120`
  },
  BF3: {
    name: "Trifluorure de bore",
    notation: "AX3",
    geometry: "Triangle plan",
    atoms: "BF₃",
    jmolScript: `load data "model"
BF3
B 0.0 0.0 0.0
F 1.3 0.0 0.0
F -0.65 1.126 0.0
F -0.65 -1.126 0.0
end "model"
spacefill 25%
wireframe 0.15
color atoms cpk
background white
zoom 120`
  },
  CO2: {
    name: "Dioxyde de carbone",
    notation: "AX2",
    geometry: "Linéaire",
    atoms: "CO₂",
    jmolScript: `load data "model"
CO2
C 0.0 0.0 0.0
O 1.16 0.0 0.0
O -1.16 0.0 0.0
end "model"
spacefill 25%
wireframe 0.15
color atoms cpk
background white
zoom 120`
  },
  SO2: {
    name: "Dioxyde de soufre",
    notation: "AX2E",
    geometry: "Coudée",
    atoms: "SO₂",
    bondedAtoms: [2, 3],
    lonePairs: [{ x: 0, y: -0.8, z: 0 }],
    jmolScript: `load data "model"
SO2
S 0.0 0.0 0.0
O 1.4 0.5 0.0
O -1.4 0.5 0.0
end "model"
spacefill 25%
wireframe 0.15
color atoms cpk
background white
zoom 120`
  }
};

let jsmolLoadingPromise: Promise<void> | null = null;

const loadJSmol = (): Promise<void> => {
  if (jsmolLoadingPromise) return jsmolLoadingPromise;
  
  if ((window as any).Jmol) {
    return Promise.resolve();
  }

  jsmolLoadingPromise = new Promise((resolve) => {
    if (document.getElementById('jsmol-script')) {
      const checkLoaded = setInterval(() => {
        if ((window as any).Jmol) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = 'jsmol-script';
    script.src = 'https://chemapps.stolaf.edu/jmol/jsmol/JSmol.min.js';
    script.async = true;
    
    script.onload = () => {
      const checkJmol = setInterval(() => {
        if ((window as any).Jmol) {
          clearInterval(checkJmol);
          resolve();
        }
      }, 100);
    };
    
    document.head.appendChild(script);
  });

  return jsmolLoadingPromise;
};

export function MoleculeJSmolVSEPR({ 
  formula = 'CH4', 
  title,
  height = '500px',
  credits
}: MoleculeJSmolVSEPRProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showLonePairs, setShowLonePairs] = useState(false);
  const [showGeometry, setShowGeometry] = useState(false);
  const appletIdRef = useRef<string>('');

  const config = MOLECULES[formula.toUpperCase()];
  const displayTitle = title || config?.name || formula;

  // Exécuter une commande Jmol via Jmol.scriptWait (plus stable)
  const runScript = useCallback((script: string) => {
    const appletId = appletIdRef.current;
    if (!appletId) return;
    
    try {
      const Jmol = (window as any).Jmol;
      if (!Jmol) return;
      
      // Essayer différentes méthodes
      if (typeof Jmol.scriptWait === 'function') {
        Jmol.scriptWait(appletId, script);
      } else if (typeof Jmol.script === 'function') {
        // Wrapper dans setTimeout pour éviter les problèmes de timing
        setTimeout(() => {
          try {
            Jmol.script(appletId, script);
          } catch (e) {
            console.log('[JSmol] Script method failed, trying alternative');
          }
        }, 100);
      }
    } catch (e) {
      console.error('[JSmol] Script error:', e);
    }
  }, []);

  // Initialiser JSmol avec les commandes VSEPR incluses
  useEffect(() => {
    if (!config) {
      setHasError(true);
      return;
    }

    let isMounted = true;
    appletIdRef.current = 'jmol_' + formula.toLowerCase() + '_' + Date.now();

    const init = async () => {
      try {
        await loadJSmol();
        
        if (!isMounted || !wrapperRef.current) return;

        const Jmol = (window as any).Jmol;
        if (!Jmol) {
          throw new Error('Jmol not available');
        }

        // Nettoyer le conteneur
        wrapperRef.current.innerHTML = '';

        // Créer le div qui recevra l'applet
        const appletDiv = document.createElement('div');
        appletDiv.id = appletIdRef.current;
        appletDiv.style.width = '100%';
        appletDiv.style.height = '100%';
        wrapperRef.current.appendChild(appletDiv);

        // Préparer le script avec les commandes VSEPR initiales
        let initialScript = config.jmolScript;
        
        // Configuration JSmol
        const Info = {
          width: '100%',
          height: '100%',
          debug: false,
          color: '#FFFFFF',
          addSelectionOptions: false,
          serverURL: 'https://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php',
          use: 'HTML5',
          j2sPath: 'https://chemapps.stolaf.edu/jmol/jsmol/j2s',
          script: initialScript,
          disableJ2SLoadMonitor: true,
          disableInitialConsole: true
        };

        // Créer l'applet
        Jmol.setDocument(0);
        
        let html;
        if (typeof Jmol.getAppletHtml === 'function') {
          html = Jmol.getAppletHtml(appletIdRef.current, Info);
        } else {
          html = Jmol.getApplet(appletIdRef.current, Info);
        }

        if (typeof html === 'string') {
          appletDiv.innerHTML = html;
        } else if (html && typeof html === 'object') {
          appletDiv.appendChild(html);
        }

        if (isMounted) {
          setIsReady(true);
        }

      } catch (e) {
        console.error('[JSmol] Error:', e);
        if (isMounted) {
          setHasError(true);
        }
      }
    };

    requestAnimationFrame(() => {
      setTimeout(init, 50);
    });

    return () => {
      isMounted = false;
    };
  }, [formula, config]);

  // Toggle doublets non liants
  useEffect(() => {
    if (!isReady || !config?.lonePairs) return;
    
    if (showLonePairs) {
      config.lonePairs.forEach((lp, i) => {
        runScript(`draw lp${i} sphere {${lp.x} ${lp.y} ${lp.z}} radius 0.4 color skyblue translucent 0.5;`);
      });
    } else {
      runScript('draw lp* delete;');
    }
  }, [showLonePairs, isReady, config, runScript]);

  // Toggle géométrie de référence
  useEffect(() => {
    if (!isReady || !config?.bondedAtoms) return;
    
    if (showGeometry) {
      const atoms = config.bondedAtoms;
      let script = '';
      
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          script += `draw line${i}_${j} @{atomno=${atoms[i]}} @{atomno=${atoms[j]}} color yellow dashed;`;
        }
      }
      
      runScript(script);
    } else {
      runScript('draw line* delete;');
    }
  }, [showGeometry, isReady, config, runScript]);

  // Reset la vue
  const handleReset = () => {
    runScript('zoom 120; draw * delete;');
    setShowLonePairs(false);
    setShowGeometry(false);
  };

  if (!config) {
    return (
      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Molécule "{formula}" non disponible</p>
        <p className="text-sm text-gray-600">Disponibles: {Object.keys(MOLECULES).join(', ')}</p>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center gap-3">
          <Atom className="w-5 h-5" />
          <div>
            <h3 className="font-bold">{displayTitle}</h3>
            <p className="text-xs text-blue-100">
              VSEPR <span className="font-mono">{config.notation}</span> • {config.geometry}
            </p>
          </div>
        </div>
        
        <a 
          href="https://chemapps.stolaf.edu/jmol/docs/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-white/80 hover:text-white"
        >
          <ExternalLink className="w-3 h-3" />
          JSmol
        </a>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        {config.lonePairs && (
          <button
            onClick={() => setShowLonePairs(!showLonePairs)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              showLonePairs 
                ? 'bg-sky-500 text-white shadow-sky-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showLonePairs ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Doublets non liants (E)
          </button>
        )}
        
        {config.bondedAtoms && config.bondedAtoms.length >= 3 && (
          <button
            onClick={() => setShowGeometry(!showGeometry)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              showGeometry 
                ? 'bg-amber-500 text-white shadow-amber-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Triangle className="w-4 h-4" />
            Géométrie de référence
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 ml-auto"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Viewer */}
      <div className="relative bg-white" style={{ height: typeof height === 'string' ? height : '400px' }}>
        {!isReady && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-600 text-sm mt-2">Chargement JSmol...</span>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-20">
            <div className="text-center p-4">
              <p className="text-red-600 font-medium">Erreur de chargement</p>
              <p className="text-sm text-gray-500">Impossible d'afficher la molécule</p>
            </div>
          </div>
        )}
        
        <div 
          ref={wrapperRef} 
          className="w-full h-full"
          style={{ minHeight: '300px' }}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-mono">{config.atoms}</span>
          <span className="text-gray-400">🖱️ Glisser pour tourner • Molette pour zoomer</span>
        </div>
        {credits && (
          <p className="text-xs text-gray-400 italic mt-2 text-center">{credits}</p>
        )}
      </div>
    </div>
  );
}

export default MoleculeJSmolVSEPR;
