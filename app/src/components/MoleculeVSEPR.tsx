import { useState } from 'react';
import { Atom, Eye, EyeOff, Triangle, Info, ExternalLink } from 'lucide-react';

interface MoleculeVSEPRProps {
  formula?: string;
  title?: string;
  height?: string;
  credits?: string;
}

// URLs des visualiseurs externes
type VSEPRType = 'AX4' | 'AX3E' | 'AX2E2' | 'AX3' | 'AX2' | 'AX2E';

interface MoleculeConfig {
  name: string;
  vsepr: VSEPRType;
  geometry: string;
  angles: string;
  description: string;
  vchem3dUrl: string;
  phetUrl: string;
  hasLonePairs: boolean;
  hasTetrahedron: boolean;
  atoms: string;
  color: string;
}

const MOLECULES: Record<string, MoleculeConfig> = {
  CH4: {
    name: "Méthane",
    vsepr: "AX4",
    geometry: "Tétraédrique",
    angles: "109,5°",
    description: "4 liaisons, 0 doublet non liant. Structure de référence pour le tétraèdre.",
    hasLonePairs: false,
    hasTetrahedron: true,
    atoms: "C + 4H",
    color: "#6B7280",
    vchem3dUrl: 'https://vchem3d.univ-tlse3.fr/vM_AX4.html',
    phetUrl: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html?locale=fr'
  },
  NH3: {
    name: "Ammoniac",
    vsepr: "AX3E",
    geometry: "Pyramide trigone",
    angles: "107° (< 109,5°)",
    description: "3 liaisons + 1 doublet non liant. Le doublet repousse plus fort que les liaisons.",
    hasLonePairs: true,
    hasTetrahedron: true,
    atoms: "N + 3H",
    color: "#2563EB",
    vchem3dUrl: 'https://vchem3d.univ-tlse3.fr/vM_AX3E.html',
    phetUrl: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html?locale=fr'
  },
  H2O: {
    name: "Eau",
    vsepr: "AX2E2",
    geometry: "Coudée (angulaire)",
    angles: "104,5°",
    description: "2 liaisons + 2 doublets non liants. Forte répulsion entre les doublets.",
    hasLonePairs: true,
    hasTetrahedron: true,
    atoms: "O + 2H",
    color: "#DC2626",
    vchem3dUrl: 'https://vchem3d.univ-tlse3.fr/vM_AX2E2.html',
    phetUrl: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html?locale=fr'
  },
  BF3: {
    name: "Trifluorure de bore",
    vsepr: "AX3",
    geometry: "Triangle plan",
    angles: "120°",
    description: "3 liaisons, 0 doublet non liant sur le bore. Géométrie plane.",
    hasLonePairs: false,
    hasTetrahedron: false,
    atoms: "B + 3F",
    color: "#F59E0B",
    vchem3dUrl: 'https://vchem3d.univ-tlse3.fr/vM_AX3.html',
    phetUrl: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html?locale=fr'
  },
  CO2: {
    name: "Dioxyde de carbone",
    vsepr: "AX2",
    geometry: "Linéaire",
    angles: "180°",
    description: "2 doubles liaisons. Géométrie linéaire sans doublet sur le carbone.",
    hasLonePairs: false,
    hasTetrahedron: false,
    atoms: "C + 2O",
    color: "#374151",
    vchem3dUrl: 'https://vchem3d.univ-tlse3.fr/vM_AX2.html',
    phetUrl: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html?locale=fr'
  },
  SO2: {
    name: "Dioxyde de soufre",
    vsepr: "AX2E",
    geometry: "Coudée",
    angles: "119°",
    description: "2 doubles liaisons + 1 doublet non liant sur le soufre.",
    hasLonePairs: true,
    hasTetrahedron: true,
    atoms: "S + 2O",
    color: "#FCD34D",
    vchem3dUrl: 'https://vchem3d.univ-tlse3.fr/vM_AX2E.html',
    phetUrl: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html?locale=fr'
  }
};

export function MoleculeVSEPR({ 
  formula = 'CH4', 
  title,
  height = '600px',
  credits
}: MoleculeVSEPRProps) {
  const [showTetrahedron, setShowTetrahedron] = useState(false);
  const [showLonePairs, setShowLonePairs] = useState(true);
  const [activeSource, setActiveSource] = useState<'vchem3d' | 'phet'>('vchem3d');
  
  const config = MOLECULES[formula.toUpperCase()];
  const displayTitle = title || config?.name || `Molécule ${formula}`;

  const getIframeUrl = (): string => {
    if (!config) return '';
    return activeSource === 'vchem3d' ? config.vchem3dUrl : config.phetUrl;
  };

  if (!config) {
    return (
      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Molécule "{formula}" non disponible.</p>
        <p className="text-sm text-gray-600 mt-2">
          Disponibles : {Object.keys(MOLECULES).join(', ')}
        </p>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Atom className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-xl">{displayTitle}</h3>
            <p className="text-sm text-white/90">
              VSEPR {config.vsepr} — {config.geometry}
            </p>
          </div>
        </div>
        
        {/* Source selector */}
        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveSource('vchem3d')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeSource === 'vchem3d' 
                ? 'bg-white text-indigo-600 shadow-md' 
                : 'text-white hover:bg-white/20'
            }`}
          >
            VChem3D
          </button>
          <button
            onClick={() => setActiveSource('phet')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeSource === 'phet' 
                ? 'bg-white text-indigo-600 shadow-md' 
                : 'text-white hover:bg-white/20'
            }`}
          >
            PhET
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200">
        {config.hasLonePairs && (
          <button
            onClick={() => setShowLonePairs(!showLonePairs)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              showLonePairs 
                ? 'bg-sky-500 text-white shadow-sky-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showLonePairs ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Doublets non liants
          </button>
        )}
        
        {config.hasTetrahedron && (
          <button
            onClick={() => setShowTetrahedron(!showTetrahedron)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              showTetrahedron 
                ? 'bg-amber-500 text-white shadow-amber-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Triangle className="w-4 h-4" />
            Tétraèdre
          </button>
        )}
        
        <a
          href={config.vchem3dUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all ml-auto"
        >
          <ExternalLink className="w-4 h-4" />
          Ouvrir dans un nouvel onglet
        </a>
      </div>

      {/* Viewer */}
      <div className="relative bg-gray-100" style={{ height }}>
        <iframe
          src={getIframeUrl()}
          className="w-full h-full border-0"
          title={`VSEPR ${formula}`}
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
        
        {/* Overlay instructions */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200 text-sm text-gray-700">
          💡 Cliquez et glissez pour tourner • Molette pour zoomer
        </div>
      </div>

      {/* Info Panel VSEPR */}
      <div className="px-6 py-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-t border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info VSEPR */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" />
              Théorie VSEPR
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Notation:</span>
                <span className="font-mono font-bold text-lg text-indigo-700 bg-indigo-50 px-3 py-1 rounded">
                  {config.vsepr}
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
                <span className="text-gray-600 block mb-1">Composition:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{config.atoms}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h4 className="text-base font-bold text-gray-800 mb-4">Description</h4>
            <p className="text-gray-700 leading-relaxed mb-4">{config.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: config.color, border: '2px solid rgba(0,0,0,0.1)' }}></div>
                <span className="text-xs font-medium text-gray-600">Atome central</span>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 mx-auto mb-2"></div>
                <span className="text-xs font-medium text-gray-600">Hydrogène</span>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-red-600 mx-auto mb-2"></div>
                <span className="text-xs font-medium text-gray-600">Oxygène</span>
              </div>
              <div className="text-center p-3 bg-sky-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-sky-300 border-2 border-sky-400 mx-auto mb-2 opacity-70"></div>
                <span className="text-xs font-medium text-gray-600">Doublet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Explication VSEPR */}
        <div className="mt-5 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h4 className="text-sm font-bold text-gray-800 mb-3">💡 Comment interpréter la notation VSEPR ?</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-indigo-700">A</span> = Atome central
              <p className="text-gray-600 text-xs mt-1">L'atome autour duquel s'organisent les autres</p>
            </div>
            <div>
              <span className="font-semibold text-emerald-700">X</span> = Liaisons (pairs liantes)
              <p className="text-gray-600 text-xs mt-1">Nombre d'atomes liés à l'atome central</p>
            </div>
            <div>
              <span className="font-semibold text-sky-700">E</span> = Doublets non liants
              <p className="text-gray-600 text-xs mt-1">Paires d'électrons libres qui repoussent fortement</p>
            </div>
          </div>
        </div>

        {credits && (
          <p className="text-xs text-gray-500 italic text-center mt-4">{credits}</p>
        )}
      </div>
    </div>
  );
}

export default MoleculeVSEPR;
