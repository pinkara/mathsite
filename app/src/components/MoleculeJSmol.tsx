import { useEffect, useRef, useState } from 'react';
import { Atom, ExternalLink } from 'lucide-react';

interface MoleculeJSmolProps {
  formula?: string;
  title?: string;
  height?: string;
  credits?: string;
  iframe?: boolean;
}

type VSEPRType = 'AX4' | 'AX3E' | 'AX2E2' | 'AX3' | 'AX2' | 'AX2E';

interface MoleculeConfig {
  name: string;
  notation: VSEPRType;
  geometry: string;
  atoms: string;
  jmolScript: string;
}

const MOLECULES: Record<string, MoleculeConfig> = {
  CH4: {
    name: "Méthane",
    notation: "AX4",
    geometry: "Tétraédrique",
    atoms: "CH₄",
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

// Charger JSmol une seule fois
let jsmolLoadingPromise: Promise<void> | null = null;

const loadJSmol = (): Promise<void> => {
  if (jsmolLoadingPromise) return jsmolLoadingPromise;
  
  if ((window as any).Jmol) {
    return Promise.resolve();
  }

  jsmolLoadingPromise = new Promise((resolve) => {
    if (document.getElementById('jsmol-script')) {
      // Script déjà en cours de chargement, attendre
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
      console.log('[JSmol] Script loaded');
      // Attendre que Jmol soit initialisé
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

export function MoleculeJSmol({ 
  formula = 'CH4', 
  title,
  height = '400px',
  credits,
  iframe = false
}: MoleculeJSmolProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const appletIdRef = useRef<string>('');

  const config = MOLECULES[formula.toUpperCase()];
  const displayTitle = title || config?.name || formula;

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

        console.log('[JSmol] Creating applet:', appletIdRef.current);

        // Nettoyer le conteneur
        wrapperRef.current.innerHTML = '';

        // Créer le div qui recevra l'applet
        const appletDiv = document.createElement('div');
        appletDiv.id = appletIdRef.current;
        appletDiv.style.width = '100%';
        appletDiv.style.height = '100%';
        wrapperRef.current.appendChild(appletDiv);

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
          script: config.jmolScript,
          disableJ2SLoadMonitor: true,
          disableInitialConsole: true
        };

        // Créer l'applet - utiliser le div comme conteneur
        Jmol.setDocument(0);
        
        // Essayer différentes méthodes selon la version de JSmol
        let html;
        if (typeof Jmol.getAppletHtml === 'function') {
          html = Jmol.getAppletHtml(appletIdRef.current, Info);
        } else {
          html = Jmol.getApplet(appletIdRef.current, Info);
        }

        console.log('[JSmol] HTML type:', typeof html);
        console.log('[JSmol] HTML length:', html?.length || 0);

        // Insérer le HTML
        if (typeof html === 'string') {
          appletDiv.innerHTML = html;
        } else if (html && typeof html === 'object') {
          // JSmol peut retourner un objet DOM
          appletDiv.appendChild(html);
        }

        if (isMounted) {
          setIsReady(true);
        }
        
        console.log('[JSmol] Applet inserted');

      } catch (e) {
        console.error('[JSmol] Error:', e);
        if (isMounted) {
          setHasError(true);
        }
      }
    };

    // Petit délai pour s'assurer que le DOM est prêt
    requestAnimationFrame(() => {
      setTimeout(init, 50);
    });

    return () => {
      isMounted = false;
    };
  }, [formula, config]);

  if (!config) {
    return (
      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Molécule "{formula}" non disponible</p>
        <p className="text-sm text-gray-600">Disponibles: {Object.keys(MOLECULES).join(', ')}</p>
      </div>
    );
  }

  const viewerContent = (
    <div className="relative w-full bg-white">
      {/* Overlay de chargement */}
      {!isReady && !hasError && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20"
          style={{ height: typeof height === 'string' ? height : '400px' }}
        >
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600 text-sm mt-2">Chargement JSmol...</span>
        </div>
      )}
      
      {/* Message d'erreur */}
      {hasError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-red-50 z-20"
          style={{ height: typeof height === 'string' ? height : '400px' }}
        >
          <div className="text-center p-4">
            <p className="text-red-600 font-medium">Erreur de chargement</p>
            <p className="text-sm text-gray-500">Impossible d'afficher la molécule</p>
          </div>
        </div>
      )}
      
      {/* Conteneur JSmol - dimensions fixes importantes */}
      <div 
        ref={wrapperRef} 
        className="w-full"
        style={{ 
          height: typeof height === 'string' ? height : '400px',
          minHeight: '300px'
        }}
      />
      
      {/* Credits */}
      {credits && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/90 px-2 py-1 rounded z-30">
          {credits}
        </div>
      )}
    </div>
  );

  if (iframe) {
    return (
      <div className="my-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
        {viewerContent}
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

      {/* Viewer */}
      {viewerContent}

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-mono">{config.atoms}</span>
          <span className="text-gray-400">🖱️ Glisser pour tourner • Molette pour zoomer</span>
        </div>
      </div>
    </div>
  );
}

export default MoleculeJSmol;
