import { useEffect, useRef, useState } from 'react';

interface Molecule3DmolEmbedProps {
  formula?: string;
  height?: string;
  credits?: string;
}

interface Atom3D {
  elem: string;
  x: number;
  y: number;
  z: number;
}

interface MoleculeConfig {
  atomList: Atom3D[];
}

const MOLECULES: Record<string, MoleculeConfig> = {
  CH4: {
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.629, y: 0.629, z: 0.629 },
      { elem: 'H', x: -0.629, y: -0.629, z: 0.629 },
      { elem: 'H', x: -0.629, y: 0.629, z: -0.629 },
      { elem: 'H', x: 0.629, y: -0.629, z: -0.629 },
    ]
  },
  NH3: {
    atomList: [
      { elem: 'N', x: 0.0, y: 0.0, z: 0.1 },
      { elem: 'H', x: 0.0, y: 0.94, z: -0.33 },
      { elem: 'H', x: -0.814, y: -0.47, z: -0.33 },
      { elem: 'H', x: 0.814, y: -0.47, z: -0.33 },
    ]
  },
  H2O: {
    atomList: [
      { elem: 'O', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.757, y: 0.586, z: 0.0 },
      { elem: 'H', x: -0.757, y: 0.586, z: 0.0 },
    ]
  },
  BF3: {
    atomList: [
      { elem: 'B', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 1.3, y: 0.0, z: 0.0 },
      { elem: 'F', x: -0.65, y: 1.126, z: 0.0 },
      { elem: 'F', x: -0.65, y: -1.126, z: 0.0 },
    ]
  },
  CO2: {
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.16, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.16, y: 0.0, z: 0.0 },
    ]
  },
  SO2: {
    atomList: [
      { elem: 'S', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.4, y: 0.5, z: 0.0 },
      { elem: 'O', x: -1.4, y: 0.5, z: 0.0 },
    ]
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

export function Molecule3DmolEmbed({ 
  formula = 'CH4', 
  height = '400px',
  credits
}: Molecule3DmolEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const config = MOLECULES[formula.toUpperCase()];

  useEffect(() => {
    if (!config) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

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
        setIsLoading(false);
        return;
      }

      try {
        // Créer le viewer
        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: 'white'
        });

        if (!viewer) {
          setIsLoading(false);
          return;
        }

        // Charger la molécule
        const xyz = generateXYZ(config.atomList);
        viewer.addModel(xyz, 'xyz');
        viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.25 } });
        viewer.zoomTo();
        viewer.render();

        setIsLoading(false);
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

  if (!config) {
    return (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-red-50 text-red-600 text-sm">
        Molécule "{formula}" non disponible
      </div>
    );
  }

  return (
    <div 
      className="w-full relative"
      style={{ height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <div ref={containerRef} className="w-full h-full" />
      
      {credits && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/90 px-2 py-1 rounded">
          {credits}
        </div>
      )}
    </div>
  );
}

export default Molecule3DmolEmbed;
