import { useEffect, useRef, useState } from 'react';

interface Molecule3DmolNativeProps {
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
const generateXYZ = (formula: string, atoms: Atom3D[]): string => {
  const lines = [atoms.length.toString(), formula];
  atoms.forEach(atom => {
    lines.push(`${atom.elem} ${atom.x.toFixed(4)} ${atom.y.toFixed(4)} ${atom.z.toFixed(4)}`);
  });
  return lines.join('\n');
};

export function Molecule3DmolNative({ 
  formula = 'CH4', 
  height = '400px',
  credits
}: Molecule3DmolNativeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const config = MOLECULES[formula.toUpperCase()];
  const elementId = `mol_data_${formula.toLowerCase()}_${Date.now()}`;
  const viewerId = `mol_viewer_${formula.toLowerCase()}_${Date.now()}`;

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
      }

      if (!isMounted) return;

      // Créer l'élément de données XYZ
      const dataElement = document.createElement('div');
      dataElement.id = elementId;
      dataElement.style.display = 'none';
      dataElement.textContent = generateXYZ(formula, config.atomList);
      document.body.appendChild(dataElement);

      // 3Dmol va automatiquement détecter les éléments avec class="viewer_3Dmoljs"
      // et les initialiser
      const $3Dmol = (window as any).$3Dmol;
      if ($3Dmol && $3Dmol.autoinit) {
        $3Dmol.autoinit();
      }

      setIsLoading(false);

      // Cleanup
      return () => {
        const el = document.getElementById(elementId);
        if (el) el.remove();
      };
    };

    init();

    return () => {
      isMounted = false;
      const el = document.getElementById(elementId);
      if (el) el.remove();
    };
  }, [formula, config, elementId]);

  if (!config) {
    return (
      <div 
        className="w-full rounded-lg border border-red-200 bg-red-50 flex items-center justify-center text-red-600 text-sm"
        style={{ height }}
      >
        Molécule "{formula}" non disponible
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden border border-gray-200 bg-white relative"
      style={{ height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Div 3Dmol avec classe viewer_3Dmoljs et data-attributes */}
      <div
        id={viewerId}
        className="viewer_3Dmoljs"
        data-element={elementId}
        data-type="xyz"
        data-style="stick:radius=0.15;sphere:scale=0.25"
        data-backgroundcolor="white"
        style={{ width: '100%', height: '100%', position: 'relative' }}
      />
      
      {credits && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/90 px-2 py-1 rounded">
          {credits}
        </div>
      )}
    </div>
  );
}

export default Molecule3DmolNative;
