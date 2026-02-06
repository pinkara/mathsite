import { useEffect, useRef, useState } from 'react';
import { Atom, RotateCw, Maximize, Minimize, Eye, EyeOff, Info } from 'lucide-react';

interface Molecule3DmolProps {
  formula?: string;
  title?: string;
  height?: string;
  credits?: string;
}

type ViewMode = 'sphere' | 'stick' | 'line';
type VSEPRType = 'AX4' | 'AX3E' | 'AX2E2' | 'AX3' | 'AX2' | 'AX2E';

interface Atom3D {
  elem: string;
  x: number;
  y: number;
  z: number;
}

interface Bond {
  from: number;
  to: number;
  order?: number;
}

interface MoleculeConfig {
  name: string;
  notation: VSEPRType;
  geometry: string;
  shape: string;
  angles: string;
  atoms: string;
  description: string;
  hasLonePairs: boolean;
  hasTetrahedron: boolean;
  atomList: Atom3D[];
  bonds: Bond[];
  lonePairs?: { x: number; y: number; z: number }[];
}

// Couleurs CPK
const CPK_COLORS: Record<string, string> = {
  'H': '#FFFFFF',  // Blanc
  'C': '#909090',  // Gris
  'N': '#3050F8',  // Bleu
  'O': '#FF0D0D',  // Rouge
  'F': '#90E050',  // Vert clair
  'S': '#FFFF30',  // Jaune
  'B': '#FFB5B5',  // Rose
  'P': '#FF8000',  // Orange
  'Cl': '#1FF01F', // Vert
};

const MOLECULES: Record<string, MoleculeConfig> = {
  CH4: {
    name: "Méthane",
    notation: "AX4",
    geometry: "Tétraédrique",
    shape: "Tétraédrique",
    angles: "109.5°",
    atoms: "CH₄",
    description: "4 liaisons C-H. Géométrie de référence sans contrainte.",
    hasLonePairs: false,
    hasTetrahedron: true,
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.629, y: 0.629, z: 0.629 },
      { elem: 'H', x: -0.629, y: -0.629, z: 0.629 },
      { elem: 'H', x: -0.629, y: 0.629, z: -0.629 },
      { elem: 'H', x: 0.629, y: -0.629, z: -0.629 },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 0, to: 4 },
    ]
  },
  NH3: {
    name: "Ammoniac",
    notation: "AX3E",
    geometry: "Tétraédrique",
    shape: "Pyramide trigone",
    angles: "107°",
    atoms: "NH₃",
    description: "3 liaisons N-H + 1 doublet non liant. Le doublet repousse plus fort.",
    hasLonePairs: true,
    hasTetrahedron: true,
    atomList: [
      { elem: 'N', x: 0.0, y: 0.0, z: 0.1 },
      { elem: 'H', x: 0.0, y: 0.94, z: -0.33 },
      { elem: 'H', x: -0.814, y: -0.47, z: -0.33 },
      { elem: 'H', x: 0.814, y: -0.47, z: -0.33 },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
    ],
    lonePairs: [{ x: 0, y: -0.8, z: 0.5 }]
  },
  H2O: {
    name: "Eau",
    notation: "AX2E2",
    geometry: "Tétraédrique",
    shape: "Coudée (angulaire)",
    angles: "104.5°",
    atoms: "H₂O",
    description: "2 liaisons O-H + 2 doublets non liants. Forte répulsion.",
    hasLonePairs: true,
    hasTetrahedron: true,
    atomList: [
      { elem: 'O', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.757, y: 0.586, z: 0.0 },
      { elem: 'H', x: -0.757, y: 0.586, z: 0.0 },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
    ],
    lonePairs: [
      { x: -0.4, y: -0.6, z: 0 },
      { x: 0.4, y: -0.6, z: 0 }
    ]
  },
  BF3: {
    name: "Trifluorure de bore",
    notation: "AX3",
    geometry: "Triangulaire plane",
    shape: "Triangulaire plane",
    angles: "120°",
    atoms: "BF₃",
    description: "3 liaisons B-F. Pas de doublet sur le bore.",
    hasLonePairs: false,
    hasTetrahedron: false,
    atomList: [
      { elem: 'B', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 1.3, y: 0.0, z: 0.0 },
      { elem: 'F', x: -0.65, y: 1.126, z: 0.0 },
      { elem: 'F', x: -0.65, y: -1.126, z: 0.0 },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
    ]
  },
  CO2: {
    name: "Dioxyde de carbone",
    notation: "AX2",
    geometry: "Linéaire",
    shape: "Linéaire",
    angles: "180°",
    atoms: "CO₂",
    description: "2 doubles liaisons C=O. Géométrie linéaire.",
    hasLonePairs: false,
    hasTetrahedron: false,
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.16, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.16, y: 0.0, z: 0.0 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 2 },
    ]
  },
  SO2: {
    name: "Dioxyde de soufre",
    notation: "AX2E",
    geometry: "Triangulaire plane",
    shape: "Coudée",
    angles: "119°",
    atoms: "SO₂",
    description: "2 doubles liaisons S=O + 1 doublet sur le soufre.",
    hasLonePairs: true,
    hasTetrahedron: true,
    atomList: [
      { elem: 'S', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.4, y: 0.5, z: 0.0 },
      { elem: 'O', x: -1.4, y: 0.5, z: 0.0 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 2 },
    ],
    lonePairs: [{ x: 0, y: -0.8, z: 0 }]
  }
};

// Générer le format XYZ
const generateXYZ = (atoms: Atom3D[]): string => {
  const lines = [atoms.length.toString(), 'VSEPR molecule'];
  atoms.forEach(atom => {
    lines.push(`${atom.elem} ${atom.x.toFixed(4)} ${atom.y.toFixed(4)} ${atom.z.toFixed(4)}`);
  });
  return lines.join('\n');
};

export function Molecule3Dmol({ 
  formula = 'CH4', 
  title,
  height = '500px',
  credits
}: Molecule3DmolProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('stick');
  const [showLonePairs, setShowLonePairs] = useState(false);
  const [showGeometry, setShowGeometry] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const viewerRef = useRef<any>(null);
  const elementIdRef = useRef<string>('');

  const config = MOLECULES[formula.toUpperCase()];
  const displayTitle = title || config?.name || formula;

  // Initialiser 3Dmol
  useEffect(() => {
    if (!config) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const elementId = 'mol3d_' + formula.toLowerCase() + '_' + Date.now();
    elementIdRef.current = elementId;

    const init = async () => {
      // Charger 3Dmol si nécessaire
      if (!(window as any).$3Dmol) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://3Dmol.org/build/3Dmol-min.js';
          script.async = true;
          script.onload = () => {
            const check = setInterval(() => {
              if ((window as any).$3Dmol) {
                clearInterval(check);
                resolve();
              }
            }, 50);
          };
          document.head.appendChild(script);
        });
      }

      if (!isMounted || !containerRef.current) return;

      const $3Dmol = (window as any).$3Dmol;
      if (!$3Dmol) {
        console.error('3Dmol not loaded');
        setIsLoading(false);
        return;
      }

      try {
        // Créer un élément pour le viewer
        const viewerDiv = document.createElement('div');
        viewerDiv.id = elementId;
        viewerDiv.style.width = '100%';
        viewerDiv.style.height = '100%';
        viewerDiv.style.position = 'relative';
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(viewerDiv);

        // Créer le viewer avec le style embeddable
        const viewer = $3Dmol.createViewer(viewerDiv, {
          backgroundColor: 'white',
          defaultcolors: $3Dmol.rasmolElementColors
        });

        if (!viewer) {
          throw new Error('Failed to create viewer');
        }

        viewerRef.current = viewer;

        // Charger la molécule depuis XYZ
        const xyz = generateXYZ(config.atomList);
        viewer.addModel(xyz, 'xyz');

        // Appliquer le style initial
        viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.25 } });

        // Zoom et centrer
        viewer.zoomTo();
        viewer.render();

        setIsLoading(false);
        setIsReady(true);

      } catch (e) {
        console.error('3Dmol error:', e);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [formula, config]);

  // Mettre à jour le style
  useEffect(() => {
    if (!viewerRef.current || !isReady) return;

    const viewer = viewerRef.current;
    viewer.removeAllShapes();

    switch (viewMode) {
      case 'sphere':
        viewer.setStyle({}, { sphere: { scale: 0.8 } });
        break;
      case 'stick':
        viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.25 } });
        break;
      case 'line':
        viewer.setStyle({}, { line: {} });
        break;
    }

    // Ajouter les doublets non liants si activés
    if (showLonePairs && config?.lonePairs) {
      config.lonePairs.forEach(lp => {
        viewer.addShape({
          type: 'sphere',
          center: { x: lp.x, y: lp.y, z: lp.z },
          radius: 0.35,
          color: '#87CEEB',
          alpha: 0.5
        });
      });
    }

    // Ajouter la géométrie de référence si activée
    if (showGeometry && config?.hasTetrahedron) {
      const atoms = config.atomList;
      const central = atoms[0];
      const others = atoms.slice(1);
      
      // Relier les atomes périphériques
      for (let i = 0; i < others.length; i++) {
        for (let j = i + 1; j < others.length; j++) {
          viewer.addShape({
            type: 'line',
            start: { x: others[i].x, y: others[i].y, z: others[i].z },
            end: { x: others[j].x, y: others[j].y, z: others[j].z },
            color: '#FFD700',
            dashed: true,
            linewidth: 2
          });
        }
      }
    }

    viewer.render();
  }, [viewMode, showLonePairs, showGeometry, isReady, config]);

  // Gérer la rotation
  useEffect(() => {
    if (!viewerRef.current || !isReady) return;
    
    if (isSpinning) {
      viewerRef.current.spin('y', 1);
    } else {
      viewerRef.current.spin(false);
    }
  }, [isSpinning, isReady]);

  if (!config) {
    return (
      <div className="my-4 p-6 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-700 font-medium">Molécule "{formula}" non disponible</p>
        <p className="text-sm text-gray-600 mt-2">
          Disponibles : {Object.keys(MOLECULES).join(', ')}
        </p>
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
              {config.notation} • {config.shape}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/20 px-2 py-1 rounded">
            ∠ {config.angles}
          </span>
        </div>
      </div>

      {/* Info panel */}
      <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
        <p className="text-sm text-blue-800">
          <Info className="w-4 h-4 inline mr-1" />
          {config.description}
        </p>
      </div>

      {/* Viewer */}
      <div 
        className="relative bg-white"
        style={{ height: typeof height === 'string' ? height : '400px' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-600 text-sm mt-2">Chargement 3Dmol...</span>
          </div>
        )}
        
        <div 
          ref={containerRef} 
          className="w-full h-full"
        />
      </div>

      {/* Controls */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-3">
        {/* View mode buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium uppercase mr-2">Affichage:</span>
          <button
            onClick={() => setViewMode('sphere')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'sphere' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Spacefill
          </button>
          <button
            onClick={() => setViewMode('stick')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'stick' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Bâtonnets
          </button>
          <button
            onClick={() => setViewMode('line')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'line' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Fil de fer
          </button>
        </div>

        {/* Option buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium uppercase mr-2">Options:</span>
          
          {config.hasLonePairs && (
            <button
              onClick={() => setShowLonePairs(!showLonePairs)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                showLonePairs 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {showLonePairs ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Doublets non liants (E)
            </button>
          )}
          
          {config.hasTetrahedron && (
            <button
              onClick={() => setShowGeometry(!showGeometry)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                showGeometry 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {showGeometry ? <Maximize className="w-3.5 h-3.5" /> : <Minimize className="w-3.5 h-3.5" />}
              Tétraèdre de référence
            </button>
          )}
          
          <button
            onClick={() => setIsSpinning(!isSpinning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              isSpinning 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
            Rotation
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-mono">{config.atoms}</span>
          <span>🖱️ Cliquez et glissez pour tourner • Molette pour zoomer</span>
        </div>
        {credits && (
          <p className="text-xs text-gray-400 italic mt-1 text-center">{credits}</p>
        )}
      </div>
    </div>
  );
}

export default Molecule3Dmol;
