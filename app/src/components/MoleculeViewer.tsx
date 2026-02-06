import { useEffect, useRef, useState } from 'react';
import { Atom, Eye, EyeOff, RotateCcw, ZoomIn, ZoomOut, Info } from 'lucide-react';

interface MoleculeViewerProps {
  formula?: string;  // Formule chimique (ex: NH3, H2O, CH4)
  pdbData?: string;  // Données PDB personnalisées
  title?: string;
  height?: string;
  credits?: string;
}

// Données PDB pour différentes molécules - Format correct avec positions VSEPR
const MOLECULE_DATA: Record<string, string> = {
  // Ammoniac NH3 - Pyramide trigone (107°)
  NH3: `COMPND    AMMONIA
HETATM    1  N   UNK A   1       0.000   0.000   0.100  1.00  0.00           N
HETATM    2  H   UNK A   1       0.000   0.940  -0.330  1.00  0.00           H
HETATM    3  H   UNK A   1      -0.814  -0.470  -0.330  1.00  0.00           H
HETATM    4  H   UNK A   1       0.814  -0.470  -0.330  1.00  0.00           H
CONECT    1    2    3    4
CONECT    2    1
CONECT    3    1
CONECT    4    1
END`,

  // Eau H2O - Coudée (104.5°)
  H2O: `COMPND    WATER
HETATM    1  O   UNK A   1       0.000   0.000   0.000  1.00  0.00           O
HETATM    2  H   UNK A   1       0.757   0.586   0.000  1.00  0.00           H
HETATM    3  H   UNK A   1      -0.757   0.586   0.000  1.00  0.00           H
CONECT    1    2    3
CONECT    2    1
CONECT    3    1
END`,

  // Méthane CH4 - Tétraédrique (109.5°)
  CH4: `COMPND    METHANE
HETATM    1  C   UNK A   1       0.000   0.000   0.000  1.00  0.00           C
HETATM    2  H   UNK A   1       0.630   0.630   0.630  1.00  0.00           H
HETATM    3  H   UNK A   1      -0.630  -0.630   0.630  1.00  0.00           H
HETATM    4  H   UNK A   1      -0.630   0.630  -0.630  1.00  0.00           H
HETATM    5  H   UNK A   1       0.630  -0.630  -0.630  1.00  0.00           H
CONECT    1    2    3    4    5
CONECT    2    1
CONECT    3    1
CONECT    4    1
CONECT    5    1
END`,

  // Dioxyde de carbone CO2 - Linéaire (180°)
  CO2: `COMPND    CARBON DIOXIDE
HETATM    1  C   UNK A   1       0.000   0.000   0.000  1.00  0.00           C
HETATM    2  O   UNK A   1       1.160   0.000   0.000  1.00  0.00           O
HETATM    3  O   UNK A   1      -1.160   0.000   0.000  1.00  0.00           O
CONECT    1    2    3
CONECT    2    1
CONECT    3    1
END`,

  // Méthanol CH3OH
  CH3OH: `COMPND    METHANOL
HETATM    1  C   UNK A   1      -0.748   0.031   0.000  1.00  0.00           C
HETATM    2  O   UNK A   1       0.558  -0.496   0.000  1.00  0.00           O
HETATM    3  H   UNK A   1      -1.108   0.551   0.890  1.00  0.00           H
HETATM    4  H   UNK A   1      -1.108   0.551  -0.890  1.00  0.00           H
HETATM    5  H   UNK A   1      -1.108  -0.949   0.000  1.00  0.00           H
HETATM    6  H   UNK A   1       0.558  -1.466   0.000  1.00  0.00           H
CONECT    1    2    3    4    5
CONECT    2    1    6
CONECT    3    1
CONECT    4    1
CONECT    5    1
CONECT    6    2
END`,
};

// Informations sur les molécules
const MOLECULE_INFO: Record<string, { name: string; description: string; geometry: string; atoms: string; bonds: string; lonePairs: string }> = {
  NH3: {
    name: "Ammoniac",
    description: "Structure pyramidale due à la répulsion du doublet non liant",
    geometry: "Pyramide trigone (AX3E1)",
    atoms: "1 Azote (bleu), 3 Hydrogènes (blanc)",
    bonds: "3 liaisons N-H",
    lonePairs: "1 doublet non liant sur N"
  },
  H2O: {
    name: "Eau",
    description: "Structure coudée due à la répulsion des deux doublets non liants",
    geometry: "Coudée (AX2E2)",
    atoms: "1 Oxygène (rouge), 2 Hydrogènes (blanc)",
    bonds: "2 liaisons O-H",
    lonePairs: "2 doublets non liants sur O"
  },
  CH4: {
    name: "Méthane",
    description: "Structure tétraédrique régulière sans doublet non liant",
    geometry: "Tétraédrique (AX4)",
    atoms: "1 Carbone (gris), 4 Hydrogènes (blanc)",
    bonds: "4 liaisons C-H",
    lonePairs: "Aucun"
  },
  CO2: {
    name: "Dioxyde de carbone",
    description: "Structure linéaire, gaz à effet de serre",
    geometry: "Linéaire (AX2)",
    atoms: "1 Carbone (gris), 2 Oxygènes (rouge)",
    bonds: "2 doubles liaisons C=O",
    lonePairs: "Doublets sur O"
  },
  CH3OH: {
    name: "Méthanol",
    description: "Alcool simple avec groupement hydroxyle",
    geometry: "Tétraédrique autour de C et de O",
    atoms: "1 Carbone (gris), 4 Hydrogènes (blanc), 1 Oxygène (rouge)",
    bonds: "3 liaisons C-H, 1 liaison C-O, 1 liaison O-H",
    lonePairs: "2 doublets non liants sur O"
  }
};

// Données VSEPR pour les doublets non liants (forme de lobes)
// Chaque lobe est défini par : position (centre), direction (vers où il pointe)
const VSEPR_LONE_PAIRS: Record<string, Array<{ 
  center: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}>> = {
  NH3: [
    {
      // Doublet au-dessus de l'azote (pyramide)
      center: { x: 0, y: 0, z: 0.85 },
      direction: { x: 0, y: 0, z: 1 },
      scale: { x: 1.2, y: 1.2, z: 2.0 }
    }
  ],
  H2O: [
    {
      // Premier doublet
      center: { x: -0.5, y: -0.4, z: -0.4 },
      direction: { x: -1, y: -0.8, z: -0.8 },
      scale: { x: 1.0, y: 1.0, z: 2.2 }
    },
    {
      // Deuxième doublet
      center: { x: 0.5, y: -0.4, z: -0.4 },
      direction: { x: 1, y: -0.8, z: -0.8 },
      scale: { x: 1.0, y: 1.0, z: 2.2 }
    }
  ],
  CH3OH: [
    {
      // Doublet 1 sur O
      center: { x: 0.9, y: -0.2, z: 0.5 },
      direction: { x: 1.2, y: -0.3, z: 0.8 },
      scale: { x: 0.9, y: 0.9, z: 2.0 }
    },
    {
      // Doublet 2 sur O
      center: { x: 0.9, y: -0.2, z: -0.5 },
      direction: { x: 1.2, y: -0.3, z: -0.8 },
      scale: { x: 0.9, y: 0.9, z: 2.0 }
    }
  ]
};

export function MoleculeViewer({ 
  formula = 'NH3', 
  pdbData, 
  title,
  height = '450px',
  credits
}: MoleculeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLonePairs, setShowLonePairs] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const $3Dmol = useRef<any>(null);

  const molInfo = MOLECULE_INFO[formula.toUpperCase()];
  const displayTitle = title || molInfo?.name || `Molécule ${formula}`;

  useEffect(() => {
    let isMounted = true;

    const initViewer = async () => {
      try {
        const module = await import('3dmol');
        if (!isMounted) return;
        
        $3Dmol.current = module.default || module;
        
        if (containerRef.current && $3Dmol.current) {
          const config = { 
            backgroundColor: 'white',
            antialias: true
          };
          viewerRef.current = $3Dmol.current.createViewer(
            containerRef.current,
            config
          );

          const data = pdbData || MOLECULE_DATA[formula.toUpperCase()];
          
          if (!data) {
            setError(`Molécule ${formula} non disponible`);
            setIsLoading(false);
            return;
          }

          loadMolecule(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading 3Dmol:', err);
        if (isMounted) {
          setError('Erreur de chargement du visualiseur 3D');
          setIsLoading(false);
        }
      }
    };

    initViewer();

    return () => {
      isMounted = false;
      if (viewerRef.current) {
        viewerRef.current.removeAllModels();
        viewerRef.current = null;
      }
    };
  }, [formula, pdbData]);

  // Charger la molécule avec les styles
  const loadMolecule = (data: string) => {
    if (!viewerRef.current) return;

    viewerRef.current.removeAllModels();
    viewerRef.current.removeAllShapes();
    
    // Ajouter le modèle
    viewerRef.current.addModel(data, 'pdb');
    
    // Style VSEPR - Spheres plus grandes pour effet "space-filling"
    viewerRef.current.setStyle({}, { 
      sphere: { 
        radius: 0.45,
        colorscheme: 'default',
        opacity: 0.95
      },
      stick: { 
        radius: 0.20,
        colorscheme: 'default'
      }
    });

    // Ajouter les doublets non liants si activés
    if (showLonePairs) {
      addVseprLonePairs();
    }

    // Ajouter les labels si activés
    if (showLabels) {
      viewerRef.current.addResLabels({
        fontSize: 14,
        fontColor: 'black',
        showBackground: false
      });
    }

    viewerRef.current.zoomTo();
    viewerRef.current.render();
  };

  // Ajouter les doublets non liants en forme de lobes VSEPR
  const addVseprLonePairs = () => {
    if (!viewerRef.current) return;

    const molName = formula.toUpperCase();
    const lonePairs = VSEPR_LONE_PAIRS[molName];
    
    if (!lonePairs) return;

    lonePairs.forEach((lp) => {
      // Créer un ellipsoïde pour représenter le doublet (forme de lobe)
      viewerRef.current.addShape({
        type: 'sphere',
        center: lp.center,
        radius: 0.35,
        color: 'lightblue',
        opacity: 0.6,
        scale: lp.scale
      });
    });
  };

  const handleToggleLonePairs = () => {
    const newValue = !showLonePairs;
    setShowLonePairs(newValue);
    
    const data = pdbData || MOLECULE_DATA[formula.toUpperCase()];
    if (data) {
      loadMolecule(data);
    }
  };

  const handleZoomIn = () => {
    if (viewerRef.current) {
      viewerRef.current.zoom(1.2);
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current) {
      viewerRef.current.zoom(0.8);
    }
  };

  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo();
    }
  };

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <Info className="w-5 h-5" />
          <span className="font-medium">Erreur</span>
        </div>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Atom className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800">{displayTitle}</span>
            <span className="text-xs text-gray-500 ml-2">({formula})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors" title="Zoom arrière">
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors" title="Zoom avant">
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={handleReset} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors" title="Réinitialiser">
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="relative" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">Chargement VSEPR...</span>
            </div>
          </div>
        )}
        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ height, minHeight: '350px' }}
        />
      </div>

      {/* Controls */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handleToggleLonePairs}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              showLonePairs 
                ? 'bg-sky-200 text-sky-800 hover:bg-sky-300' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {showLonePairs ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Doublets non liants (VSEPR)
          </button>
          
          <button
            onClick={() => {
              setShowLabels(!showLabels);
              const data = pdbData || MOLECULE_DATA[formula.toUpperCase()];
              if (data) loadMolecule(data);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              showLabels 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Étiquettes
          </button>
        </div>

        {/* Info panel VSEPR */}
        {molInfo && (
          <div className="bg-white rounded-md p-3 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-1">{molInfo.name}</h4>
            <p className="text-xs text-gray-600 mb-2">{molInfo.description}</p>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div><span className="font-medium text-gray-700">Géométrie VSEPR:</span> <span className="text-gray-600">{molInfo.geometry}</span></div>
              <div><span className="font-medium text-gray-700">Atomes:</span> <span className="text-gray-600">{molInfo.atoms}</span></div>
              <div><span className="font-medium text-gray-700">Liaisons:</span> <span className="text-gray-600">{molInfo.bonds}</span></div>
              <div><span className="font-medium text-gray-700">Doublets:</span> <span className="text-gray-600">{molInfo.lonePairs}</span></div>
            </div>
          </div>
        )}

        {/* Légende VSEPR */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-gray-500 border border-gray-600"></div>
            <span className="text-gray-600">Carbone</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-white border border-gray-400"></div>
            <span className="text-gray-600">Hydrogène</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-blue-600 border border-blue-700"></div>
            <span className="text-gray-600">Azote</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-red-600 border border-red-700"></div>
            <span className="text-gray-600">Oxygène</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-sky-300 border border-sky-400 opacity-70"></div>
            <span className="text-gray-600">Doublet non liant</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2 italic">
          💡 <strong>Théorie VSEPR</strong> : Les doublets non liants (bleus clair) repoussent les liaisons et modifient la géométrie. 
          Glissez pour tourner, molette pour zoomer.
        </p>
      </div>

      {credits && (
        <div className="px-3 py-1.5 bg-gray-100 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic">{credits}</p>
        </div>
      )}
    </div>
  );
}

export default MoleculeViewer;
