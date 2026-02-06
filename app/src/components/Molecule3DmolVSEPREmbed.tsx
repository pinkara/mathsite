import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Type } from 'lucide-react';

type DisplayMode = 'spacefill' | 'ballstick' | 'ball' | 'stick' | 'lines' | 'off';
type LabelSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'off';

interface Molecule3DmolVSEPREmbedProps {
  formula?: string;
  height?: string;
  credits?: string;
  controls?: boolean;
}

interface Atom3D {
  elem: string;
  x: number;
  y: number;
  z: number;
}

interface MoleculeConfig {
  name: string;
  atomList: Atom3D[];
  hasLonePairs: boolean;
  hasTetrahedron: boolean;
  lonePairs?: { x: number; y: number; z: number }[];
}

const MOLECULES: Record<string, MoleculeConfig> = {
  // Molécules simples (10)
  CH4: {
    name: "Méthane",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.629, y: 0.629, z: 0.629 },
      { elem: 'H', x: -0.629, y: -0.629, z: 0.629 },
      { elem: 'H', x: -0.629, y: 0.629, z: -0.629 },
      { elem: 'H', x: 0.629, y: -0.629, z: -0.629 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  NH3: {
    name: "Ammoniac",
    atomList: [
      { elem: 'N', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.0, y: 1.0, z: -0.35 },
      { elem: 'H', x: -0.87, y: -0.5, z: -0.35 },
      { elem: 'H', x: 0.87, y: -0.5, z: -0.35 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: 0, z: 1.0 }]
  },
  H2O: {
    name: "Eau",
    atomList: [
      { elem: 'O', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.757, y: 0.586, z: 0.0 },
      { elem: 'H', x: -0.757, y: 0.586, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 0.4, y: -0.5, z: 0.6 },
      { x: -0.4, y: -0.5, z: 0.6 }
    ]
  },
  BF3: {
    name: "Trifluorure de bore",
    atomList: [
      { elem: 'B', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 1.3, y: 0.0, z: 0.0 },
      { elem: 'F', x: -0.65, y: 1.126, z: 0.0 },
      { elem: 'F', x: -0.65, y: -1.126, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  BCL3: {
    name: "Trichlorure de bore",
    atomList: [
      { elem: 'B', x: 0, y: 0, z: 0 },
      { elem: 'Cl', x: 1.74, y: 0, z: 0 },
      { elem: 'Cl', x: -0.87, y: 1.5, z: 0 },
      { elem: 'Cl', x: -0.87, y: -1.5, z: 0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  CO2: {
    name: "Dioxyde de carbone",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.16, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.16, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  SO2: {
    name: "Dioxyde de soufre",
    atomList: [
      { elem: 'S', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.4, y: 0.5, z: 0.0 },
      { elem: 'O', x: -1.4, y: 0.5, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: -1.0, z: 0 }]
  },
  CH2O: {
    name: "Formaldéhyde",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.22, y: 0.0, z: 0.0 },
      { elem: 'H', x: -0.65, y: 0.93, z: 0.0 },
      { elem: 'H', x: -0.65, y: -0.93, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  C2H6: {
    name: "Éthane",
    atomList: [
      { elem: 'C', x: -0.75, y: 0.0, z: 0.0 },
      { elem: 'C', x: 0.75, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.2, y: 1.02, z: 0.0 },
      { elem: 'H', x: -1.2, y: -0.51, z: 0.88 },
      { elem: 'H', x: -1.2, y: -0.51, z: -0.88 },
      { elem: 'H', x: 1.2, y: -1.02, z: 0.0 },
      { elem: 'H', x: 1.2, y: 0.51, z: 0.88 },
      { elem: 'H', x: 1.2, y: 0.51, z: -0.88 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  C2H4: {
    name: "Éthylène",
    atomList: [
      { elem: 'C', x: -0.67, y: 0.0, z: 0.0 },
      { elem: 'C', x: 0.67, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.24, y: 0.93, z: 0.0 },
      { elem: 'H', x: -1.24, y: -0.93, z: 0.0 },
      { elem: 'H', x: 1.24, y: 0.93, z: 0.0 },
      { elem: 'H', x: 1.24, y: -0.93, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  C2H2: {
    name: "Acétylène",
    atomList: [
      { elem: 'C', x: -0.6, y: 0.0, z: 0.0 },
      { elem: 'C', x: 0.6, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.66, y: 0.0, z: 0.0 },
      { elem: 'H', x: 1.66, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },

  // Halogénures (15)
  CH3Cl: {
    name: "Chlorométhane",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.77, y: 0.0, z: 0.0 },
      { elem: 'H', x: -0.49, y: 1.01, z: 0.0 },
      { elem: 'H', x: -0.49, y: -0.51, z: 0.88 },
      { elem: 'H', x: -0.49, y: -0.51, z: -0.88 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 1.77, y: 1.0, z: 0.6 },
      { x: 1.77, y: -0.5, z: 0.87 },
      { x: 1.77, y: -0.5, z: -0.87 }
    ]
  },
  CH2Cl2: {
    name: "Dichlorométhane",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 0.63, y: 0.63, z: 0.63 },
      { elem: 'Cl', x: -0.63, y: -0.63, z: 0.63 },
      { elem: 'H', x: -0.63, y: 0.63, z: -0.63 },
      { elem: 'H', x: 0.63, y: -0.63, z: -0.63 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  SIH4: {
    name: "Silane",
    atomList: [
      { elem: 'Si', x: 0, y: 0, z: 0 },
      { elem: 'H', x: 0.86, y: 0.86, z: 0.86 },
      { elem: 'H', x: -0.86, y: -0.86, z: 0.86 },
      { elem: 'H', x: -0.86, y: 0.86, z: -0.86 },
      { elem: 'H', x: 0.86, y: -0.86, z: -0.86 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  CCl4: {
    name: "Tétrachlorométhane",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.0, y: 1.0, z: 1.0 },
      { elem: 'Cl', x: -1.0, y: -1.0, z: 1.0 },
      { elem: 'Cl', x: -1.0, y: 1.0, z: -1.0 },
      { elem: 'Cl', x: 1.0, y: -1.0, z: -1.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  HF: {
    name: "Fluorure d'hydrogène",
    atomList: [
      { elem: 'H', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 0.92, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0.92, y: 0.5, z: 0.5 },
      { x: 0.92, y: -0.5, z: 0.5 },
      { x: 0.92, y: 0.5, z: -0.5 }
    ]
  },
  HCl: {
    name: "Chlorure d'hydrogène",
    atomList: [
      { elem: 'H', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.27, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 1.27, y: 0.7, z: 0.7 },
      { x: 1.27, y: -0.7, z: 0.7 },
      { x: 1.27, y: 0.7, z: -0.7 }
    ]
  },
  HBr: {
    name: "Bromure d'hydrogène",
    atomList: [
      { elem: 'H', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Br', x: 1.41, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 1.41, y: 0.8, z: 0.8 },
      { x: 1.41, y: -0.8, z: 0.8 },
      { x: 1.41, y: 0.8, z: -0.8 }
    ]
  },
  HI: {
    name: "Iodure d'hydrogène",
    atomList: [
      { elem: 'H', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'I', x: 1.61, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 1.61, y: 0.9, z: 0.9 },
      { x: 1.61, y: -0.9, z: 0.9 },
      { x: 1.61, y: 0.9, z: -0.9 }
    ]
  },
  PCl3: {
    name: "Trichlorure de phosphore",
    atomList: [
      { elem: 'P', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.5, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: -0.75, y: 1.3, z: 0.0 },
      { elem: 'Cl', x: -0.75, y: -1.3, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: 0, z: 1.0 }]
  },
  PCl5: {
    name: "Pentachlorure de phosphore",
    atomList: [
      { elem: 'P', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 0.0, y: 0.0, z: 2.0 }, // Axial
      { elem: 'Cl', x: 0.0, y: 0.0, z: -2.0 }, // Axial
      { elem: 'Cl', x: 2.0, y: 0.0, z: 0.0 }, // Équatorial
      { elem: 'Cl', x: -1.0, y: 1.73, z: 0.0 }, // Équatorial
      { elem: 'Cl', x: -1.0, y: -1.73, z: 0.0 }, // Équatorial
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  PF5: {
    name: "Pentafluorure de phosphore",
    atomList: [
      { elem: 'P', x: 0, y: 0, z: 0 },
      { elem: 'F', x: 0, y: 0, z: 1.58 }, // Axial
      { elem: 'F', x: 0, y: 0, z: -1.58 }, // Axial
      { elem: 'F', x: 1.54, y: 0, z: 0 }, // Équatorial
      { elem: 'F', x: -0.77, y: 1.33, z: 0 }, // Équatorial
      { elem: 'F', x: -0.77, y: -1.33, z: 0 }, // Équatorial
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  SF4: {
    name: "Tétrafluorure de soufre",
    atomList: [
      { elem: 'S', x: 0, y: 0, z: 0 },
      { elem: 'F', x: 0, y: 0, z: 1.6 }, // Axial
      { elem: 'F', x: 0, y: 0, z: -1.6 }, // Axial
      { elem: 'F', x: 1.5, y: 0.5, z: 0 }, // Équatorial
      { elem: 'F', x: 1.5, y: -0.5, z: 0 }, // Équatorial
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    // Doublet en position équatoriale (côté opposé aux F équatoriaux)
    lonePairs: [{ x: -1.5, y: 0, z: 0 }]
  },
  TECL4: {
    name: "Tétrachlorure de tellure",
    atomList: [
      { elem: 'Te', x: 0, y: 0, z: 0 },
      { elem: 'Cl', x: 0, y: 0, z: 2.3 },
      { elem: 'Cl', x: 0, y: 0, z: -2.3 },
      { elem: 'Cl', x: -2.1, y: 0.7, z: 0 },
      { elem: 'Cl', x: -2.1, y: -0.7, z: 0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 2.0, y: 0, z: 0 }]
  },
  CLF3: {
    name: "Trifluorure de chlore",
    atomList: [
      { elem: 'Cl', x: 0, y: 0, z: 0 },
      { elem: 'F', x: 0, y: 0, z: 1.6 }, // Axial
      { elem: 'F', x: 0, y: 0, z: -1.6 }, // Axial
      { elem: 'F', x: -1.6, y: 0, z: 0 }, // Équatorial
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    // 2 doublets en positions équatoriales
    lonePairs: [
      { x: 1.4, y: 1.0, z: 0 },
      { x: 1.4, y: -1.0, z: 0 }
    ]
  },
  SF6: {
    name: "Hexafluorure de soufre",
    atomList: [
      { elem: 'S', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 1.56, y: 0.0, z: 0.0 },
      { elem: 'F', x: -1.56, y: 0.0, z: 0.0 },
      { elem: 'F', x: 0.0, y: 1.56, z: 0.0 },
      { elem: 'F', x: 0.0, y: -1.56, z: 0.0 },
      { elem: 'F', x: 0.0, y: 0.0, z: 1.56 },
      { elem: 'F', x: 0.0, y: 0.0, z: -1.56 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  SEF6: {
    name: "Hexafluorure de sélénium",
    atomList: [
      { elem: 'Se', x: 0, y: 0, z: 0 },
      { elem: 'F', x: 1.7, y: 0, z: 0 },
      { elem: 'F', x: -1.7, y: 0, z: 0 },
      { elem: 'F', x: 0, y: 1.7, z: 0 },
      { elem: 'F', x: 0, y: -1.7, z: 0 },
      { elem: 'F', x: 0, y: 0, z: 1.7 },
      { elem: 'F', x: 0, y: 0, z: -1.7 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  BRF5: {
    name: "Pentafluorure de brome",
    atomList: [
      { elem: 'Br', x: 0, y: 0, z: 0 },
      { elem: 'F', x: 0, y: 0, z: 1.8 }, // Sommet
      { elem: 'F', x: 1.8, y: 0, z: 0 }, // Base
      { elem: 'F', x: -1.8, y: 0, z: 0 }, // Base
      { elem: 'F', x: 0, y: 1.8, z: 0 }, // Base
      { elem: 'F', x: 0, y: -1.8, z: 0 }, // Base
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    // Doublet à l'opposé du sommet
    lonePairs: [{ x: 0, y: 0, z: -1.8 }]
  },
  IF5: {
    name: "Pentafluorure d'iode",
    atomList: [
      { elem: 'I', x: 0, y: 0, z: 0 },
      { elem: 'F', x: 0, y: 0, z: 1.9 },
      { elem: 'F', x: 1.9, y: 0, z: 0 },
      { elem: 'F', x: -1.9, y: 0, z: 0 },
      { elem: 'F', x: 0, y: 1.9, z: 0 },
      { elem: 'F', x: 0, y: -1.9, z: 0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: 0, z: -2.0 }]
  },
  XeF4: {
    name: "Tétrafluorure de xénon",
    atomList: [
      { elem: 'Xe', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 1.6, y: 0.0, z: 0.0 },
      { elem: 'F', x: -1.6, y: 0.0, z: 0.0 },
      { elem: 'F', x: 0.0, y: 1.6, z: 0.0 },
      { elem: 'F', x: 0.0, y: -1.6, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0, y: 0, z: 1.5 },
      { x: 0, y: 0, z: -1.5 }
    ]
  },
  XeF2: {
    name: "Difluorure de xénon",
    atomList: [
      { elem: 'Xe', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 1.8, y: 0.0, z: 0.0 },
      { elem: 'F', x: -1.8, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0, y: 1.5, z: 0 },
      { x: 0, y: -1.5, z: 0 },
      { x: 0, y: 0, z: 1.5 }
    ]
  },
  BrF3: {
    name: "Trifluorure de brome",
    atomList: [
      { elem: 'Br', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 1.7, y: 0.0, z: 0.0 },
      { elem: 'F', x: -0.85, y: 1.47, z: 0.0 },
      { elem: 'F', x: -0.85, y: -1.47, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0, y: 0, z: 1.5 },
      { x: 0, y: 0, z: -1.5 }
    ]
  },
  ICl3: {
    name: "Trichlorure d'iode",
    atomList: [
      { elem: 'I', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.8, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: -0.9, y: 1.56, z: 0.0 },
      { elem: 'Cl', x: -0.9, y: -1.56, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0, y: 0, z: 1.5 },
      { x: 0, y: 0, z: -1.5 }
    ]
  },

  // Oxydes et composés oxygénés (20)
  CO: {
    name: "Monoxyde de carbone",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.13, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0.0, y: 0.8, z: 0.8 },
      { x: 0.0, y: -0.8, z: 0.8 }
    ]
  },
  NO2: {
    name: "Dioxyde d'azote",
    atomList: [
      { elem: 'N', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.2, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.2, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [{ x: 0, y: 0, z: 1.0 }]
  },
  N2O: {
    name: "Protoxyde d'azote",
    atomList: [
      { elem: 'N', x: -1.1, y: 0.0, z: 0.0 },
      { elem: 'N', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.15, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: -1.1, y: 0.8, z: 0.8 },
      { x: 1.15, y: 0.8, z: 0.8 }
    ]
  },
  SO3: {
    name: "Trioxyde de soufre",
    atomList: [
      { elem: 'S', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.42, y: 0.0, z: 0.0 },
      { elem: 'O', x: -0.71, y: 1.23, z: 0.0 },
      { elem: 'O', x: -0.71, y: -1.23, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  O3: {
    name: "Ozone",
    atomList: [
      { elem: 'O', x: -1.15, y: 0.0, z: 0.0 },
      { elem: 'O', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.07, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: -1.15, y: 0.8, z: 0.8 },
      { x: 1.07, y: 0.8, z: 0.8 }
    ]
  },
  H2O2: {
    name: "Peroxyde d'hydrogène",
    atomList: [
      { elem: 'O', x: -0.75, y: 0.0, z: 0.0 },
      { elem: 'O', x: 0.75, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.2, y: 0.97, z: 0.0 },
      { elem: 'H', x: 1.2, y: -0.97, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: -0.75, y: -0.5, z: 0.87 },
      { x: -0.75, y: -0.5, z: -0.87 },
      { x: 0.75, y: 0.5, z: 0.87 },
      { x: 0.75, y: 0.5, z: -0.87 }
    ]
  },
  HCN: {
    name: "Cyanure d'hydrogène",
    atomList: [
      { elem: 'H', x: -1.06, y: 0.0, z: 0.0 },
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'N', x: 1.16, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 1.16, y: 0.8, z: 0.8 },
      { x: 1.16, y: -0.8, z: 0.8 }
    ]
  },
  H2S: {
    name: "Sulfure d'hydrogène",
    atomList: [
      { elem: 'S', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 1.0, y: 1.0, z: 0.0 },
      { elem: 'H', x: -1.0, y: 1.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 0.0, y: -0.7, z: 1.0 },
      { x: 0.0, y: -0.7, z: -1.0 }
    ]
  },
  NF3: {
    name: "Trifluorure d'azote",
    atomList: [
      { elem: 'N', x: 0, y: 0, z: 0 },
      { elem: 'F', x: 0, y: 1.15, z: -0.4 },
      { elem: 'F', x: -1.0, y: -0.57, z: -0.4 },
      { elem: 'F', x: 1.0, y: -0.57, z: -0.4 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: 0, z: 1.0 }]
  },
  PH3: {
    name: "Phosphine",
    atomList: [
      { elem: 'P', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.0, y: 1.42, z: 0.0 },
      { elem: 'H', x: 1.23, y: -0.71, z: 0.0 },
      { elem: 'H', x: -1.23, y: -0.71, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: 0, z: 1.0 }]
  },
  AsH3: {
    name: "Arsine",
    atomList: [
      { elem: 'As', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.0, y: 1.52, z: 0.0 },
      { elem: 'H', x: 1.32, y: -0.76, z: 0.0 },
      { elem: 'H', x: -1.32, y: -0.76, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: 0, z: 1.0 }]
  },
  SbH3: {
    name: "Stibine",
    atomList: [
      { elem: 'Sb', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.0, y: 1.71, z: 0.0 },
      { elem: 'H', x: 1.48, y: -0.85, z: 0.0 },
      { elem: 'H', x: -1.48, y: -0.85, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: 0, z: 1.0 }]
  },
  SiO2: {
    name: "Dioxyde de silicium (modèle)",
    atomList: [
      { elem: 'Si', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.61, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.61, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  "NO3-": {
    name: "Ion nitrate",
    atomList: [
      { elem: 'N', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.22, y: 0.0, z: 0.0 },
      { elem: 'O', x: -0.61, y: 1.06, z: 0.0 },
      { elem: 'O', x: -0.61, y: -1.06, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  "I3-": {
    name: "Ion triiodure",
    atomList: [
      { elem: 'I', x: 0, y: 0, z: 0 },
      { elem: 'I', x: 0, y: 0, z: 2.9 },
      { elem: 'I', x: 0, y: 0, z: -2.9 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 2.5, y: 0, z: 0 },
      { x: -1.25, y: 2.1, z: 0 },
      { x: -1.25, y: -2.1, z: 0 }
    ]
  },
  "SO4-": {
    name: "Ion sulfate",
    atomList: [
      { elem: 'S', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.49, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.49, y: 0.0, z: 0.0 },
      { elem: 'O', x: 0.0, y: 1.49, z: 0.0 },
      { elem: 'O', x: 0.0, y: -1.49, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  "ICL4-": {
    name: "Ion tétrachloroiodate",
    atomList: [
      { elem: 'I', x: 0, y: 0, z: 0 },
      { elem: 'Cl', x: 2.5, y: 0, z: 0 },
      { elem: 'Cl', x: -2.5, y: 0, z: 0 },
      { elem: 'Cl', x: 0, y: 2.5, z: 0 },
      { elem: 'Cl', x: 0, y: -2.5, z: 0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 0, y: 0, z: 2.2 },
      { x: 0, y: 0, z: -2.2 }
    ]
  },
  "PO43-": {
    name: "Ion phosphate",
    atomList: [
      { elem: 'P', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.54, y: 0.0, z: 0.0 },
      { elem: 'O', x: 0.0, y: 1.54, z: 0.0 },
      { elem: 'O', x: 0.0, y: -1.54, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  ClO2: {
    name: "Dioxyde de chlore",
    atomList: [
      { elem: 'Cl', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.47, y: 0.5, z: 0.0 },
      { elem: 'O', x: -1.47, y: 0.5, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: -1.0, z: 0 }]
  },
  "ClO4-": {
    name: "Ion perchlorate",
    atomList: [
      { elem: 'Cl', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.45, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.45, y: 0.0, z: 0.0 },
      { elem: 'O', x: 0.0, y: 1.45, z: 0.0 },
      { elem: 'O', x: 0.0, y: -1.45, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  SCL2: {
    name: "Dichlorure de soufre",
    atomList: [
      { elem: 'S', x: 0, y: 0, z: 0 },
      { elem: 'Cl', x: 1.4, y: 1.0, z: 0 },
      { elem: 'Cl', x: -1.4, y: 1.0, z: 0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 0, y: -0.8, z: 1.0 },
      { x: 0, y: -0.8, z: -1.0 }
    ]
  },
  OF2: {
    name: "Difluorure d'oxygène",
    atomList: [
      { elem: 'O', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 1.41, y: 0.5, z: 0.0 },
      { elem: 'F', x: -1.41, y: 0.5, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 0.0, y: -0.7, z: 1.0 },
      { x: 0.0, y: -0.7, z: -1.0 }
    ]
  },
  O2: {
    name: "Dioxygène",
    atomList: [
      { elem: 'O', x: -0.6, y: 0.0, z: 0.0 },
      { elem: 'O', x: 0.6, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: -0.6, y: 0.8, z: 0.8 },
      { x: -0.6, y: -0.8, z: 0.8 },
      { x: 0.6, y: 0.8, z: 0.8 },
      { x: 0.6, y: -0.8, z: 0.8 }
    ]
  },
  N2: {
    name: "Diazote",
    atomList: [
      { elem: 'N', x: -0.55, y: 0.0, z: 0.0 },
      { elem: 'N', x: 0.55, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: -0.55, y: 0.8, z: 0.8 },
      { x: -0.55, y: -0.8, z: 0.8 },
      { x: 0.55, y: 0.8, z: 0.8 },
      { x: 0.55, y: -0.8, z: 0.8 }
    ]
  },

  // Hydrocarbures (15)
  CH3OH: {
    name: "Méthanol",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.43, y: 0.0, z: 0.0 },
      { elem: 'H', x: -0.49, y: 1.01, z: 0.0 },
      { elem: 'H', x: -0.49, y: -0.51, z: 0.88 },
      { elem: 'H', x: -0.49, y: -0.51, z: -0.88 },
      { elem: 'H', x: 1.93, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 1.43, y: 0.8, z: 0.8 },
      { x: 1.43, y: -0.8, z: 0.8 }
    ]
  },
  CH3CH2OH: {
    name: "Éthanol",
    atomList: [
      { elem: 'C', x: -1.22, y: 0.0, z: 0.0 },
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.43, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.67, y: 1.02, z: 0.0 },
      { elem: 'H', x: -1.67, y: -0.51, z: 0.88 },
      { elem: 'H', x: -1.67, y: -0.51, z: -0.88 },
      { elem: 'H', x: 0.49, y: 1.01, z: 0.0 },
      { elem: 'H', x: 0.49, y: -0.51, z: 0.88 },
      { elem: 'H', x: 0.49, y: -0.51, z: -0.88 },
      { elem: 'H', x: 1.93, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 1.43, y: 0.8, z: 0.8 },
      { x: 1.43, y: -0.8, z: 0.8 }
    ]
  },
  HCOOH: {
    name: "Acide formique",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.22, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.07, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.67, y: 0.94, z: 0.0 },
      { elem: 'H', x: 0.0, y: 1.07, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 1.22, y: 0.8, z: 0.8 },
      { x: 1.22, y: -0.8, z: 0.8 },
      { x: -1.07, y: 0.8, z: -0.8 },
      { x: -1.07, y: -0.8, z: -0.8 }
    ]
  },
  CH3COOH: {
    name: "Acide acétique",
    atomList: [
      // Carbone méthyle avec géométrie tétraédrique
      { elem: 'C', x: -1.5, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.5, y: 0.4, z: 0.89 },
      { elem: 'H', x: -1.86, y: -0.8, z: -0.44 },
      { elem: 'H', x: -1.14, y: -0.8, z: -0.44 },
      // Groupe COOH (plan)
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 0.8, y: 1.0, z: 0.0 },
      { elem: 'O', x: 0.8, y: -1.0, z: 0.0 },
      { elem: 'H', x: 1.7, y: -1.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0.8, y: 1.0, z: 0.8 },
      { x: 0.8, y: 1.0, z: -0.8 }
    ]
  },
  CH3NH2: {
    name: "Méthylamine",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'N', x: 1.47, y: 0.0, z: 0.0 },
      { elem: 'H', x: -0.49, y: 1.01, z: 0.0 },
      { elem: 'H', x: -0.49, y: -0.51, z: 0.88 },
      { elem: 'H', x: -0.49, y: -0.51, z: -0.88 },
      { elem: 'H', x: 1.97, y: 0.94, z: 0.0 },
      { elem: 'H', x: 1.97, y: -0.47, z: 0.82 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 1.47, y: -0.47, z: -0.82 }]
  },
  CH3SH: {
    name: "Méthanethiol",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'S', x: 1.82, y: 0.0, z: 0.0 },
      { elem: 'H', x: -0.49, y: 1.01, z: 0.0 },
      { elem: 'H', x: -0.49, y: -0.51, z: 0.88 },
      { elem: 'H', x: -0.49, y: -0.51, z: -0.88 },
      { elem: 'H', x: 2.32, y: 0.94, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 1.82, y: 0.8, z: 0.8 },
      { x: 1.82, y: -0.8, z: 0.8 }
    ]
  },
  CH3F: {
    name: "Fluorométhane",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 1.38, y: 0.0, z: 0.0 },
      { elem: 'H', x: -0.49, y: 1.01, z: 0.0 },
      { elem: 'H', x: -0.49, y: -0.51, z: 0.88 },
      { elem: 'H', x: -0.49, y: -0.51, z: -0.88 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 1.38, y: 0.8, z: 0.8 },
      { x: 1.38, y: -0.5, z: 0.87 },
      { x: 1.38, y: -0.5, z: -0.87 }
    ]
  },
  CH3Br: {
    name: "Bromométhane",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Br', x: 1.94, y: 0.0, z: 0.0 },
      { elem: 'H', x: -0.49, y: 1.01, z: 0.0 },
      { elem: 'H', x: -0.49, y: -0.51, z: 0.88 },
      { elem: 'H', x: -0.49, y: -0.51, z: -0.88 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 1.94, y: 1.0, z: 0.6 },
      { x: 1.94, y: -0.5, z: 0.87 },
      { x: 1.94, y: -0.5, z: -0.87 }
    ]
  },
  CH3I: {
    name: "Iodométhane",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'I', x: 2.14, y: 0.0, z: 0.0 },
      { elem: 'H', x: -0.49, y: 1.01, z: 0.0 },
      { elem: 'H', x: -0.49, y: -0.51, z: 0.88 },
      { elem: 'H', x: -0.49, y: -0.51, z: -0.88 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: 2.14, y: 1.1, z: 0.7 },
      { x: 2.14, y: -0.6, z: 0.97 },
      { x: 2.14, y: -0.6, z: -0.97 }
    ]
  },
  CH2F2: {
    name: "Difluorométhane",
    atomList: [
      // Géométrie tétraédrique avec 2F et 2H
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 0.63, y: 0.63, z: 0.63 },
      { elem: 'F', x: -0.63, y: -0.63, z: 0.63 },
      { elem: 'H', x: -0.63, y: 0.63, z: -0.63 },
      { elem: 'H', x: 0.63, y: -0.63, z: -0.63 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  CHF3: {
    name: "Trifluorométhane",
    atomList: [
      // Géométrie tétraédrique avec 3F et 1H
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'F', x: 0.63, y: 0.63, z: 0.63 },
      { elem: 'F', x: -0.63, y: -0.63, z: 0.63 },
      { elem: 'F', x: -0.63, y: 0.63, z: -0.63 },
      { elem: 'H', x: 0.63, y: -0.63, z: -0.63 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  C6H6: {
    name: "Benzène",
    atomList: [
      { elem: 'C', x: -1.21, y: 0.70, z: 0.0 },
      { elem: 'C', x: 0.0, y: 1.40, z: 0.0 },
      { elem: 'C', x: 1.21, y: 0.70, z: 0.0 },
      { elem: 'C', x: 1.21, y: -0.70, z: 0.0 },
      { elem: 'C', x: 0.0, y: -1.40, z: 0.0 },
      { elem: 'C', x: -1.21, y: -0.70, z: 0.0 },
      { elem: 'H', x: -2.16, y: 1.25, z: 0.0 },
      { elem: 'H', x: 0.0, y: 2.50, z: 0.0 },
      { elem: 'H', x: 2.16, y: 1.25, z: 0.0 },
      { elem: 'H', x: 2.16, y: -1.25, z: 0.0 },
      { elem: 'H', x: 0.0, y: -2.50, z: 0.0 },
      { elem: 'H', x: -2.16, y: -1.25, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  C2H6O: {
    name: "Éthanol",
    atomList: [
      { elem: 'C', x: -1.22, y: 0.0, z: 0.0 }, // C1 (Methyl)
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },   // C2 (Methylene)
      { elem: 'O', x: 1.43, y: 0.0, z: 0.0 },  // O
      // H's on C1
      { elem: 'H', x: -1.67, y: 1.02, z: 0.0 },
      { elem: 'H', x: -1.67, y: -0.51, z: 0.88 },
      { elem: 'H', x: -1.67, y: -0.51, z: -0.88 },
      // H's on C2 (Correction: CH2 a 2 H, pas 3)
      { elem: 'H', x: 0.49, y: -0.51, z: 0.88 },
      { elem: 'H', x: 0.49, y: -0.51, z: -0.88 },
      // H on O (Correction: Coudé, pas linéaire)
      { elem: 'H', x: 1.80, y: 0.80, z: 0.0 }, 
    ],
    hasLonePairs: true,
    hasTetrahedron: true, // Géométrie autour de O est tétraédrique
    // Doublets orientés pour former le tétraèdre avec C-O et O-H
    lonePairs: [
      { x: 1.6, y: -0.4, z: 0.8 },
      { x: 1.6, y: -0.4, z: -0.8 }
    ]
  },
  HCHO: {
    name: "Formaldéhyde",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.22, y: 0.0, z: 0.0 },
      { elem: 'H', x: -0.65, y: 0.93, z: 0.0 },
      { elem: 'H', x: -0.65, y: -0.93, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },

  // Composés inorganiques (15)
  BeCl2: {
    name: "Dichlorure de béryllium",
    atomList: [
      { elem: 'Be', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.8, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: -1.8, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  MgCl2: {
    name: "Dichlorure de magnésium",
    atomList: [
      { elem: 'Mg', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 2.1, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: -2.1, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  CaCl2: {
    name: "Dichlorure de calcium",
    atomList: [
      { elem: 'Ca', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 2.3, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: -2.3, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  AlCl3: {
    name: "Trichlorure d'aluminium",
    atomList: [
      { elem: 'Al', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.7, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: -0.85, y: 1.47, z: 0.0 },
      { elem: 'Cl', x: -0.85, y: -1.47, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  SiCl4: {
    name: "Tétrachlorure de silicium",
    atomList: [
      { elem: 'Si', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.0, y: 1.0, z: 1.0 },
      { elem: 'Cl', x: -1.0, y: -1.0, z: 1.0 },
      { elem: 'Cl', x: -1.0, y: 1.0, z: -1.0 },
      { elem: 'Cl', x: 1.0, y: -1.0, z: -1.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  SnCl4: {
    name: "Tétrachlorure d'étain",
    atomList: [
      { elem: 'Sn', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.1, y: 1.1, z: 1.1 },
      { elem: 'Cl', x: -1.1, y: -1.1, z: 1.1 },
      { elem: 'Cl', x: -1.1, y: 1.1, z: -1.1 },
      { elem: 'Cl', x: 1.1, y: -1.1, z: -1.1 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  PbCl4: {
    name: "Tétrachlorure de plomb",
    atomList: [
      { elem: 'Pb', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.2, y: 1.2, z: 1.2 },
      { elem: 'Cl', x: -1.2, y: -1.2, z: 1.2 },
      { elem: 'Cl', x: -1.2, y: 1.2, z: -1.2 },
      { elem: 'Cl', x: 1.2, y: -1.2, z: -1.2 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  TiCl4: {
    name: "Tétrachlorure de titane",
    atomList: [
      { elem: 'Ti', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.3, y: 1.3, z: 1.3 },
      { elem: 'Cl', x: -1.3, y: -1.3, z: 1.3 },
      { elem: 'Cl', x: -1.3, y: 1.3, z: -1.3 },
      { elem: 'Cl', x: 1.3, y: -1.3, z: -1.3 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  VCl4: {
    name: "Tétrachlorure de vanadium",
    atomList: [
      { elem: 'V', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.4, y: 1.4, z: 1.4 },
      { elem: 'Cl', x: -1.4, y: -1.4, z: 1.4 },
      { elem: 'Cl', x: -1.4, y: 1.4, z: -1.4 },
      { elem: 'Cl', x: 1.4, y: -1.4, z: -1.4 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  CrO3: {
    name: "Trioxyde de chrome",
    atomList: [
      { elem: 'Cr', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.6, y: 0.0, z: 0.0 },
      { elem: 'O', x: -0.8, y: 1.39, z: 0.0 },
      { elem: 'O', x: -0.8, y: -1.39, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  "MnO4-": {
    name: "Ion permanganate",
    atomList: [
      { elem: 'Mn', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.6, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.6, y: 0.0, z: 0.0 },
      { elem: 'O', x: 0.0, y: 1.6, z: 0.0 },
      { elem: 'O', x: 0.0, y: -1.6, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  FeCl3: {
    name: "Trichlorure de fer",
    atomList: [
      { elem: 'Fe', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.8, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: -0.9, y: 1.56, z: 0.0 },
      { elem: 'Cl', x: -0.9, y: -1.56, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  CoCl2: {
    name: "Dichlorure de cobalt",
    atomList: [
      { elem: 'Co', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 2.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: -2.0, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  NiCl2: {
    name: "Dichlorure de nickel",
    atomList: [
      { elem: 'Ni', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 2.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: -2.0, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  CuCl2: {
    name: "Dichlorure de cuivre",
    atomList: [
      { elem: 'Cu', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 2.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: -2.0, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },

  // Ions et espèces chargées (10)
  "NH4+": {
    name: "Ammonium",
    atomList: [
      { elem: 'N', x: 0, y: 0, z: 0 },
      { elem: 'H', x: 0.6, y: 0.6, z: 0.6 },
      { elem: 'H', x: -0.6, y: -0.6, z: 0.6 },
      { elem: 'H', x: -0.6, y: 0.6, z: -0.6 },
      { elem: 'H', x: 0.6, y: -0.6, z: -0.6 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true,
  },
  "H3O+": {
    name: "Hydronium",
    atomList: [
      { elem: 'O', x: 0, y: 0, z: 0 },
      { elem: 'H', x: 0, y: 0.9, z: -0.3 },
      { elem: 'H', x: -0.78, y: -0.45, z: -0.3 },
      { elem: 'H', x: 0.78, y: -0.45, z: -0.3 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: 0, z: 0.8 }]
  },
  "OH-": {
    name: "Ion hydroxyle",
    atomList: [
      { elem: 'O', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.97, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0.0, y: 0.8, z: 0.8 },
      { x: 0.0, y: -0.8, z: 0.8 },
      { x: 0.0, y: 0.8, z: -0.8 }
    ]
  },
  "CN-": {
    name: "Ion cyanure",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'N', x: 1.15, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0.0, y: 0.8, z: 0.8 },
      { x: 0.0, y: -0.8, z: 0.8 },
      { x: 1.15, y: 0.8, z: 0.8 },
      { x: 1.15, y: -0.8, z: 0.8 }
    ]
  },
  "CO32-": {
    name: "Ion carbonate",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.28, y: 0.0, z: 0.0 },
      { elem: 'O', x: -0.64, y: 1.11, z: 0.0 },
      { elem: 'O', x: -0.64, y: -1.11, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  "NO2-": {
    name: "Ion nitrite",
    atomList: [
      { elem: 'N', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.21, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.21, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [{ x: 0, y: 0, z: 1.0 }]
  },
  "ClO3-": {
    name: "Ion chlorate",
    atomList: [
      { elem: 'Cl', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.49, y: 0.0, z: 0.0 },
      { elem: 'O', x: -0.75, y: 1.30, z: 0.0 },
      { elem: 'O', x: -0.75, y: -1.30, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: 0, z: 1.0 }]
  },
  "BrO3-": {
    name: "Ion bromate",
    atomList: [
      { elem: 'Br', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.61, y: 0.0, z: 0.0 },
      { elem: 'O', x: -0.81, y: 1.40, z: 0.0 },
      { elem: 'O', x: -0.81, y: -1.40, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: 0, z: 1.0 }]
  },
  "IO3-": {
    name: "Ion iodate",
    atomList: [
      { elem: 'I', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.82, y: 0.0, z: 0.0 },
      { elem: 'O', x: -0.91, y: 1.58, z: 0.0 },
      { elem: 'O', x: -0.91, y: -1.58, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 0, y: 0, z: 1.0 }]
  },
  "SCN-": {
    name: "Ion thiocyanate",
    atomList: [
      { elem: 'S', x: -1.6, y: 0.0, z: 0.0 },
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'N', x: 1.16, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: -1.6, y: 0.8, z: 0.8 },
      { x: -1.6, y: -0.8, z: 0.8 },
      { x: 1.16, y: 0.8, z: 0.8 },
      { x: 1.16, y: -0.8, z: 0.8 }
    ]
  },

  // Composés divers (10)
  N2H4: {
    name: "Hydrazine",
    atomList: [
      { elem: 'N', x: -0.75, y: 0.0, z: 0.0 },
      { elem: 'N', x: 0.75, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.2, y: 0.94, z: 0.0 },
      { elem: 'H', x: -1.2, y: -0.47, z: 0.82 },
      { elem: 'H', x: 1.2, y: -0.94, z: 0.0 },
      { elem: 'H', x: 1.2, y: 0.47, z: 0.82 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [
      { x: -0.75, y: -0.47, z: -0.82 },
      { x: 0.75, y: 0.47, z: -0.82 }
    ]
  },
  CH3CN: {
    name: "Acétonitrile",
    atomList: [
      { elem: 'C', x: -1.1, y: 0.0, z: 0.0 },
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'N', x: 1.16, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.6, y: 1.02, z: 0.0 },
      { elem: 'H', x: -1.6, y: -0.51, z: 0.88 },
      { elem: 'H', x: -1.6, y: -0.51, z: -0.88 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 1.16, y: 0.8, z: 0.8 },
      { x: 1.16, y: -0.8, z: 0.8 }
    ]
  },
  CH3NC: {
    name: "Méthyl isocyanure",
    atomList: [
      { elem: 'C', x: -1.1, y: 0.0, z: 0.0 },
      { elem: 'N', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.16, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.6, y: 1.02, z: 0.0 },
      { elem: 'H', x: -1.6, y: -0.51, z: 0.88 },
      { elem: 'H', x: -1.6, y: -0.51, z: -0.88 },
      { elem: 'H', x: 1.66, y: 0.94, z: 0.0 },
      { elem: 'H', x: 1.66, y: -0.47, z: 0.82 },
      { elem: 'H', x: 1.66, y: -0.47, z: -0.82 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0.0, y: 0.8, z: 0.8 },
      { x: 0.0, y: -0.8, z: 0.8 }
    ]
  },
  H2CO3: {
    name: "Acide carbonique",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.26, y: 0.0, z: 0.0 },
      { elem: 'O', x: -0.63, y: 1.09, z: 0.0 },
      { elem: 'O', x: -0.63, y: -1.09, z: 0.0 },
      { elem: 'H', x: -1.53, y: 1.09, z: 0.0 },
      { elem: 'H', x: -1.53, y: -1.09, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 1.26, y: 0.8, z: 0.8 },
      { x: 1.26, y: -0.8, z: 0.8 }
    ]
  },
  HNO3: {
    name: "Acide nitrique",
    atomList: [
      { elem: 'N', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.21, y: 0.0, z: 0.0 },
      { elem: 'O', x: -0.61, y: 1.06, z: 0.0 },
      { elem: 'O', x: -0.61, y: -1.06, z: 0.0 },
      { elem: 'H', x: -1.51, y: 1.06, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  H2SO4: {
    name: "Acide sulfurique",
    atomList: [
      { elem: 'S', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.49, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.49, y: 0.0, z: 0.0 },
      { elem: 'O', x: 0.0, y: 1.49, z: 0.0 },
      { elem: 'O', x: 0.0, y: -1.49, z: 0.0 },
      { elem: 'H', x: 0.0, y: 2.39, z: 0.0 },
      { elem: 'H', x: 0.0, y: -2.39, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  H3PO4: {
    name: "Acide phosphorique",
    atomList: [
      { elem: 'P', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'O', x: -1.54, y: 0.0, z: 0.0 },
      { elem: 'O', x: 0.0, y: 1.54, z: 0.0 },
      { elem: 'O', x: 0.0, y: -1.54, z: 0.0 },
      { elem: 'H', x: 0.0, y: 2.44, z: 0.0 },
      { elem: 'H', x: -2.44, y: 0.0, z: 0.0 },
      { elem: 'H', x: 2.44, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  CH3CHO: {
    name: "Acétaldéhyde",
    atomList: [
      { elem: 'C', x: -1.1, y: 0.0, z: 0.0 },
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 1.22, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.6, y: 1.02, z: 0.0 },
      { elem: 'H', x: -1.6, y: -0.51, z: 0.88 },
      { elem: 'H', x: -1.6, y: -0.51, z: -0.88 },
      { elem: 'H', x: 0.0, y: 1.07, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  CH3COCH3: {
    name: "Acétone",
    atomList: [
      { elem: 'C', x: -1.5, y: 0.0, z: 0.0 },
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.5, y: 0.0, z: 0.0 },
      { elem: 'O', x: 0.0, y: 1.22, z: 0.0 },
      { elem: 'H', x: -2.0, y: 1.02, z: 0.0 },
      { elem: 'H', x: -2.0, y: -0.51, z: 0.88 },
      { elem: 'H', x: -2.0, y: -0.51, z: -0.88 },
      { elem: 'H', x: 2.0, y: 1.02, z: 0.0 },
      { elem: 'H', x: 2.0, y: -0.51, z: 0.88 },
      { elem: 'H', x: 2.0, y: -0.51, z: -0.88 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },
  CH3CH2NH2: {
    name: "Éthylamine",
    atomList: [
      { elem: 'C', x: -1.22, y: 0.0, z: 0.0 },
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'N', x: 1.47, y: 0.0, z: 0.0 },
      { elem: 'H', x: -1.67, y: 1.02, z: 0.0 },
      { elem: 'H', x: -1.67, y: -0.51, z: 0.88 },
      { elem: 'H', x: -1.67, y: -0.51, z: -0.88 },
      { elem: 'H', x: 0.49, y: 1.01, z: 0.0 },
      { elem: 'H', x: 0.49, y: -0.51, z: 0.88 },
      { elem: 'H', x: 0.49, y: -0.51, z: -0.88 },
      { elem: 'H', x: 1.97, y: 0.94, z: 0.0 },
      { elem: 'H', x: 1.97, y: -0.47, z: 0.82 },
    ],
    hasLonePairs: true,
    hasTetrahedron: true,
    lonePairs: [{ x: 1.47, y: -0.47, z: -0.82 }]
  },
  C6H12: {
    name: "Cyclohexane (forme chaise)",
    atomList: [
      { elem: 'C', x: 1.0, y: 0.0, z: 1.5 },
      { elem: 'C', x: 0.5, y: 0.87, z: 1.0 },
      { elem: 'C', x: -0.5, y: 0.87, z: 1.0 },
      { elem: 'C', x: -1.0, y: 0.0, z: 1.5 },
      { elem: 'C', x: -0.5, y: -0.87, z: 1.0 },
      { elem: 'C', x: 0.5, y: -0.87, z: 1.0 },
      { elem: 'H', x: 1.5, y: 0.0, z: 2.2 },
      { elem: 'H', x: 0.75, y: 1.3, z: 0.5 },
      { elem: 'H', x: -0.75, y: 1.3, z: 0.5 },
      { elem: 'H', x: -1.5, y: 0.0, z: 2.2 },
      { elem: 'H', x: -0.75, y: -1.3, z: 0.5 },
      { elem: 'H', x: 0.75, y: -1.3, z: 0.5 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },

  C9H13NO3: {
    name: "Adrénaline",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.04, y: 1.39, z: 0.0 },
      { elem: 'C', x: 1.54, y: 2.78, z: 0.0 },
      { elem: 'C', x: 0.0, y: 2.78, z: 0.0 },
      { elem: 'C', x: -0.5, y: 1.39, z: 0.0 },
      { elem: 'C', x: -1.54, y: 3.47, z: 0.0 },
      { elem: 'O', x: 3.18, y: 1.39, z: 0.0 },
      { elem: 'N', x: -1.04, y: -0.7, z: 0.0 },
      { elem: 'O', x: -2.18, y: -0.7, z: 0.0 },
      { elem: 'C', x: -0.54, y: -1.91, z: 0.0 },
      { elem: 'C', x: 0.99, y: -1.91, z: 0.0 },
      { elem: 'O', x: -1.18, y: 4.64, z: 0.0 },
      { elem: 'H', x: 2.04, y: -0.5, z: 0.88 },
      { elem: 'H', x: 2.04, y: -0.5, z: -0.88 },
      { elem: 'H', x: 2.04, y: 3.28, z: 0.88 },
      { elem: 'H', x: 2.04, y: 3.28, z: -0.88 },
      { elem: 'H', x: -0.5, y: 4.17, z: 0.88 },
      { elem: 'H', x: -0.5, y: 4.17, z: -0.88 },
      { elem: 'H', x: -2.04, y: 3.47, z: 0.0 },
      { elem: 'H', x: -1.18, y: 5.64, z: 0.0 },
      { elem: 'H', x: -0.54, y: -2.52, z: 0.88 },
      { elem: 'H', x: -0.54, y: -2.52, z: -0.88 },
      { elem: 'H', x: 1.49, y: -2.52, z: 0.88 },
      { elem: 'H', x: 1.49, y: -2.52, z: -0.88 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 3.18, y: 1.39, z: 0.8 },
      { x: -2.18, y: -0.7, z: 0.8 },
      { x: -1.18, y: 4.64, z: 0.8 }
    ]
  },

  C8H11NO3: {
    name: "Noradrénaline",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.04, y: 1.39, z: 0.0 },
      { elem: 'C', x: 1.54, y: 2.78, z: 0.0 },
      { elem: 'C', x: 0.0, y: 2.78, z: 0.0 },
      { elem: 'C', x: -0.5, y: 1.39, z: 0.0 },
      { elem: 'O', x: 3.18, y: 1.39, z: 0.0 },
      { elem: 'N', x: -1.04, y: -0.7, z: 0.0 },
      { elem: 'O', x: -2.18, y: -0.7, z: 0.0 },
      { elem: 'C', x: -0.54, y: -1.91, z: 0.0 },
      { elem: 'C', x: 0.99, y: -1.91, z: 0.0 },
      { elem: 'O', x: -1.0, y: 3.97, z: 0.0 },
      { elem: 'H', x: 2.04, y: -0.5, z: 0.88 },
      { elem: 'H', x: 2.04, y: -0.5, z: -0.88 },
      { elem: 'H', x: 2.04, y: 3.28, z: 0.88 },
      { elem: 'H', x: 2.04, y: 3.28, z: -0.88 },
      { elem: 'H', x: -0.5, y: 4.17, z: 0.88 },
      { elem: 'H', x: -0.5, y: 4.17, z: -0.88 },
      { elem: 'H', x: -0.54, y: -2.52, z: 0.88 },
      { elem: 'H', x: -0.54, y: -2.52, z: -0.88 },
      { elem: 'H', x: 1.49, y: -2.52, z: 0.88 },
      { elem: 'H', x: 1.49, y: -2.52, z: -0.88 },
      { elem: 'H', x: -1.0, y: 4.97, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 3.18, y: 1.39, z: 0.8 },
      { x: -2.18, y: -0.7, z: 0.8 },
      { x: -1.0, y: 3.97, z: 0.8 }
    ]
  },

  C4H9MgBr: {
    name: "Bromure de butylmagnésium",
    atomList: [
      { elem: 'Mg', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Br', x: -1.9, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.68, y: 0.0, z: 0.0 },
      { elem: 'C', x: 3.82, y: 0.0, z: 0.0 },
      { elem: 'C', x: 4.96, y: 0.0, z: 0.0 },
      { elem: 'H', x: 1.04, y: 1.02, z: 0.0 },
      { elem: 'H', x: 1.04, y: -0.51, z: 0.88 },
      { elem: 'H', x: 1.04, y: -0.51, z: -0.88 },
      { elem: 'H', x: 3.18, y: 1.02, z: 0.0 },
      { elem: 'H', x: 3.18, y: -0.51, z: 0.88 },
      { elem: 'H', x: 3.18, y: -0.51, z: -0.88 },
      { elem: 'H', x: 4.32, y: 1.02, z: 0.0 },
      { elem: 'H', x: 4.32, y: -0.51, z: 0.88 },
      { elem: 'H', x: 4.32, y: -0.51, z: -0.88 },
      { elem: 'H', x: 5.46, y: 1.02, z: 0.0 },
      { elem: 'H', x: 5.46, y: -0.51, z: 0.88 },
      { elem: 'H', x: 5.46, y: -0.51, z: -0.88 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: -1.9, y: 1.0, z: 0.6 },
      { x: -1.9, y: -0.5, z: 0.87 },
      { x: -1.9, y: -0.5, z: -0.87 }
    ]
  },

  C2H5MgBr: {
    name: "Bromure d'éthylmagnésium",
    atomList: [
      { elem: 'Mg', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Br', x: -1.9, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.68, y: 0.0, z: 0.0 },
      { elem: 'H', x: 1.04, y: 1.02, z: 0.0 },
      { elem: 'H', x: 1.04, y: -0.51, z: 0.88 },
      { elem: 'H', x: 1.04, y: -0.51, z: -0.88 },
      { elem: 'H', x: 3.18, y: 1.02, z: 0.0 },
      { elem: 'H', x: 3.18, y: -0.51, z: 0.88 },
      { elem: 'H', x: 3.18, y: -0.51, z: -0.88 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: -1.9, y: 1.0, z: 0.6 },
      { x: -1.9, y: -0.5, z: 0.87 },
      { x: -1.9, y: -0.5, z: -0.87 }
    ]
  },

  C8H11NO2: {
    name: "Dopamine",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.04, y: 1.39, z: 0.0 },
      { elem: 'C', x: 1.54, y: 2.78, z: 0.0 },
      { elem: 'C', x: 0.0, y: 2.78, z: 0.0 },
      { elem: 'C', x: -0.5, y: 1.39, z: 0.0 },
      { elem: 'O', x: 3.18, y: 1.39, z: 0.0 },
      { elem: 'N', x: -1.04, y: -0.7, z: 0.0 },
      { elem: 'C', x: -0.54, y: -1.91, z: 0.0 },
      { elem: 'C', x: 0.99, y: -1.91, z: 0.0 },
      { elem: 'O', x: -1.0, y: 3.97, z: 0.0 },
      { elem: 'H', x: 2.04, y: -0.5, z: 0.88 },
      { elem: 'H', x: 2.04, y: -0.5, z: -0.88 },
      { elem: 'H', x: 2.04, y: 3.28, z: 0.88 },
      { elem: 'H', x: 2.04, y: 3.28, z: -0.88 },
      { elem: 'H', x: -0.5, y: 4.17, z: 0.88 },
      { elem: 'H', x: -0.5, y: 4.17, z: -0.88 },
      { elem: 'H', x: -0.54, y: -2.52, z: 0.88 },
      { elem: 'H', x: -0.54, y: -2.52, z: -0.88 },
      { elem: 'H', x: 1.49, y: -2.52, z: 0.88 },
      { elem: 'H', x: 1.49, y: -2.52, z: -0.88 },
      { elem: 'H', x: -1.0, y: 4.97, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 3.18, y: 1.39, z: 0.8 },
      { x: -1.0, y: 3.97, z: 0.8 }
    ]
  },

  C3H7NO2: {
    name: "Alanine",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.68, y: 0.0, z: 0.0 },
      { elem: 'O', x: 3.22, y: -0.94, z: 0.0 },
      { elem: 'O', x: 2.18, y: 1.39, z: 0.0 },
      { elem: 'N', x: -1.04, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.0, y: 1.07, z: 0.0 },
      { elem: 'H', x: -0.5, y: -0.51, z: 0.88 },
      { elem: 'H', x: -0.5, y: -0.51, z: -0.88 },
      { elem: 'H', x: 2.68, y: 0.5, z: 0.88 },
      { elem: 'H', x: 2.68, y: 0.5, z: -0.88 },
      { elem: 'H', x: -1.54, y: 0.94, z: 0.0 },
      { elem: 'H', x: -1.54, y: -0.47, z: 0.82 },
      { elem: 'H', x: -1.54, y: -0.47, z: -0.82 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 3.22, y: -0.94, z: 0.8 },
      { x: 2.18, y: 1.39, z: 0.8 }
    ]
  },

  // Fragment d'ADN (paire de bases A-T)
  DNA_AT: {
    name: "Paire de bases Adénine-Thymine",
    atomList: [
      // Adénine
      { elem: 'N', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.34, y: 0.0, z: 0.0 },
      { elem: 'N', x: 2.01, y: 1.2, z: 0.0 },
      { elem: 'C', x: 1.34, y: 2.4, z: 0.0 },
      { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
      { elem: 'N', x: -0.67, y: 1.2, z: 0.0 },
      { elem: 'N', x: 2.01, y: -1.2, z: 0.0 },
      { elem: 'C', x: 1.34, y: -2.4, z: 0.0 },
      { elem: 'N', x: 0.0, y: -2.4, z: 0.0 },
      { elem: 'H', x: -0.54, y: 3.35, z: 0.0 },
      { elem: 'H', x: 2.28, y: 3.35, z: 0.0 },
      { elem: 'H', x: 3.08, y: 1.2, z: 0.0 },
      { elem: 'H', x: 2.28, y: -3.35, z: 0.0 },
      { elem: 'H', x: -0.54, y: -3.35, z: 0.0 },
      { elem: 'H', x: 3.08, y: -1.2, z: 0.0 },
      // Thymine
      { elem: 'C', x: 4.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 5.34, y: 0.0, z: 0.0 },
      { elem: 'N', x: 3.33, y: 1.2, z: 0.0 },
      { elem: 'C', x: 4.0, y: 2.4, z: 0.0 },
      { elem: 'C', x: 5.34, y: 2.4, z: 0.0 },
      { elem: 'C', x: 6.01, y: 1.2, z: 0.0 },
      { elem: 'O', x: 7.35, y: 1.2, z: 0.0 },
      { elem: 'H', x: 2.28, y: 1.2, z: 0.0 },
      { elem: 'H', x: 3.33, y: 3.35, z: 0.0 },
      { elem: 'H', x: 5.88, y: 3.35, z: 0.0 },
      { elem: 'H', x: 6.61, y: -0.65, z: 0.0 },
      { elem: 'H', x: 7.35, y: 2.85, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 5.34, y: 0.0, z: 0.8 },
      { x: 7.35, y: 1.2, z: 0.8 }
    ]
  },

  C15H11O6: {
    name: "Cyanidine (anthocyanidine)",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
      { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
      { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
      { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
      { elem: 'C', x: 2.1, y: -1.2, z: 0.0 },
      { elem: 'C', x: 1.4, y: -2.4, z: 0.0 },
      { elem: 'C', x: 0.0, y: -2.4, z: 0.0 },
      { elem: 'C', x: -0.7, y: -1.2, z: 0.0 },
      { elem: 'C', x: 3.5, y: 1.2, z: 0.0 },
      { elem: 'C', x: 4.2, y: 2.4, z: 0.0 },
      { elem: 'C', x: 3.5, y: 3.6, z: 0.0 },
      { elem: 'C', x: 2.1, y: 3.6, z: 0.0 },
      { elem: 'O', x: 4.9, y: 2.4, z: 0.0 },
      { elem: 'O', x: 3.5, y: -1.2, z: 0.0 },
      { elem: 'O', x: -1.4, y: 1.2, z: 0.0 },
      { elem: 'O', x: -1.4, y: -1.2, z: 0.0 },
      { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
      { elem: 'H', x: 1.4, y: 4.55, z: 0.0 },
      { elem: 'H', x: 4.2, y: 4.55, z: 0.0 },
      { elem: 'H', x: 5.6, y: 2.4, z: 0.0 },
      { elem: 'H', x: -0.7, y: -3.35, z: 0.0 },
      { elem: 'H', x: 1.4, y: -3.35, z: 0.0 },
      { elem: 'H', x: 3.5, y: -2.85, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 4.9, y: 2.4, z: 0.8 },
      { x: 3.5, y: -1.2, z: 0.8 },
      { x: -1.4, y: 1.2, z: 0.8 },
      { x: -1.4, y: -1.2, z: 0.8 }
    ]
  },

  // PCl5 déjà dans la liste précédente, donc on l'omet ici

  C7H6O2: {
    name: "Acide benzoïque",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
      { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
      { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
      { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
      { elem: 'C', x: 2.8, y: -1.2, z: 0.0 },
      { elem: 'O', x: 3.5, y: -2.4, z: 0.0 },
      { elem: 'O', x: 2.1, y: -2.4, z: 0.0 },
      { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
      { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
      { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
      { elem: 'H', x: 3.5, y: -0.65, z: 0.88 },
      { elem: 'H', x: 3.5, y: -0.65, z: -0.88 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 3.5, y: -2.4, z: 0.8 },
      { x: 2.1, y: -2.4, z: 0.8 }
    ]
  },

  I2: {
    name: "Di-iode",
    atomList: [
      { elem: 'I', x: -1.33, y: 0.0, z: 0.0 },
      { elem: 'I', x: 1.33, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: -1.33, y: 1.0, z: 1.0 },
      { x: -1.33, y: -1.0, z: 1.0 },
      { x: -1.33, y: 1.0, z: -1.0 },
      { x: 1.33, y: 1.0, z: 1.0 },
      { x: 1.33, y: -1.0, z: 1.0 },
      { x: 1.33, y: 1.0, z: -1.0 }
    ]
  },

  C4H10O: {
    name: "Éther diéthylique",
    atomList: [
      { elem: 'C', x: -1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: -0.54, y: 1.39, z: 0.0 },
      { elem: 'O', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.54, y: 1.39, z: 0.0 },
      { elem: 'H', x: -2.04, y: 0.94, z: 0.0 },
      { elem: 'H', x: -2.04, y: -0.47, z: 0.82 },
      { elem: 'H', x: -2.04, y: -0.47, z: -0.82 },
      { elem: 'H', x: -1.04, y: 2.34, z: 0.0 },
      { elem: 'H', x: 0.46, y: 1.84, z: 0.88 },
      { elem: 'H', x: 0.46, y: 1.84, z: -0.88 },
      { elem: 'H', x: 1.04, y: -0.47, z: 0.88 },
      { elem: 'H', x: 1.04, y: -0.47, z: -0.88 },
      { elem: 'H', x: 3.04, y: 1.84, z: 0.0 },
      { elem: 'H', x: 2.54, y: 2.34, z: 0.88 },
      { elem: 'H', x: 2.54, y: 2.34, z: -0.88 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0.0, y: 0.0, z: 1.0 },
      { x: 0.0, y: 0.0, z: -1.0 }
    ]
  },

  C7H6O3: {
    name: "Acide salicylique",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
      { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
      { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
      { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
      { elem: 'C', x: 2.8, y: -1.2, z: 0.0 },
      { elem: 'O', x: 3.5, y: -2.4, z: 0.0 },
      { elem: 'O', x: 2.1, y: -2.4, z: 0.0 },
      { elem: 'O', x: -1.4, y: 2.4, z: 0.0 },
      { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
      { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
      { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
      { elem: 'H', x: 3.5, y: -0.65, z: 0.88 },
      { elem: 'H', x: 3.5, y: -0.65, z: -0.88 },
      { elem: 'H', x: -2.4, y: 2.4, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 3.5, y: -2.4, z: 0.8 },
      { x: 2.1, y: -2.4, z: 0.8 },
      { x: -1.4, y: 2.4, z: 0.8 }
    ]
  },

  AgNO3: {
    name: "Nitrate d'argent",
    atomList: [
      { elem: 'Ag', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'N', x: 2.0, y: 0.0, z: 0.0 },
      { elem: 'O', x: 2.8, y: 1.07, z: 0.0 },
      { elem: 'O', x: 2.8, y: -1.07, z: 0.0 },
      { elem: 'O', x: 3.6, y: 0.0, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 2.8, y: 1.07, z: 0.8 },
      { x: 2.8, y: -1.07, z: 0.8 },
      { x: 3.6, y: 0.0, z: 0.8 }
    ]
  },

  BaSO4: {
    name: "Sulfate de baryum",
    atomList: [
      { elem: 'Ba', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'S', x: 2.5, y: 0.0, z: 0.0 },
      { elem: 'O', x: 3.5, y: 1.07, z: 0.0 },
      { elem: 'O', x: 3.5, y: -1.07, z: 0.0 },
      { elem: 'O', x: 1.5, y: 1.07, z: 0.0 },
      { elem: 'O', x: 1.5, y: -1.07, z: 0.0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: false,
  },

  CUCL2: {
    name: "Chlorure de cuivre(II)",
    atomList: [
      { elem: 'Cu', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'Cl', x: 1.8, y: 1.8, z: 0.0 },
      { elem: 'Cl', x: -1.8, y: -1.8, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 1.8, y: 1.8, z: 1.0 },
      { x: 1.8, y: 1.8, z: -1.0 },
      { x: -1.8, y: -1.8, z: 1.0 },
      { x: -1.8, y: -1.8, z: -1.0 }
    ]
  },

  C8H10N4O2: {
    name: "Caféine",
    atomList: [
      { elem: 'N', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.2, y: 0.0, z: 0.0 },
      { elem: 'N', x: 2.0, y: 1.2, z: 0.0 },
      { elem: 'C', x: 1.2, y: 2.4, z: 0.0 },
      { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
      { elem: 'N', x: -0.8, y: 1.2, z: 0.0 },
      { elem: 'C', x: 2.4, y: -1.2, z: 0.0 },
      { elem: 'O', x: 3.6, y: -1.2, z: 0.0 },
      { elem: 'N', x: 1.6, y: -2.4, z: 0.0 },
      { elem: 'C', x: 2.4, y: -3.6, z: 0.0 },
      { elem: 'O', x: 3.6, y: -3.6, z: 0.0 },
      { elem: 'C', x: -1.6, y: 3.6, z: 0.0 },
      { elem: 'C', x: -2.4, y: 4.8, z: 0.0 },
      { elem: 'C', x: -0.8, y: -1.2, z: 0.0 },
      { elem: 'C', x: -1.6, y: -2.4, z: 0.0 },
      { elem: 'H', x: -0.8, y: 5.6, z: 0.0 },
      { elem: 'H', x: -3.2, y: 4.8, z: 0.88 },
      { elem: 'H', x: -3.2, y: 4.8, z: -0.88 },
      { elem: 'H', x: -1.6, y: -3.35, z: 0.88 },
      { elem: 'H', x: -1.6, y: -3.35, z: -0.88 },
      { elem: 'H', x: 0.8, y: -2.4, z: 0.0 },
      { elem: 'H', x: 2.4, y: -4.55, z: 0.88 },
      { elem: 'H', x: 2.4, y: -4.55, z: -0.88 },
      { elem: 'H', x: 1.2, y: 3.35, z: 0.0 },
      { elem: 'H', x: -0.8, y: 3.35, z: 0.88 },
      { elem: 'H', x: -0.8, y: 3.35, z: -0.88 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 3.6, y: -1.2, z: 0.8 },
      { x: 3.6, y: -3.6, z: 0.8 }
    ]
  },

  C8H8O3: {
    name: "Vanilline",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
      { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
      { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
      { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
      { elem: 'C', x: 2.8, y: -1.2, z: 0.0 },
      { elem: 'O', x: 3.5, y: -2.4, z: 0.0 },
      { elem: 'O', x: 3.5, y: 1.2, z: 0.0 },
      { elem: 'O', x: -1.4, y: 2.4, z: 0.0 },
      { elem: 'C', x: -1.4, y: 3.6, z: 0.0 },
      { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
      { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
      { elem: 'H', x: 4.0, y: 1.2, z: 0.0 },
      { elem: 'H', x: 3.5, y: -0.65, z: 0.88 },
      { elem: 'H', x: 3.5, y: -0.65, z: -0.88 },
      { elem: 'H', x: -2.4, y: 3.6, z: 0.88 },
      { elem: 'H', x: -2.4, y: 3.6, z: -0.88 },
      { elem: 'H', x: -0.8, y: 4.55, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 3.5, y: -2.4, z: 0.8 },
      { x: 3.5, y: 1.2, z: 0.8 },
      { x: -1.4, y: 2.4, z: 0.8 }
    ]
  },

  C10H18O: {
    name: "Linalol",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.68, y: 0.0, z: 0.0 },
      { elem: 'C', x: 3.82, y: 0.0, z: 0.0 },
      { elem: 'C', x: 4.96, y: 0.0, z: 0.0 },
      { elem: 'C', x: 5.5, y: 1.39, z: 0.0 },
      { elem: 'C', x: 6.64, y: 1.39, z: 0.0 },
      { elem: 'C', x: 7.78, y: 1.39, z: 0.0 },
      { elem: 'O', x: 8.32, y: 2.78, z: 0.0 },
      { elem: 'C', x: 0.0, y: 1.54, z: 0.0 },
      { elem: 'C', x: -1.54, y: 0.0, z: 0.0 },
      { elem: 'H', x: -0.5, y: 2.04, z: 0.88 },
      { elem: 'H', x: -0.5, y: 2.04, z: -0.88 },
      { elem: 'H', x: 1.04, y: -0.5, z: 0.88 },
      { elem: 'H', x: 1.04, y: -0.5, z: -0.88 },
      { elem: 'H', x: 3.18, y: 1.02, z: 0.0 },
      { elem: 'H', x: 3.18, y: -0.51, z: 0.88 },
      { elem: 'H', x: 3.18, y: -0.51, z: -0.88 },
      { elem: 'H', x: 4.32, y: 1.02, z: 0.0 },
      { elem: 'H', x: 4.32, y: -0.51, z: 0.88 },
      { elem: 'H', x: 4.32, y: -0.51, z: -0.88 },
      { elem: 'H', x: 5.46, y: -0.5, z: 0.88 },
      { elem: 'H', x: 5.46, y: -0.5, z: -0.88 },
      { elem: 'H', x: 7.14, y: 2.34, z: 0.0 },
      { elem: 'H', x: 7.14, y: 0.44, z: 0.88 },
      { elem: 'H', x: 7.14, y: 0.44, z: -0.88 },
      { elem: 'H', x: 8.78, y: 0.89, z: 0.0 },
      { elem: 'H', x: 8.78, y: 1.84, z: 0.88 },
      { elem: 'H', x: 8.78, y: 1.84, z: -0.88 },
      { elem: 'H', x: 8.82, y: 3.73, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 8.32, y: 2.78, z: 0.8 }
    ]
  },

  C6H8O7: {
    name: "Acide citrique",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.68, y: 0.0, z: 0.0 },
      { elem: 'C', x: 3.82, y: 0.0, z: 0.0 },
      { elem: 'O', x: 4.36, y: -0.94, z: 0.0 },
      { elem: 'O', x: 3.32, y: 1.39, z: 0.0 },
      { elem: 'O', x: 0.0, y: 1.54, z: 0.0 },
      { elem: 'C', x: -1.54, y: 0.0, z: 0.0 },
      { elem: 'O', x: -2.08, y: -0.94, z: 0.0 },
      { elem: 'O', x: -1.04, y: 1.39, z: 0.0 },
      { elem: 'C', x: 1.54, y: 1.54, z: 0.0 },
      { elem: 'O', x: 2.08, y: 2.48, z: 0.0 },
      { elem: 'O', x: 0.0, y: 2.08, z: 0.0 },
      { elem: 'H', x: -0.5, y: -0.51, z: 0.88 },
      { elem: 'H', x: -0.5, y: -0.51, z: -0.88 },
      { elem: 'H', x: 4.32, y: 0.5, z: 0.88 },
      { elem: 'H', x: 4.32, y: 0.5, z: -0.88 },
      { elem: 'H', x: 1.04, y: 2.04, z: 0.88 },
      { elem: 'H', x: 1.04, y: 2.04, z: -0.88 },
      { elem: 'H', x: -2.58, y: -0.44, z: 0.0 },
      { elem: 'H', x: 2.58, y: 2.98, z: 0.0 },
      { elem: 'H', x: 0.5, y: 3.03, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 4.36, y: -0.94, z: 0.8 },
      { x: 3.32, y: 1.39, z: 0.8 },
      { x: -2.08, y: -0.94, z: 0.8 },
      { x: -1.04, y: 1.39, z: 0.8 },
      { x: 2.08, y: 2.48, z: 0.8 },
      { x: 0.0, y: 2.08, z: 0.8 }
    ]
  },

  C6H8O6: {
    name: "Acide ascorbique (Vitamine C)",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.68, y: 0.0, z: 0.0 },
      { elem: 'C', x: 3.82, y: 0.0, z: 0.0 },
      { elem: 'O', x: 4.36, y: -0.94, z: 0.0 },
      { elem: 'O', x: 3.32, y: 1.39, z: 0.0 },
      { elem: 'O', x: 0.0, y: 1.54, z: 0.0 },
      { elem: 'C', x: -1.54, y: 0.0, z: 0.0 },
      { elem: 'O', x: -2.08, y: -0.94, z: 0.0 },
      { elem: 'O', x: -1.04, y: 1.39, z: 0.0 },
      { elem: 'C', x: 1.54, y: -1.54, z: 0.0 },
      { elem: 'O', x: 2.08, y: -2.48, z: 0.0 },
      { elem: 'O', x: 0.0, y: -2.08, z: 0.0 },
      { elem: 'H', x: -0.5, y: 0.51, z: 0.88 },
      { elem: 'H', x: -0.5, y: 0.51, z: -0.88 },
      { elem: 'H', x: 4.32, y: -0.5, z: 0.88 },
      { elem: 'H', x: 4.32, y: -0.5, z: -0.88 },
      { elem: 'H', x: 1.04, y: -2.04, z: 0.88 },
      { elem: 'H', x: 1.04, y: -2.04, z: -0.88 },
      { elem: 'H', x: -2.58, y: -0.44, z: 0.0 },
      { elem: 'H', x: 2.58, y: -2.98, z: 0.0 },
      { elem: 'H', x: 0.5, y: -3.03, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 4.36, y: -0.94, z: 0.8 },
      { x: 3.32, y: 1.39, z: 0.8 },
      { x: -2.08, y: -0.94, z: 0.8 },
      { x: -1.04, y: 1.39, z: 0.8 },
      { x: 2.08, y: -2.48, z: 0.8 },
      { x: 0.0, y: -2.08, z: 0.8 }
    ]
  },

  C9H8O4: {
    name: "Acide acétylsalicylique (Aspirine)",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
      { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
      { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
      { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
      { elem: 'C', x: 2.8, y: -1.2, z: 0.0 },
      { elem: 'O', x: 3.5, y: -2.4, z: 0.0 },
      { elem: 'O', x: 2.1, y: -2.4, z: 0.0 },
      { elem: 'O', x: -1.4, y: 2.4, z: 0.0 },
      { elem: 'C', x: -2.1, y: 3.6, z: 0.0 },
      { elem: 'O', x: -3.5, y: 3.6, z: 0.0 },
      { elem: 'C', x: -1.4, y: 4.8, z: 0.0 },
      { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
      { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
      { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
      { elem: 'H', x: 3.5, y: -0.65, z: 0.88 },
      { elem: 'H', x: 3.5, y: -0.65, z: -0.88 },
      { elem: 'H', x: -1.4, y: 5.35, z: 0.88 },
      { elem: 'H', x: -1.4, y: 5.35, z: -0.88 },
      { elem: 'H', x: -2.1, y: 5.35, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 3.5, y: -2.4, z: 0.8 },
      { x: 2.1, y: -2.4, z: 0.8 },
      { x: -1.4, y: 2.4, z: 0.8 },
      { x: -3.5, y: 3.6, z: 0.8 }
    ]
  },

  C3H6O3: {
    name: "Acide lactique",
    atomList: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
      { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
      { elem: 'C', x: 2.68, y: 0.0, z: 0.0 },
      { elem: 'O', x: 3.22, y: -0.94, z: 0.0 },
      { elem: 'O', x: 2.18, y: 1.39, z: 0.0 },
      { elem: 'O', x: -1.04, y: 0.0, z: 0.0 },
      { elem: 'H', x: 0.0, y: 1.07, z: 0.0 },
      { elem: 'H', x: -0.5, y: -0.51, z: 0.88 },
      { elem: 'H', x: -0.5, y: -0.51, z: -0.88 },
      { elem: 'H', x: 2.68, y: 0.5, z: 0.88 },
      { elem: 'H', x: 2.68, y: 0.5, z: -0.88 },
      { elem: 'H', x: -1.54, y: 0.94, z: 0.0 },
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 3.22, y: -0.94, z: 0.8 },
      { x: 2.18, y: 1.39, z: 0.8 },
      { x: -1.04, y: 0.0, z: 0.8 }
    ]
  },
  CUCL: {
    name: "Chlorure de cuivre I",
    atomList: [
      { elem: 'Cu', x: 0, y: 0, z: 0 },
      { elem: 'Cl', x: 2.05, y: 0, z: 0 },
    ],
    hasLonePairs: false,
    hasTetrahedron: true, // Montre la liaison
  },
  C8H9NO2: {
  name: "Paracétamol",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'N', x: 2.8, y: -1.2, z: 0.0 },
    { elem: 'O', x: 3.5, y: -2.4, z: 0.0 },
    { elem: 'O', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 3.5, y: -0.65, z: 0.88 },
    { elem: 'H', x: 3.5, y: -0.65, z: -0.88 },
    { elem: 'H', x: -2.4, y: 2.4, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: 3.5, y: -2.4, z: 0.8 },
    { x: -1.4, y: 2.4, z: 0.8 }
  ]
},

C13H18O2: {
  name: "Ibuprofène",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.54, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.04, y: 1.39, z: 0.0 },
    { elem: 'C', x: 1.54, y: 2.78, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.78, z: 0.0 },
    { elem: 'C', x: -0.5, y: 1.39, z: 0.0 },
    { elem: 'C', x: 2.68, y: -1.2, z: 0.0 },
    { elem: 'C', x: 4.22, y: -1.2, z: 0.0 },
    { elem: 'C', x: 4.72, y: 0.19, z: 0.0 },
    { elem: 'C', x: 4.22, y: 1.58, z: 0.0 },
    { elem: 'C', x: 2.68, y: 1.58, z: 0.0 },
    { elem: 'C', x: 5.82, y: -1.2, z: 0.0 },
    { elem: 'C', x: 6.32, y: -2.59, z: 0.0 },
    { elem: 'O', x: 7.46, y: -2.59, z: 0.0 },
    { elem: 'O', x: 5.32, y: -3.69, z: 0.0 },
    { elem: 'H', x: 2.04, y: -0.5, z: 0.88 },
    { elem: 'H', x: 2.04, y: -0.5, z: -0.88 },
    { elem: 'H', x: 2.04, y: 3.28, z: 0.88 },
    { elem: 'H', x: 2.04, y: 3.28, z: -0.88 },
    { elem: 'H', x: -0.5, y: 4.17, z: 0.88 },
    { elem: 'H', x: -0.5, y: 4.17, z: -0.88 },
    { elem: 'H', x: 4.72, y: 2.58, z: 0.88 },
    { elem: 'H', x: 4.72, y: 2.58, z: -0.88 },
    { elem: 'H', x: 2.18, y: 2.08, z: 0.88 },
    { elem: 'H', x: 2.18, y: 2.08, z: -0.88 },
    { elem: 'H', x: 6.32, y: -0.65, z: 0.88 },
    { elem: 'H', x: 6.32, y: -0.65, z: -0.88 },
    { elem: 'H', x: 6.32, y: -4.55, z: 0.88 },
    { elem: 'H', x: 6.32, y: -4.55, z: -0.88 },
    { elem: 'H', x: 4.72, y: -3.69, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: 7.46, y: -2.59, z: 0.8 },
    { x: 5.32, y: -3.69, z: 0.8 }
  ]
},

C17H21NO4: {
  name: "Cocaïne",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'N', x: -1.4, y: -0.7, z: 0.0 },
    { elem: 'C', x: -0.9, y: -1.91, z: 0.0 },
    { elem: 'C', x: 0.64, y: -1.91, z: 0.0 },
    { elem: 'C', x: 2.8, y: -1.2, z: 0.0 },
    { elem: 'O', x: 3.5, y: -2.4, z: 0.0 },
    { elem: 'O', x: 3.5, y: 1.2, z: 0.0 },
    { elem: 'O', x: -1.4, y: 3.6, z: 0.0 },
    { elem: 'C', x: -2.1, y: 4.8, z: 0.0 },
    { elem: 'O', x: -3.5, y: 4.8, z: 0.0 },
    { elem: 'C', x: -1.4, y: 6.0, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 3.5, y: -0.65, z: 0.88 },
    { elem: 'H', x: 3.5, y: -0.65, z: -0.88 },
    { elem: 'H', x: -1.4, y: 6.55, z: 0.88 },
    { elem: 'H', x: -1.4, y: 6.55, z: -0.88 },
    { elem: 'H', x: -2.1, y: 6.55, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: 3.5, y: -2.4, z: 0.8 },
    { x: 3.5, y: 1.2, z: 0.8 },
    { x: -1.4, y: 3.6, z: 0.8 },
    { x: -3.5, y: 4.8, z: 0.8 }
  ]
},

C21H30O2: {
  name: "Testostérone",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: -2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: -1.4, y: 4.8, z: 0.0 },
    { elem: 'C', x: 0.0, y: 4.8, z: 0.0 },
    { elem: 'C', x: 0.7, y: 3.6, z: 0.0 },
    { elem: 'C', x: 2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: 2.8, y: 4.8, z: 0.0 },
    { elem: 'C', x: 2.1, y: 6.0, z: 0.0 },
    { elem: 'C', x: 0.7, y: 6.0, z: 0.0 },
    { elem: 'C', x: 0.0, y: 7.2, z: 0.0 },
    { elem: 'C', x: -0.7, y: 8.4, z: 0.0 },
    { elem: 'C', x: -1.4, y: 9.6, z: 0.0 },
    { elem: 'O', x: -2.1, y: 10.8, z: 0.0 },
    { elem: 'O', x: -0.7, y: 10.8, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: 2.1, y: -0.7, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'H', x: -1.4, y: 5.35, z: 0.0 },
    { elem: 'H', x: 0.0, y: 5.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 2.4, z: 0.0 },
    { elem: 'H', x: 3.15, y: 3.6, z: 0.0 },
    { elem: 'H', x: 3.15, y: 6.0, z: 0.0 },
    { elem: 'H', x: 0.7, y: 7.75, z: 0.0 },
    { elem: 'H', x: -0.7, y: 7.75, z: 0.0 },
    { elem: 'H', x: 0.0, y: 8.9, z: 0.0 },
    { elem: 'H', x: -1.4, y: 8.9, z: 0.0 },
    { elem: 'H', x: -2.1, y: 9.6, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -2.1, y: 10.8, z: 0.8 },
    { x: -0.7, y: 10.8, z: 0.8 }
  ]
},

C18H24O2: {
  name: "Œstradiol",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: -2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: -1.4, y: 4.8, z: 0.0 },
    { elem: 'C', x: 0.0, y: 4.8, z: 0.0 },
    { elem: 'C', x: 0.7, y: 3.6, z: 0.0 },
    { elem: 'C', x: 2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: 2.8, y: 4.8, z: 0.0 },
    { elem: 'C', x: 2.1, y: 6.0, z: 0.0 },
    { elem: 'C', x: 0.7, y: 6.0, z: 0.0 },
    { elem: 'C', x: 0.0, y: 7.2, z: 0.0 },
    { elem: 'O', x: -0.7, y: 8.4, z: 0.0 },
    { elem: 'O', x: 0.7, y: 8.4, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: 2.1, y: -0.7, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'H', x: -1.4, y: 5.35, z: 0.0 },
    { elem: 'H', x: 0.0, y: 5.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 2.4, z: 0.0 },
    { elem: 'H', x: 3.15, y: 3.6, z: 0.0 },
    { elem: 'H', x: 3.15, y: 6.0, z: 0.0 },
    { elem: 'H', x: 0.7, y: 7.75, z: 0.0 },
    { elem: 'H', x: -0.7, y: 7.75, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -0.7, y: 8.4, z: 0.8 },
    { x: 0.7, y: 8.4, z: 0.8 }
  ]
},

C10H15N: {
  name: "Amphétamine",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: 2.8, y: -1.2, z: 0.0 },
    { elem: 'N', x: 3.5, y: -2.4, z: 0.0 },
    { elem: 'C', x: 4.2, y: -3.6, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 3.5, y: -0.65, z: 0.88 },
    { elem: 'H', x: 3.5, y: -0.65, z: -0.88 },
    { elem: 'H', x: 4.2, y: -4.25, z: 0.88 },
    { elem: 'H', x: 4.2, y: -4.25, z: -0.88 },
    { elem: 'H', x: 5.3, y: -3.6, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: 3.5, y: -2.4, z: 0.8 }
  ]
},

C17H19NO3: {
  name: "Morphine",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: -2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: -1.4, y: 4.8, z: 0.0 },
    { elem: 'C', x: 0.0, y: 4.8, z: 0.0 },
    { elem: 'C', x: 0.7, y: 3.6, z: 0.0 },
    { elem: 'N', x: 2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: 2.8, y: 4.8, z: 0.0 },
    { elem: 'C', x: 2.1, y: 6.0, z: 0.0 },
    { elem: 'O', x: 0.7, y: 6.0, z: 0.0 },
    { elem: 'O', x: -0.7, y: 6.0, z: 0.0 },
    { elem: 'O', x: -2.1, y: 6.0, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: 2.1, y: -0.7, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'H', x: -1.4, y: 5.35, z: 0.0 },
    { elem: 'H', x: 0.0, y: 5.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 2.4, z: 0.0 },
    { elem: 'H', x: 3.15, y: 3.6, z: 0.0 },
    { elem: 'H', x: 3.15, y: 6.0, z: 0.0 },
    { elem: 'H', x: 0.7, y: 7.75, z: 0.0 },
    { elem: 'H', x: -0.7, y: 7.75, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: 0.7, y: 6.0, z: 0.8 },
    { x: -0.7, y: 6.0, z: 0.8 },
    { x: -2.1, y: 6.0, z: 0.8 }
  ]
},

C9H13N: {
  name: "Phénéthylamine",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: 2.8, y: -1.2, z: 0.0 },
    { elem: 'N', x: 3.5, y: -2.4, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 3.5, y: -0.65, z: 0.88 },
    { elem: 'H', x: 3.5, y: -0.65, z: -0.88 },
    { elem: 'H', x: 4.5, y: -2.4, z: 0.0 },
    { elem: 'H', x: 3.0, y: -3.35, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: 3.5, y: -2.4, z: 0.8 }
  ]
},

C10H14N2: {
  name: "Nicotine",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'N', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'N', x: -2.1, y: 3.6, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: -2.1, y: -0.7, z: 0.0 },
    { elem: 'H', x: -3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: -1.4, y: 4.55, z: 0.0 },
    { elem: 'H', x: -3.15, y: 3.6, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -1.4, y: 0.0, z: 0.8 },
    { x: -2.1, y: 3.6, z: 0.8 }
  ]
},

C20H25N3O: {
  name: "LSD",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'N', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'N', x: -2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: -3.5, y: 3.6, z: 0.0 },
    { elem: 'C', x: -4.2, y: 4.8, z: 0.0 },
    { elem: 'C', x: -3.5, y: 6.0, z: 0.0 },
    { elem: 'C', x: -2.1, y: 6.0, z: 0.0 },
    { elem: 'N', x: -1.4, y: 7.2, z: 0.0 },
    { elem: 'O', x: -0.7, y: 8.4, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: -2.1, y: -0.7, z: 0.0 },
    { elem: 'H', x: -3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: -1.4, y: 4.55, z: 0.0 },
    { elem: 'H', x: -3.15, y: 3.6, z: 0.0 },
    { elem: 'H', x: -4.2, y: 2.4, z: 0.0 },
    { elem: 'H', x: -5.3, y: 4.8, z: 0.0 },
    { elem: 'H', x: -3.5, y: 7.55, z: 0.0 },
    { elem: 'H', x: -2.1, y: 7.55, z: 0.0 },
    { elem: 'H', x: -1.4, y: 9.35, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -1.4, y: 0.0, z: 0.8 },
    { x: -2.1, y: 3.6, z: 0.8 },
    { x: -0.7, y: 8.4, z: 0.8 }
  ]
},

C7H5N3O6: {
  name: "TNT (Trinitrotoluène)",
  atomList: [
    // Cycle benzénique (plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Groupe méthyle CH3 avec géométrie tétraédrique
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -1.4, y: -0.4, z: 0.89 },
    { elem: 'H', x: -1.76, y: 0.8, z: -0.44 },
    { elem: 'H', x: -1.04, y: 0.8, z: -0.44 },
    // Groupes NO2
    { elem: 'N', x: -2.1, y: 1.21, z: 0.0 },
    { elem: 'O', x: -3.2, y: 1.21, z: 0.0 },
    { elem: 'O', x: -1.6, y: 2.2, z: 0.0 },
    { elem: 'N', x: 2.8, y: -1.2, z: 0.0 },
    { elem: 'O', x: 3.6, y: -2.2, z: 0.0 },
    { elem: 'O', x: 2.4, y: -1.6, z: 0.0 },
    { elem: 'N', x: 2.1, y: 3.6, z: 0.0 },
    { elem: 'O', x: 3.2, y: 3.6, z: 0.0 },
    { elem: 'O', x: 1.6, y: 4.5, z: 0.0 },
    // Hydrogènes du cycle (2 seulement - un remplacé par CH3)
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -3.2, y: 1.21, z: 0.8 },
    { x: -1.6, y: 2.2, z: 0.8 },
    { x: 3.6, y: -2.2, z: 0.8 },
    { x: 2.4, y: -1.6, z: 0.8 },
    { x: 3.2, y: 3.6, z: 0.8 },
    { x: 1.6, y: 4.5, z: 0.8 }
  ]
},

C6H6O: {
  name: "Phénol",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'O', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: -2.4, y: 2.4, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -1.4, y: 2.4, z: 0.8 }
  ]
},

C6H5NO2: {
  name: "Nitrobenzène",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'N', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'O', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'O', x: -1.4, y: -1.2, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -2.1, y: 1.2, z: 0.8 },
    { x: -1.4, y: -1.2, z: 0.8 }
  ]
},

C8H8: {
  name: "Styrène",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: -2.1, y: 2.85, z: 0.0 },
    { elem: 'H', x: -3.15, y: 0.75, z: 0.0 },
    { elem: 'H', x: -2.1, y: -0.45, z: 0.88 },
    { elem: 'H', x: -2.1, y: -0.45, z: -0.88 },
  ],
  hasLonePairs: false,
  hasTetrahedron: false,
},

C10H8: {
  name: "Naphtalène",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: -2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: -1.4, y: 4.8, z: 0.0 },
    { elem: 'C', x: 0.0, y: 4.8, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 2.1, y: 3.6, z: 0.0 },
    { elem: 'H', x: 0.7, y: 5.35, z: 0.0 },
    { elem: 'H', x: -1.4, y: 5.35, z: 0.0 },
    { elem: 'H', x: -3.15, y: 3.6, z: 0.0 },
    { elem: 'H', x: -2.1, y: 1.2, z: 0.0 },
  ],
  hasLonePairs: false,
  hasTetrahedron: false,
},

C14H10: {
  name: "Anthracène",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: -2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: -1.4, y: 4.8, z: 0.0 },
    { elem: 'C', x: 0.0, y: 4.8, z: 0.0 },
    { elem: 'C', x: 0.7, y: 3.6, z: 0.0 },
    { elem: 'C', x: 2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: 2.8, y: 4.8, z: 0.0 },
    { elem: 'C', x: 2.1, y: 6.0, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 3.15, y: 3.6, z: 0.0 },
    { elem: 'H', x: 2.1, y: 7.55, z: 0.0 },
    { elem: 'H', x: 0.7, y: 5.35, z: 0.0 },
    { elem: 'H', x: -1.4, y: 5.35, z: 0.0 },
    { elem: 'H', x: -3.15, y: 3.6, z: 0.0 },
    { elem: 'H', x: -2.1, y: 1.2, z: 0.0 },
  ],
  hasLonePairs: false,
  hasTetrahedron: false,
},

C10H16: {
  name: "Camphre",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: -2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: -1.4, y: 4.8, z: 0.0 },
    { elem: 'C', x: 0.0, y: 4.8, z: 0.0 },
    { elem: 'O', x: 0.7, y: 6.0, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: 2.1, y: -0.7, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 2.1, y: 3.6, z: 0.0 },
    { elem: 'H', x: 0.7, y: 3.6, z: 0.0 },
    { elem: 'H', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'H', x: -1.4, y: 5.35, z: 0.0 },
    { elem: 'H', x: 0.7, y: 5.35, z: 0.0 },
    { elem: 'H', x: -3.15, y: 3.6, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: 0.7, y: 6.0, z: 0.8 }
  ]
},

C10H16O: {
  name: "Menthol",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: -2.1, y: 3.6, z: 0.0 },
    { elem: 'C', x: -1.4, y: 4.8, z: 0.0 },
    { elem: 'C', x: 0.0, y: 4.8, z: 0.0 },
    { elem: 'O', x: 0.7, y: 6.0, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: 2.1, y: -0.7, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 2.1, y: 3.6, z: 0.0 },
    { elem: 'H', x: 0.7, y: 3.6, z: 0.0 },
    { elem: 'H', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'H', x: -1.4, y: 5.35, z: 0.0 },
    { elem: 'H', x: 0.7, y: 5.35, z: 0.0 },
    { elem: 'H', x: -3.15, y: 3.6, z: 0.0 },
    { elem: 'H', x: 1.4, y: 7.55, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: 0.7, y: 6.0, z: 0.8 }
  ]
},

C7H6O: { // NOTE: User wrote C7H6O2 (Benzoic acid) but described Benzaldehyde (C7H6O)
    name: "Benzaldéhyde (C7H6O)",
    atomList: [
      // Hexagonal Ring
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0 }, // C1
      { elem: 'C', x: 1.4, y: 0.0, z: 0.0 }, // C2
      { elem: 'C', x: 2.1, y: 1.21, z: 0.0 }, // C3
      { elem: 'C', x: 1.4, y: 2.42, z: 0.0 }, // C4
      { elem: 'C', x: 0.0, y: 2.42, z: 0.0 }, // C5
      { elem: 'C', x: -0.7, y: 1.21, z: 0.0 }, // C6
      // Aldehyde Group attached to C6
      { elem: 'C', x: -2.2, y: 1.21, z: 0.0 }, // Carbonyl C
      { elem: 'O', x: -2.9, y: 1.8, z: 0.0 },  // Carbonyl O
      { elem: 'H', x: -2.7, y: 0.3, z: 0.0 },  // Aldehyde H
      // Ring Hydrogens
      { elem: 'H', x: -0.5, y: -0.9, z: 0.0 }, // H on C1
      { elem: 'H', x: 1.9, y: -0.9, z: 0.0 },  // H on C2
      { elem: 'H', x: 3.2, y: 1.21, z: 0.0 },  // H on C3
      { elem: 'H', x: 1.9, y: 3.3, z: 0.0 },   // H on C4
      { elem: 'H', x: -0.5, y: 3.3, z: 0.0 },  // H on C5
    ],
    hasLonePairs: true,
    hasTetrahedron: false, // Planar
    lonePairs: [
      { x: -2.9, y: 1.8, z: 0.8 }, // Lone pair 1 (sticks up)
      { x: -2.9, y: 1.8, z: -0.8 } // Lone pair 2 (sticks down)
    ]
  },
C12H22O11: {
    name: "Saccharose (Sucre de table)",
    atomList: [
      // --- GLUCOSE UNIT (C6H11O5) ---
      // Ring (Pyranose-like)
      { elem: 'O', x: -1.0, y: 0.5, z: 0.0 }, // O5 (Ring oxygen)
      { elem: 'C', x: -1.0, y: -0.5, z: 0.5 }, // C1 (Anomeric) - Connects to bridge
      { elem: 'C', x: -2.0, y: -1.0, z: 0.0 }, // C2
      { elem: 'C', x: -3.0, y: -0.5, z: 0.0 }, // C3
      { elem: 'C', x: -3.0, y: 0.5, z: 0.0 },  // C4
      { elem: 'C', x: -2.0, y: 1.0, z: 0.0 },  // C5
      // CH2OH group on Glucose
      { elem: 'C', x: -2.0, y: 2.0, z: 0.5 },  // C6
      { elem: 'O', x: -2.0, y: 2.5, z: -0.5 }, // O6
      // Hydroxyls on Glucose
      { elem: 'O', x: -2.0, y: -1.8, z: 0.5 }, // O2
      { elem: 'O', x: -3.5, y: -1.0, z: 0.5 }, // O3
      { elem: 'O', x: -3.5, y: 1.0, z: 0.5 },  // O4
      // Hydrogens on Glucose Carbons
      { elem: 'H', x: -0.6, y: -0.5, z: 1.2 }, // H on C1
      { elem: 'H', x: -2.0, y: -1.0, z: -1.1 }, // H on C2
      { elem: 'H', x: -3.0, y: -0.5, z: -1.1 }, // H on C3
      { elem: 'H', x: -3.0, y: 0.5, z: -1.1 }, // H on C4
      { elem: 'H', x: -1.5, y: 1.0, z: -0.8 }, // H on C5
      { elem: 'H', x: -1.5, y: 2.0, z: 1.2 },  // H on C6
      { elem: 'H', x: -2.5, y: 2.0, z: 1.2 },  // H on C6
      // Hydrogens on Glucose Hydroxyls
      { elem: 'H', x: -2.4, y: 2.8, z: -0.8 }, // H on O6
      { elem: 'H', x: -2.0, y: -2.2, z: -0.2 }, // H on O2
      { elem: 'H', x: -4.0, y: -0.7, z: 0.8 }, // H on O3
      { elem: 'H', x: -4.0, y: 1.3, z: 0.2 },  // H on O4

      // --- LINKAGE ---
      { elem: 'O', x: 0.0, y: 0.0, z: 0.0 },   // Bridge Oxygen (Glycosidic)

      // --- FRUCTOSE UNIT (C6H11O5) ---
      // Ring (Furanose-like)
      { elem: 'C', x: 1.0, y: -0.5, z: 0.5 },  // C2 (Anomeric) - Connects to bridge
      { elem: 'O', x: 1.0, y: 0.5, z: 0.0 },   // O2 (Ring oxygen)
      { elem: 'C', x: 2.0, y: 1.0, z: 0.0 },   // C5
      { elem: 'C', x: 3.0, y: 0.0, z: 0.0 },   // C4
      { elem: 'C', x: 2.0, y: -1.0, z: -0.5 }, // C3
      // CH2OH on Fructose C2 (Position 1)
      { elem: 'C', x: 1.0, y: -1.5, z: 1.0 },  // C1'
      { elem: 'O', x: 1.5, y: -2.5, z: 0.5 },  // O1'
      // CH2OH on Fructose C5 (Position 6)
      { elem: 'C', x: 2.0, y: 2.0, z: 0.5 },   // C6'
      { elem: 'O', x: 2.5, y: 2.8, z: -0.2 },  // O6'
      // Hydroxyls on Fructose Ring
      { elem: 'O', x: 2.0, y: -1.8, z: -1.2 }, // O3
      { elem: 'O', x: 3.8, y: 0.0, z: 0.8 },   // O4
      // Hydrogens on Fructose Carbons
      { elem: 'H', x: 2.5, y: -0.8, z: -1.3 }, // H on C3
      { elem: 'H', x: 3.4, y: 0.0, z: -1.0 },  // H on C4
      { elem: 'H', x: 1.5, y: 1.0, z: -0.9 },  // H on C5
      { elem: 'H', x: 0.0, y: -1.5, z: 1.0 },  // H on C1'
      { elem: 'H', x: 1.4, y: -1.5, z: 2.0 },  // H on C1'
      { elem: 'H', x: 1.0, y: 2.0, z: 0.8 },   // H on C6'
      { elem: 'H', x: 2.6, y: 1.8, z: 1.2 },   // H on C6'
      // Hydrogens on Fructose Hydroxyls
      { elem: 'H', x: 2.0, y: -3.0, z: 0.8 },  // H on O1'
      { elem: 'H', x: 3.2, y: 3.2, z: 0.2 },   // H on O6'
      { elem: 'H', x: 2.5, y: -1.5, z: -1.8 }, // H on O3
      { elem: 'H', x: 4.2, y: 0.8, z: 0.6 },   // H on O4
    ],
    hasLonePairs: true,
    hasTetrahedron: false,
    lonePairs: [
      { x: 0.0, y: 0.0, z: 1.0 }, // Sur l'oxygène du pont
      { x: -1.0, y: 0.5, z: 0.8 }, // Sur l'oxygène du cycle Glucose
      { x: 1.0, y: 0.5, z: 0.8 }   // Sur l'oxygène du cycle Fructose
    ]
  },
C6H5NH2: {
  name: "Aniline",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'N', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: -2.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -1.4, y: -0.7, z: 0.88 },
    { elem: 'H', x: -1.4, y: -0.7, z: -0.88 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -1.4, y: 0.0, z: 0.8 }
  ]
},

C6H5Cl: {
  name: "Chlorobenzène",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'Cl', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -1.4, y: 1.0, z: 0.6 },
    { x: -1.4, y: -0.5, z: 0.87 },
    { x: -1.4, y: -0.5, z: -0.87 }
  ]
},

C6H5Br: {
  name: "Bromobenzène",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'Br', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -1.4, y: 1.0, z: 0.6 },
    { x: -1.4, y: -0.5, z: 0.87 },
    { x: -1.4, y: -0.5, z: -0.87 }
  ]
},

C6H5I: {
  name: "Iodobenzène",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'I', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -1.4, y: 1.0, z: 0.6 },
    { x: -1.4, y: -0.5, z: 0.87 },
    { x: -1.4, y: -0.5, z: -0.87 }
  ]
},

C6H5OH: {
  name: "Phénol",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'O', x: -1.4, y: 2.4, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: -2.4, y: 2.4, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -1.4, y: 2.4, z: 0.8 }
  ]
},

C6H5CHO: {
  name: "Benzaldéhyde",
  atomList: [
    // Cycle benzénique (plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Groupe aldéhyde CHO (plan)
    { elem: 'C', x: -1.54, y: 0.0, z: 0.0 },
    { elem: 'O', x: -2.4, y: 0.75, z: 0.0 },
    { elem: 'H', x: -1.8, y: -0.9, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [{ x: -2.4, y: 0.75, z: 0.8 }]
},

C6H5COOH: {
  name: "Acide benzoïque",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'O', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'O', x: -1.4, y: -1.2, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: -2.4, y: -1.2, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -2.1, y: 1.2, z: 0.8 },
    { x: -1.4, y: -1.2, z: 0.8 }
  ]
},

C6H5CH3: {
  name: "Toluène",
  atomList: [
    // Cycle benzénique (6 carbones, plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Groupe méthyle CH3 avec géométrie tétraédrique
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -1.4, y: -0.4, z: 0.89 },
    { elem: 'H', x: -1.76, y: 0.8, z: -0.44 },
    { elem: 'H', x: -1.04, y: 0.8, z: -0.44 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
  ],
  hasLonePairs: false,
  hasTetrahedron: false,
},

C6H5CH2CH3: {
  name: "Éthylbenzène",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: -2.1, y: 2.85, z: 0.0 },
    { elem: 'H', x: -3.15, y: 0.75, z: 0.0 },
    { elem: 'H', x: -2.1, y: -0.45, z: 0.88 },
    { elem: 'H', x: -2.1, y: -0.45, z: -0.88 },
  ],
  hasLonePairs: false,
  hasTetrahedron: false,
},

C6H5CH2Cl: {
  name: "Chlorure de benzyle",
  atomList: [
    // Cycle benzénique (6 carbones, plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Groupe CH2Cl avec géométrie tétraédrique
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -1.4, y: -0.4, z: 0.89 },
    { elem: 'H', x: -1.4, y: -0.4, z: -0.89 },
    { elem: 'Cl', x: -2.4, y: 0.8, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -2.1, y: 1.0, z: 0.6 },
    { x: -2.1, y: -0.5, z: 0.87 },
    { x: -2.1, y: -0.5, z: -0.87 }
  ]
},

C6H5CH2Br: {
  name: "Bromure de benzyle",
  atomList: [
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'Br', x: -2.1, y: 1.2, z: 0.0 },
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: -1.4, y: -0.7, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -2.1, y: 1.0, z: 0.6 },
    { x: -2.1, y: -0.5, z: 0.87 },
    { x: -2.1, y: -0.5, z: -0.87 }
  ]
},

C6H5CH2I: {
  name: "Iodure de benzyle",
  atomList: [
    // Cycle benzénique (6 carbones, plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Groupe CH2I avec géométrie tétraédrique
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -1.4, y: -0.4, z: 0.89 },
    { elem: 'H', x: -1.4, y: -0.4, z: -0.89 },
    { elem: 'I', x: -2.6, y: 0.8, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -2.1, y: 1.0, z: 0.6 },
    { x: -2.1, y: -0.5, z: 0.87 },
    { x: -2.1, y: -0.5, z: -0.87 }
  ]
},

C6H5CH2NH2: {
  name: "Benzylamine",
  atomList: [
    // Cycle benzénique (plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Groupe CH2-NH2 avec géométrie tétraédrique
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -1.4, y: -0.4, z: 0.89 },
    { elem: 'H', x: -1.4, y: -0.4, z: -0.89 },
    { elem: 'N', x: -2.4, y: 0.8, z: 0.0 },
    { elem: 'H', x: -3.0, y: 0.4, z: 0.0 },
    { elem: 'H', x: -2.4, y: 1.8, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [{ x: -2.8, y: 0.8, z: 0.8 }]
},
C9H10O2: {
  name: "Acide phénylpropanoïque",
  atomList: [
    // Cycle benzénique (6 carbones)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.2, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.4, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.4, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.2, z: 0.0 },
    // Chaîne CH2-CH2 (2 carbones)
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: -2.8, y: 0.0, z: 0.0 },
    // Groupe carboxyle (1 carbone)
    { elem: 'C', x: -4.2, y: 0.0, z: 0.0 },
    { elem: 'O', x: -4.9, y: -0.94, z: 0.0 },
    { elem: 'O', x: -4.9, y: 0.94, z: 0.0 },
    // Hydrogènes (10)
    { elem: 'H', x: -0.7, y: 3.35, z: 0.0 },
    { elem: 'H', x: 1.4, y: 3.35, z: 0.0 },
    { elem: 'H', x: 3.15, y: 1.2, z: 0.0 },
    { elem: 'H', x: 1.4, y: -0.7, z: 0.0 },
    { elem: 'H', x: -0.7, y: -0.7, z: 0.0 },
    { elem: 'H', x: -1.4, y: -0.7, z: 0.88 },
    { elem: 'H', x: -1.4, y: -0.7, z: -0.88 },
    { elem: 'H', x: -2.8, y: 0.94, z: 0.0 },
    { elem: 'H', x: -2.8, y: -0.47, z: 0.82 },
    { elem: 'H', x: -2.8, y: -0.47, z: -0.82 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -4.9, y: -0.94, z: 0.8 },
    { x: -4.9, y: 0.94, z: 0.8 }
  ]
},

C6H5CH2CHO: {
  name: "Phénylacétaldéhyde",
  atomList: [
    // Cycle benzénique (plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Groupe CH2-CHO
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -1.4, y: -0.4, z: 0.89 },
    { elem: 'H', x: -1.4, y: -0.4, z: -0.89 },
    { elem: 'C', x: -2.4, y: 0.8, z: 0.0 },
    { elem: 'O', x: -3.4, y: 0.4, z: 0.0 },
    { elem: 'H', x: -2.2, y: 1.9, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [{ x: -3.4, y: 0.4, z: 0.8 }]
},

C6H5CH2COOH: {
  name: "Acide phénylacétique",
  atomList: [
    // Cycle benzénique (plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Groupe CH2-COOH
    { elem: 'C', x: -1.4, y: 0.0, z: 0.0 },
    { elem: 'H', x: -1.4, y: -0.4, z: 0.89 },
    { elem: 'H', x: -1.4, y: -0.4, z: -0.89 },
    { elem: 'C', x: -2.4, y: 0.8, z: 0.0 },
    { elem: 'O', x: -3.4, y: 0.4, z: 0.0 },
    { elem: 'O', x: -2.2, y: 2.0, z: 0.0 },
    { elem: 'H', x: -2.8, y: 2.4, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [
    { x: -3.4, y: 0.4, z: 0.8 },
    { x: -2.2, y: 2.0, z: 0.8 }
  ]
},

C6H5CH2CH2OH: {
  name: "Phényléthanol",
  atomList: [
    // Cycle benzénique (6 carbones, plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Chaîne CH2-CH2-OH avec géométrie tétraédrique
    { elem: 'C', x: -1.47, y: 2.54, z: 0.0 },
    { elem: 'H', x: -1.07, y: 2.84, z: 0.89 },
    { elem: 'H', x: -1.87, y: 2.84, z: -0.89 },
    { elem: 'C', x: -2.24, y: 3.87, z: 0.0 },
    { elem: 'H', x: -1.84, y: 4.17, z: 0.89 },
    { elem: 'H', x: -2.64, y: 4.17, z: -0.89 },
    { elem: 'O', x: -2.54, y: 5.07, z: 0.0 },
    { elem: 'H', x: -2.54, y: 6.03, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
    { elem: 'H', x: -1.4, y: 1.21, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [{ x: -2.54, y: 5.2, z: 0.8 }]
},

C6H5CH2CH2NH2: {
  name: "Phénéthylamine",
  atomList: [
    // Cycle benzénique (6 carbones, plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Chaîne CH2-CH2-NH2 avec géométrie tétraédrique
    { elem: 'C', x: -1.47, y: 2.54, z: 0.0 },
    { elem: 'H', x: -1.07, y: 2.84, z: 0.89 },
    { elem: 'H', x: -1.87, y: 2.84, z: -0.89 },
    { elem: 'C', x: -2.24, y: 3.87, z: 0.0 },
    { elem: 'H', x: -1.84, y: 4.17, z: 0.89 },
    { elem: 'H', x: -2.64, y: 4.17, z: -0.89 },
    { elem: 'N', x: -2.54, y: 5.07, z: 0.0 },
    { elem: 'H', x: -2.54, y: 6.03, z: 0.0 },
    { elem: 'H', x: -3.24, y: 4.77, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
    { elem: 'H', x: -1.4, y: 1.21, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [{ x: -2.24, y: 5.2, z: 0.8 }]
},

"CRESOL": {
  name: "Crésol",
  atomList: [
    // Cycle benzénique (6 carbones, plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Groupe méthyle (-CH3) sur C2 - géométrie tétraédrique
    { elem: 'C', x: 2.8, y: -1.2, z: 0.0 },
    { elem: 'H', x: 3.5, y: -1.2, z: 0.89 },
    { elem: 'H', x: 2.45, y: -0.4, z: -0.89 },
    { elem: 'H', x: 2.45, y: -2.0, z: -0.89 },
    // Groupe hydroxyle (-OH) sur C6
    { elem: 'O', x: -1.4, y: 2.42, z: 0.0 },
    { elem: 'H', x: -2.0, y: 3.2, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [{ x: -1.4, y: 2.82, z: 0.8 }]
},
C7H8O: {
  name: "Alcool benzylique",
  atomList: [
    // Cycle benzénique (6 carbones, plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Groupe CH2OH - géométrie tétraédrique
    { elem: 'C', x: -1.54, y: 0.0, z: 0.0 },
    { elem: 'H', x: -1.54, y: 0.4, z: 0.89 },
    { elem: 'H', x: -1.54, y: -0.4, z: -0.89 },
    { elem: 'O', x: -2.78, y: 0.71, z: 0.0 },
    { elem: 'H', x: -3.08, y: 1.61, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
    { elem: 'H', x: -1.4, y: 1.21, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [{ x: -2.78, y: 1.31, z: 0.8 }]
},

C6H5CH2CH2CH3: {
  name: "Propylbenzène",
  atomList: [
    // Cycle benzénique (6 carbones, plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Chaîne CH2-CH2-CH3 avec géométrie tétraédrique
    { elem: 'C', x: -1.47, y: 2.54, z: 0.0 },
    { elem: 'H', x: -1.07, y: 2.84, z: 0.89 },
    { elem: 'H', x: -1.87, y: 2.84, z: -0.89 },
    { elem: 'C', x: -2.24, y: 3.87, z: 0.0 },
    { elem: 'H', x: -1.84, y: 4.17, z: 0.89 },
    { elem: 'H', x: -2.64, y: 4.17, z: -0.89 },
    { elem: 'C', x: -3.01, y: 5.2, z: 0.0 },
    { elem: 'H', x: -3.01, y: 5.6, z: 0.89 },
    { elem: 'H', x: -3.36, y: 5.0, z: 0.89 },
    { elem: 'H', x: -2.66, y: 5.0, z: -0.89 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
    { elem: 'H', x: -1.4, y: 1.21, z: 0.0 },
  ],
  hasLonePairs: false,
  hasTetrahedron: false,
},

C6H5CH2CH2CH2OH: {
  name: "Phénylpropanol",
  atomList: [
    // Cycle benzénique (6 carbones, plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Chaîne CH2-CH2-CH2-OH avec géométrie tétraédrique
    { elem: 'C', x: -1.47, y: 2.54, z: 0.0 },
    { elem: 'H', x: -1.07, y: 2.84, z: 0.89 },
    { elem: 'H', x: -1.87, y: 2.84, z: -0.89 },
    { elem: 'C', x: -2.24, y: 3.87, z: 0.0 },
    { elem: 'H', x: -1.84, y: 4.17, z: 0.89 },
    { elem: 'H', x: -2.64, y: 4.17, z: -0.89 },
    { elem: 'C', x: -3.01, y: 5.2, z: 0.0 },
    { elem: 'H', x: -2.61, y: 5.5, z: 0.89 },
    { elem: 'H', x: -3.41, y: 5.5, z: -0.89 },
    { elem: 'O', x: -3.78, y: 6.4, z: 0.0 },
    { elem: 'H', x: -3.78, y: 7.36, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
    { elem: 'H', x: -1.4, y: 1.21, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [{ x: -3.78, y: 6.53, z: 0.8 }]
},

C6H5CH2CH2CH2NH2: {
  name: "Phénylpropylamine",
  atomList: [
    // Cycle benzénique (6 carbones, plan z=0)
    { elem: 'C', x: 0.0, y: 0.0, z: 0.0 },
    { elem: 'C', x: 1.4, y: 0.0, z: 0.0 },
    { elem: 'C', x: 2.1, y: 1.21, z: 0.0 },
    { elem: 'C', x: 1.4, y: 2.42, z: 0.0 },
    { elem: 'C', x: 0.0, y: 2.42, z: 0.0 },
    { elem: 'C', x: -0.7, y: 1.21, z: 0.0 },
    // Chaîne CH2-CH2-CH2-NH2 avec géométrie tétraédrique
    { elem: 'C', x: -1.47, y: 2.54, z: 0.0 },
    { elem: 'H', x: -1.07, y: 2.84, z: 0.89 },
    { elem: 'H', x: -1.87, y: 2.84, z: -0.89 },
    { elem: 'C', x: -2.24, y: 3.87, z: 0.0 },
    { elem: 'H', x: -1.84, y: 4.17, z: 0.89 },
    { elem: 'H', x: -2.64, y: 4.17, z: -0.89 },
    { elem: 'C', x: -3.01, y: 5.2, z: 0.0 },
    { elem: 'H', x: -2.61, y: 5.5, z: 0.89 },
    { elem: 'H', x: -3.41, y: 5.5, z: -0.89 },
    { elem: 'N', x: -3.78, y: 6.4, z: 0.0 },
    { elem: 'H', x: -3.78, y: 7.36, z: 0.0 },
    { elem: 'H', x: -4.48, y: 6.1, z: 0.0 },
    // Hydrogènes du cycle
    { elem: 'H', x: -0.6, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.0, y: -0.35, z: 0.0 },
    { elem: 'H', x: 2.8, y: 1.21, z: 0.0 },
    { elem: 'H', x: 2.0, y: 2.77, z: 0.0 },
    { elem: 'H', x: -0.6, y: 2.77, z: 0.0 },
    { elem: 'H', x: -1.4, y: 1.21, z: 0.0 },
  ],
  hasLonePairs: true,
  hasTetrahedron: false,
  lonePairs: [{ x: -3.48, y: 6.53, z: 0.8 }]
},
};

const generateXYZ = (formula: string, atoms: Atom3D[]): string => {
  const lines = [atoms.length.toString(), formula];
  atoms.forEach(atom => {
    lines.push(`${atom.elem} ${atom.x.toFixed(4)} ${atom.y.toFixed(4)} ${atom.z.toFixed(4)}`);
  });
  return lines.join('\n');
};

let mol3dLoadPromise: Promise<void> | null = null;

const load3Dmol = (): Promise<void> => {
  if (mol3dLoadPromise) return mol3dLoadPromise;
  if ((window as any).$3Dmol) return Promise.resolve();

  mol3dLoadPromise = new Promise((resolve) => {
    if (document.getElementById('3dmol-script')) {
      const check = setInterval(() => {
        if ((window as any).$3Dmol) { clearInterval(check); resolve(); }
      }, 50);
      return;
    }
    const script = document.createElement('script');
    script.id = '3dmol-script';
    script.src = 'https://3Dmol.org/build/3Dmol-min.js';
    script.async = true;
    script.onload = () => {
      const check = setInterval(() => {
        if ((window as any).$3Dmol) { clearInterval(check); resolve(); }
      }, 50);
    };
    document.head.appendChild(script);
  });
  return mol3dLoadPromise;
};

export function Molecule3DmolVSEPREmbed({ 
  formula = 'H2O', 
  height = '400px',
  credits,
  controls = true
}: Molecule3DmolVSEPREmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('ballstick');
  const [labelSize, setLabelSize] = useState<LabelSize>('off');
  const [showLonePairs, setShowLonePairs] = useState(false);
  const [showGeometry, setShowGeometry] = useState(false);

  const config = MOLECULES[formula.toUpperCase()];

  const applyDisplayStyle = useCallback(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    switch (displayMode) {
      case 'spacefill':
        viewer.setStyle({}, { sphere: { scale: 1.0 } });
        break;
      case 'ballstick':
        viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.3 } });
        break;
      case 'ball':
        viewer.setStyle({}, { sphere: { scale: 0.5 } });
        break;
      case 'stick':
        viewer.setStyle({}, { stick: { radius: 0.2 } });
        break;
      case 'lines':
        viewer.setStyle({}, { line: {} });
        break;
      case 'off':
        viewer.setStyle({}, {});
        break;
    }
  }, [displayMode]);

  const applyLabels = useCallback(() => {
    if (!viewerRef.current || !config) return;
    const viewer = viewerRef.current;

    viewer.removeAllLabels();

    if (labelSize !== 'off') {
      const fontSize = { S: 10, M: 14, L: 18, XL: 24, XXL: 32 }[labelSize];
      
      config.atomList.forEach((atom) => {
        viewer.addLabel(atom.elem, {
          position: { x: atom.x, y: atom.y, z: atom.z },
          backgroundColor: 'rgba(0,0,0,0.6)',
          fontColor: 'white',
          fontSize: fontSize,
          borderThickness: 0,
          borderRadius: 2,
          inFront: true,
        });
      });
    }
  }, [labelSize, config]);

  const applyShapes = useCallback(() => {
    if (!viewerRef.current || !config) return;
    const viewer = viewerRef.current;
    
    // 1. Nettoyage complet
    viewer.removeAllShapes();

    const centralAtom = config.atomList[0];

    // --- CONSTRUCTION DES LOBES (DOUBLETS NON-LIANTS) ---
    // On veut une forme d'"ampoule" ou de "goutte" connectée à l'atome.
    // Technique : Superposition de sphères de rayons croissants + cylindre de base.
    if (showLonePairs && config.lonePairs) {
      const lobeColor = '#87CEEB'; // Bleu ciel classique pour les doublets
      const lobeAlpha = 0.5;       // Transparence pour voir la géométrie au travers

      config.lonePairs.forEach((lp) => {
        const start = { x: centralAtom.x, y: centralAtom.y, z: centralAtom.z };
        const end = { x: lp.x, y: lp.y, z: lp.z };

        // A. La Base (Cylindre évasé) : Connecte le noyau au début du lobe
        viewer.addCylinder({
          start: start,
          end: {
            x: start.x + (end.x - start.x) * 0.4,
            y: start.y + (end.y - start.y) * 0.4,
            z: start.z + (end.z - start.z) * 0.4
          },
          radius: 0.25, // Assez large pour faire "partie" du lobe
          color: lobeColor,
          alpha: lobeAlpha,
          clickable: false,
        });

        // B. Le Corps de l'ampoule : 3 sphères qui grandissent pour faire une goutte
        // Sphère 1 (proche noyau)
        viewer.addSphere({
          center: { 
            x: start.x + (end.x - start.x) * 0.35,
            y: start.y + (end.y - start.y) * 0.35,
            z: start.z + (end.z - start.z) * 0.35
          },
          radius: 0.35,
          color: lobeColor,
          alpha: lobeAlpha,
          clickable: false,
        });

        // Sphère 2 (milieu)
        viewer.addSphere({
          center: { 
            x: start.x + (end.x - start.x) * 0.65,
            y: start.y + (end.y - start.y) * 0.65,
            z: start.z + (end.z - start.z) * 0.65
          },
          radius: 0.50,
          color: lobeColor,
          alpha: lobeAlpha,
          clickable: false,
        });

        // Sphère 3 (bout/ampoule)
        viewer.addSphere({
          center: end,
          radius: 0.65,
          color: lobeColor,
          alpha: lobeAlpha,
          clickable: false,
        });
      });
    }

    // --- GÉOMÉTRIE (TETRAÈDRE) ---
    // Doit être visible même avec les lobes (mixage)
    if (showGeometry && config.hasTetrahedron) {
      const atoms = config.atomList.slice(1);
      
      const vertices = [...atoms];
      if (showLonePairs && config.lonePairs) {
        config.lonePairs.forEach(lp => vertices.push(lp));
      }
      
      if (vertices.length >= 3) {
        // 1. Rayons (Centre -> Sommets)
        vertices.forEach((vertex) => {
          viewer.addCylinder({
            start: { x: centralAtom.x, y: centralAtom.y, z: centralAtom.z },
            end: { x: vertex.x, y: vertex.y, z: vertex.z },
            radius: 0.03, // Un peu plus épais pour être vu dans le lobe
            color: '#FF8C00', // Orange foncé
            alpha: 1.0,       // Opaque pour contraster avec le lobe transparent
            clickable: false,
            dashed: true,
          });
        });
        
        // 2. Arêtes (Sommet -> Sommet)
        for (let i = 0; i < vertices.length; i++) {
          for (let j = i + 1; j < vertices.length; j++) {
            viewer.addCylinder({
              start: { x: vertices[i].x, y: vertices[i].y, z: vertices[i].z },
              end: { x: vertices[j].x, y: vertices[j].y, z: vertices[j].z },
              radius: 0.03,
              color: '#FFA500', 
              alpha: 0.8,
              clickable: false,
            });
          }
        }
      }
    }
    
    viewer.render();
  }, [config, showLonePairs, showGeometry]);

  const renderMolecule = useCallback(() => {
    if (!viewerRef.current || !config) return;
    applyDisplayStyle();
    applyLabels();
    applyShapes();
    viewerRef.current.render();
  }, [applyDisplayStyle, applyLabels, applyShapes]);

  useEffect(() => {
    if (!config) { setIsLoading(false); return; }
    let isMounted = true;

    const init = async () => {
      await load3Dmol();
      if (!isMounted || !containerRef.current) return;

      const $3Dmol = (window as any).$3Dmol;
      if (!$3Dmol) { setIsLoading(false); return; }

      try {
        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: 'white',
          defaultcolors: $3Dmol.rasmolElementColors,
        });
        
        if (!viewer) throw new Error('Failed to create viewer');
        
        viewerRef.current = viewer;

        const xyz = generateXYZ(formula, config.atomList);
        viewer.addModel(xyz, 'xyz');
        viewer.zoomTo();
        
        setIsLoading(false);
        renderMolecule();
        
      } catch (e) {
        console.error('3Dmol error:', e);
        setIsLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, [formula, config, renderMolecule]);

  useEffect(() => {
    if (viewerRef.current && !isLoading) {
      renderMolecule();
    }
  }, [displayMode, labelSize, showLonePairs, showGeometry, isLoading, renderMolecule]);

  if (!config) {
    return (
      <div className="w-full rounded-lg bg-red-50 text-red-600 text-sm p-4" style={{ height }}>
        Molécule "{formula}" non disponible
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: controls ? 'auto' : height }}>
      <div className="relative bg-white" style={{ height: controls ? height : '100%' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
        {credits && !controls && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/90 px-2 py-1 rounded">
            {credits}
          </div>
        )}
      </div>

      {controls && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 space-y-2">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs font-medium text-gray-600 mr-1">Display:</span>
            {(['spacefill', 'ballstick', 'ball', 'stick', 'lines', 'off'] as DisplayMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setDisplayMode(mode)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  displayMode === mode 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {mode === 'ballstick' ? 'Ball&Stick' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs font-medium text-gray-600 mr-1">
              <Type className="w-3 h-3 inline mr-1" />
              Labels:
            </span>
            {(['S', 'M', 'L', 'XL', 'XXL', 'off'] as LabelSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setLabelSize(size)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  labelSize === size 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {config.hasLonePairs && (
              <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                <input
                  type="checkbox"
                  checked={showLonePairs}
                  onChange={(e) => setShowLonePairs(e.target.checked)}
                  className="w-4 h-4 text-sky-500 rounded focus:ring-sky-500"
                />
                <span className="text-xs text-gray-700 font-medium">Lone Pairs</span>
              </label>
            )}
            
            {config.hasTetrahedron && (
              <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                <input
                  type="checkbox"
                  checked={showGeometry}
                  onChange={(e) => setShowGeometry(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                />
                <span className="text-xs text-gray-700 font-medium">Geometry</span>
              </label>
            )}

            <button
              onClick={() => {
                if (viewerRef.current) viewerRef.current.zoomTo();
                setDisplayMode('ballstick');
                setLabelSize('off');
                setShowLonePairs(false);
                setShowGeometry(false);
              }}
              className="flex items-center gap-1 px-2 py-1 bg-white text-gray-700 border border-gray-300 rounded text-xs hover:bg-gray-100 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Molecule3DmolVSEPREmbed;