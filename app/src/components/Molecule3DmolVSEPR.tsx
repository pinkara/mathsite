import { useEffect, useRef, useState, useCallback } from 'react';
import { Atom, Eye, EyeOff, Triangle, RotateCcw } from 'lucide-react';

interface Molecule3DmolVSEPRProps {
  formula?: string;
  title?: string;
  height?: string;
  credits?: string;
}

type VSEPRType = 'AX4' | 'AX3E' | 'AX2E2' | 'AX3' | 'AX2' | 'AX2E';

interface Atom3D {
  elem: string;
  x: number;
  y: number;
  z: number;
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
  lonePairs?: { x: number; y: number; z: number }[];
}

const CPK_COLORS: Record<string, number> = {
  'H': 0xFFFFFF,
  'C': 0x909090,
  'N': 0x3050F8,
  'O': 0xFF0D0D,
  'F': 0x90E050,
  'S': 0xFFFF30,
  'B': 0xFFB5B5,
  'P': 0xFF8000,
  'Cl': 0x1FF01F,
};

const VDW_RADII: Record<string, number> = {
  'H': 1.2,
  'C': 1.7,
  'N': 1.55,
  'O': 1.52,
  'F': 1.47,
  'S': 1.8,
  'B': 1.92,
  'P': 1.8,
  'Cl': 1.75,
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
    lonePairs: [{ x: 0, y: -0.8, z: 0 }]
  }
};

let mol3dLoadPromise: Promise<void> | null = null;

const load3Dmol = (): Promise<void> => {
  if (mol3dLoadPromise) return mol3dLoadPromise;
  
  if ((window as any).$3Dmol) {
    return Promise.resolve();
  }

  mol3dLoadPromise = new Promise((resolve) => {
    if (document.getElementById('3dmol-script')) {
      const check = setInterval(() => {
        if ((window as any).$3Dmol) {
          clearInterval(check);
          resolve();
        }
      }, 50);
      return;
    }

    const script = document.createElement('script');
    script.id = '3dmol-script';
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

  return mol3dLoadPromise;
};

export function Molecule3DmolVSEPR({ 
  formula = 'CH4', 
  title,
  height = '500px',
  credits
}: Molecule3DmolVSEPRProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [showLonePairs, setShowLonePairs] = useState(false);
  const [showGeometry, setShowGeometry] = useState(false);

  const config = MOLECULES[formula.toUpperCase()];
  const displayTitle = title || config?.name || formula;

  // Rendre la molécule avec les options actuelles
  const renderMolecule = useCallback(() => {
    if (!viewerRef.current || !config) return;

    const viewer = viewerRef.current;
    viewer.removeAllModels();
    viewer.removeAllShapes();

    // Créer le modèle
    const model = viewer.addModel();
    
    // Ajouter les atomes
    config.atomList.forEach((atom, i) => {
      model.addAtom({
        elem: atom.elem,
        x: atom.x,
        y: atom.y,
        z: atom.z,
        serial: i + 1,
        color: CPK_COLORS[atom.elem] || 0x888888,
        radius: VDW_RADII[atom.elem] || 1.5,
      });
    });

    // Ajouter les liaisons (distance max 1.8 Å)
    const atoms = model.getAtoms();
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const dist = Math.sqrt(
          Math.pow(atoms[i].x - atoms[j].x, 2) +
          Math.pow(atoms[i].y - atoms[j].y, 2) +
          Math.pow(atoms[i].z - atoms[j].z, 2)
        );
        if (dist < 1.8) {
          model.addBond(atoms[i], atoms[j], 1);
        }
      }
    }

    // Style bâtonnets + sphères
    viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.3 } });

    // Ajouter les doublets non liants si activés
    if (showLonePairs && config.lonePairs) {
      config.lonePairs.forEach(lp => {
        viewer.addShape({
          type: 'sphere',
          center: { x: lp.x, y: lp.y, z: lp.z },
          radius: 0.35,
          color: 0x87CEEB,
          alpha: 0.5
        });
      });
    }

    // Ajouter la géométrie de référence si activée
    if (showGeometry && config.hasTetrahedron && config.atomList.length > 2) {
      const central = config.atomList[0];
      const others = config.atomList.slice(1);
      
      // Relier tous les atomes périphériques entre eux
      for (let i = 0; i < others.length; i++) {
        for (let j = i + 1; j < others.length; j++) {
          viewer.addShape({
            type: 'line',
            start: { x: others[i].x, y: others[i].y, z: others[i].z },
            end: { x: others[j].x, y: others[j].y, z: others[j].z },
            color: 0xFFD700,
            dashed: true,
            linewidth: 2
          });
        }
      }
    }

    viewer.zoomTo();
    viewer.render();
  }, [config, showLonePairs, showGeometry]);

  // Initialiser 3Dmol
  useEffect(() => {
    if (!config) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const init = async () => {
      await load3Dmol();
      
      if (!isMounted || !containerRef.current) return;

      const $3Dmol = (window as any).$3Dmol;
      if (!$3Dmol) {
        console.error('3Dmol not loaded');
        setIsLoading(false);
        return;
      }

      try {
        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: 'white',
          defaultcolors: $3Dmol.rasmolElementColors
        });

        if (!viewer) {
          throw new Error('Failed to create viewer');
        }

        viewerRef.current = viewer;
        renderMolecule();
        
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
  }, [formula, config, renderMolecule]);

  // Re-render quand les options changent
  useEffect(() => {
    if (isReady) {
      renderMolecule();
    }
  }, [showLonePairs, showGeometry, isReady, renderMolecule]);

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
        
        <span className="text-xs bg-white/20 px-2 py-1 rounded">
          ∠ {config.angles}
        </span>
      </div>

      {/* Info panel */}
      <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
        <p className="text-sm text-blue-800">{config.description}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        {config.hasLonePairs && (
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
        
        {config.hasTetrahedron && (
          <button
            onClick={() => setShowGeometry(!showGeometry)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              showGeometry 
                ? 'bg-amber-500 text-white shadow-amber-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Triangle className="w-4 h-4" />
            Tétraèdre de référence
          </button>
        )}
        
        <button
          onClick={() => {
            if (viewerRef.current) {
              viewerRef.current.zoomTo();
            }
            setShowLonePairs(false);
            setShowGeometry(false);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 ml-auto"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
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

export default Molecule3DmolVSEPR;
