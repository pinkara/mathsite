import { useEffect, useRef, useState } from 'react';
import { Atom, Eye, EyeOff, Triangle, RotateCcw, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface MoleculeVSEPR3DProps {
  formula?: string;
  title?: string;
  height?: string;
  credits?: string;
}

interface MoleculeConfig {
  name: string;
  notation: string;
  geometry: string;
  angles: string;
  description: string;
  pdbData: string;
  hasLonePairs: boolean;
  hasTetrahedron: boolean;
  atomColors: Record<string, string>;
}

// Données PDB pour chaque molécule VSEPR
const MOLECULES: Record<string, MoleculeConfig> = {
  CH4: {
    name: "Méthane",
    notation: "AX₄",
    geometry: "Tétraédrique régulière",
    angles: "109,5°",
    description: "4 liaisons identiques, géométrie parfaite sans contrainte électronique.",
    hasLonePairs: false,
    hasTetrahedron: true,
    atomColors: { C: '#333333', H: '#FFFFFF' },
    pdbData: `COMPND    METHANE
HETATM    1  C   MOL A   1       0.000   0.000   0.000  1.00  0.00           C
HETATM    2  H   MOL A   1       0.629   0.629   0.629  1.00  0.00           H
HETATM    3  H   MOL A   1      -0.629  -0.629   0.629  1.00  0.00           H
HETATM    4  H   MOL A   1      -0.629   0.629  -0.629  1.00  0.00           H
HETATM    5  H   MOL A   1       0.629  -0.629  -0.629  1.00  0.00           H
CONECT    1    2    3    4    5
END`
  },
  NH3: {
    name: "Ammoniac",
    notation: "AX₃E",
    geometry: "Pyramide trigone",
    angles: "107° (compression)",
    description: "Le doublet non liant repousse les liaisons N-H, réduisant l'angle.",
    hasLonePairs: true,
    hasTetrahedron: true,
    atomColors: { N: '#3050F8', H: '#FFFFFF' },
    pdbData: `COMPND    AMMONIA
HETATM    1  N   MOL A   1       0.000   0.000   0.100  1.00  0.00           N
HETATM    2  H   MOL A   1       0.000   0.940  -0.330  1.00  0.00           H
HETATM    3  H   MOL A   1      -0.814  -0.470  -0.330  1.00  0.00           H
HETATM    4  H   MOL A   1       0.814  -0.470  -0.330  1.00  0.00           H
CONECT    1    2    3    4
END`
  },
  H2O: {
    name: "Eau",
    notation: "AX₂E₂",
    geometry: "Coudée (angulaire)",
    angles: "104,5° (forte compression)",
    description: "Deux doublets non liants créent une forte répulsion, angle minimal.",
    hasLonePairs: true,
    hasTetrahedron: true,
    atomColors: { O: '#FF0D0D', H: '#FFFFFF' },
    pdbData: `COMPND    WATER
HETATM    1  O   MOL A   1       0.000   0.000   0.000  1.00  0.00           O
HETATM    2  H   MOL A   1       0.757   0.586   0.000  1.00  0.00           H
HETATM    3  H   MOL A   1      -0.757   0.586   0.000  1.00  0.00           H
CONECT    1    2    3
END`
  },
  BF3: {
    name: "Trifluorure de bore",
    notation: "AX₃",
    geometry: "Triangle plan",
    angles: "120°",
    description: "3 liaisons dans un plan, pas de doublet non liant sur le bore.",
    hasLonePairs: false,
    hasTetrahedron: false,
    atomColors: { B: '#FFB5B5', F: '#90E050' },
    pdbData: `COMPND    BORON_TRIFLUORIDE
HETATM    1  B   MOL A   1       0.000   0.000   0.000  1.00  0.00           B
HETATM    2  F   MOL A   1       1.300   0.000   0.000  1.00  0.00           F
HETATM    3  F   MOL A   1      -0.650   1.126   0.000  1.00  0.00           F
HETATM    4  F   MOL A   1      -0.650  -1.126   0.000  1.00  0.00           F
CONECT    1    2    3    4
END`
  },
  CO2: {
    name: "Dioxyde de carbone",
    notation: "AX₂",
    geometry: "Linéaire",
    angles: "180°",
    description: "2 doubles liaisons, géométrie linéaire parfaite.",
    hasLonePairs: false,
    hasTetrahedron: false,
    atomColors: { C: '#909090', O: '#FF0D0D' },
    pdbData: `COMPND    CARBON_DIOXIDE
HETATM    1  C   MOL A   1       0.000   0.000   0.000  1.00  0.00           C
HETATM    2  O   MOL A   1       1.160   0.000   0.000  1.00  0.00           O
HETATM    3  O   MOL A   1      -1.160   0.000   0.000  1.00  0.00           O
CONECT    1    2    3
END`
  }
};

// Positions des doublets non liants pour chaque molécule
const LONE_PAIR_SHAPES: Record<string, Array<{ center: [number, number, number]; radius: number }>> = {
  NH3: [{ center: [0, 0, 0.9], radius: 0.4 }],
  H2O: [
    { center: [-0.4, -0.4, -0.4], radius: 0.38 },
    { center: [0.4, -0.4, -0.4], radius: 0.38 }
  ]
};

export function MoleculeVSEPR3D({ 
  formula = 'CH4', 
  title,
  height = '550px',
  credits
}: MoleculeVSEPR3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLonePairs, setShowLonePairs] = useState(true);
  const [showTetrahedron, setShowTetrahedron] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const config = MOLECULES[formula.toUpperCase()];
  const displayTitle = title || config?.name || `Molécule ${formula}`;

  useEffect(() => {
    if (!config) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const load3Dmol = async () => {
      try {
        // Charger 3Dmol depuis CDN
        const script = document.createElement('script');
        script.src = 'https://3Dmol.csb.pitt.edu/build/3Dmol-min.js';
        script.async = true;
        
        script.onload = () => {
          if (!isMounted || !containerRef.current) return;
          
          const $3Dmol = (window as any).$3Dmol;
          if (!$3Dmol) {
            console.error('3Dmol not loaded');
            setIsLoading(false);
            return;
          }

          // Créer le viewer
          const viewer = $3Dmol.createViewer(containerRef.current, {
            backgroundColor: 'white'
          });

          viewerRef.current = viewer;
          renderScene(viewer, config, showLonePairs, showTetrahedron);
          setIsLoading(false);
        };

        script.onerror = () => {
          console.error('Failed to load 3Dmol');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error:', err);
        setIsLoading(false);
      }
    };

    load3Dmol();

    return () => {
      isMounted = false;
    };
  }, [formula]);

  // Mettre à jour la scène quand les options changent
  useEffect(() => {
    if (viewerRef.current && config) {
      renderScene(viewerRef.current, config, showLonePairs, showTetrahedron);
    }
  }, [showLonePairs, showTetrahedron, config]);

  const renderScene = (viewer: any, cfg: MoleculeConfig, showLP: boolean, showTet: boolean) => {
    viewer.removeAllModels();
    viewer.removeAllLabels();
    
    // Charger la molécule depuis PDB
    viewer.addModel(cfg.pdbData, 'pdb');
    
    // Style par défaut - Ball and Stick
    viewer.setStyle({}, {
      stick: { radius: 0.15 },
      sphere: { scale: 0.35 }
    });
    
    // Couleurs personnalisées
    Object.entries(cfg.atomColors).forEach(([elem, color]) => {
      viewer.setStyle({ elem: elem }, {
        stick: { radius: 0.15, color: color },
        sphere: { scale: 0.35, color: color }
      });
    });

    // Ajouter les doublets non liants
    if (showLP && cfg.hasLonePairs && LONE_PAIR_SHAPES[formula.toUpperCase()]) {
      const shapes = LONE_PAIR_SHAPES[formula.toUpperCase()];
      shapes.forEach((shape) => {
        viewer.addSphere({
          center: { x: shape.center[0] * 50, y: shape.center[1] * 50, z: shape.center[2] * 50 },
          radius: shape.radius * 20,
          color: '#87CEEB',
          opacity: 0.6,
          clickable: false
        });
      });
    }

    // Ajouter le tétraèdre de référence
    if (showTet && cfg.hasTetrahedron) {
      const vertices = [
        [0.8, 0.8, 0.8],
        [-0.8, -0.8, 0.8],
        [-0.8, 0.8, -0.8],
        [0.8, -0.8, -0.8]
      ];
      const scale = 50;
      
      // Arêtes du tétraèdre
      const edges = [[0,1], [0,2], [0,3], [1,2], [1,3], [2,3]];
      edges.forEach(([i, j]) => {
        viewer.addLine({
          start: { x: vertices[i][0] * scale, y: vertices[i][1] * scale, z: vertices[i][2] * scale },
          end: { x: vertices[j][0] * scale, y: vertices[j][1] * scale, z: vertices[j][2] * scale },
          color: '#FCD34D',
          dashed: true,
          linewidth: 2,
          opacity: 0.5
        });
      });
    }

    viewer.zoomTo();
    viewer.render();
  };

  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo();
    }
  };

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
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Atom className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-xl">{displayTitle}</h3>
            <p className="text-sm text-white/90">
              VSEPR <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{config.notation}</span>
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Info
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 px-6 py-3 bg-gray-50 border-b border-gray-200">
        {config.hasLonePairs && (
          <button
            onClick={() => setShowLonePairs(!showLonePairs)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              showLonePairs 
                ? 'bg-sky-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {showLonePairs ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Doublets non liants
          </button>
        )}
        
        {config.hasTetrahedron && (
          <button
            onClick={() => setShowTetrahedron(!showTetrahedron)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              showTetrahedron 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            <Triangle className="w-4 h-4" />
            Tétraèdre
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold ml-auto hover:bg-gray-50"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Viewer 3D */}
      <div className="relative bg-white" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-gray-600">Chargement 3D...</span>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" style={{ minHeight: '400px', position: 'relative' }} />
        
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border text-sm text-gray-700">
          🖱️ Glisser = Rotation | Molette = Zoom
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="px-6 py-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-t border-gray-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" />
                Théorie VSEPR
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Notation:</span>
                  <span className="font-mono font-bold text-lg text-indigo-700 bg-indigo-50 px-3 py-1 rounded">
                    {config.notation}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Géométrie:</span>
                  <span className="font-semibold text-gray-800">{config.geometry}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Angle(s):</span>
                  <span className="font-semibold text-amber-600">{config.angles}</span>
                </div>
                <div className="py-2">
                  <span className="text-gray-600">Description:</span>
                  <p className="text-gray-700 mt-1 text-sm">{config.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Légende</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(config.atomColors).map(([elem, color]) => (
                    <div key={elem} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: color, borderColor: color === '#FFFFFF' ? '#ccc' : color }} />
                      <span className="text-sm text-gray-700">{elem}</span>
                    </div>
                  ))}
                  {config.hasLonePairs && (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-sky-300 border-2 border-sky-400 opacity-70" />
                      <span className="text-sm text-gray-700">Doublet (E)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-indigo-100 rounded-xl p-4">
                <h4 className="text-sm font-bold text-indigo-900 mb-2">💡 Notation VSEPR</h4>
                <div className="space-y-1 text-sm text-indigo-800">
                  <p><strong>A</strong> = Atome central</p>
                  <p><strong>X</strong> = Pairs liantes (liaisons)</p>
                  <p><strong>E</strong> = Pairs non liants (doublets)</p>
                </div>
              </div>
            </div>
          </div>

          {credits && <p className="text-xs text-gray-500 italic text-center mt-4">{credits}</p>}
        </div>
      )}
    </div>
  );
}

export default MoleculeVSEPR3D;
