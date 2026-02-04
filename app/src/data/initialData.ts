import type { Course, Problem, Formula, Book } from '@/types';

// === DONNÉES INITIALES ===

export const initialCourses: Course[] = [
  {
    id: 'c1',
    type: 'course',
    title: 'Complex Analysis: Suites Numériques',
    category: 'Analyse',
    level: 'Term',
    date: '2024-01-15',
    description: 'Comprendre les suites arithmétiques et géométriques, convergence et limites.',
    content: `
      <p>Une suite numérique est une fonction définie sur $\\mathbb{N}$. On note $u_n$ l'image de $n$.</p>
      <h2>Suite Arithmétique</h2>
      <p>Une suite est arithmétique si chaque terme se déduit du précédent en ajoutant une constante appelée raison $r$.</p>
      $$u_{n+1} = u_n + r$$
      <h2>Suite Géométrique</h2>
      <p>Une suite est géométrique si chaque terme se déduit du précédent en multipliant par une constante appelée raison $q$.</p>
      $$u_{n+1} = u_n \\times q$$
    `,
    image: 'https://lh5.googleusercontent.com/proxy/JtppaEuon4s0PzO1edghauPNJaO6x5VwP1k1eNNJJXD_c12LwhTMWoMYh-eqoVyn3-sJ7_625r_dUIPG-A',
    categoryColor: '#f0f9ff',
    categoryTextColor: '#0284c7',
  },
  {
    id: 'c2',
    type: 'course',
    title: 'Les Nombres Complexes',
    category: 'Algèbre',
    level: 'Term',
    date: '2024-01-20',
    description: 'Introduction aux nombres complexes, forme algébrique et trigonométrique.',
    content: `
      <p>Le nombre complexe $i$ est défini par $i^2 = -1$.</p>
      <h2>Forme Algébrique</h2>
      <p>Tout nombre complexe $z$ s'écrit sous la forme $z = a + ib$ où $a, b \\in \\mathbb{R}$.</p>
      <h2>Forme Trigonométrique</h2>
      <p>$$z = r(cos(\\theta) + i\\sin(\\theta)) = re^{i\\theta}$$</p>
    `,
    categoryColor: '#fef3c7',
    categoryTextColor: '#d97706',
  },
  {
    id: 'c3',
    type: 'course',
    title: 'Dérivation et Applications',
    category: 'Analyse',
    level: '1re',
    date: '2024-02-01',
    description: 'Dérivée d\'une fonction, règles de dérivation et étude de fonctions.',
    content: `
      <p>La dérivée d'une fonction $f$ en un point $a$ est définie par :</p>
      $$f'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$$
      <h2>Règles de Dérivation</h2>
      <ul>
        <li>$(u + v)' = u' + v'$</li>
        <li>$(uv)' = u'v + uv'$</li>
        <li>$(\\frac{u}{v})' = \\frac{u'v - uv'}{v^2}$</li>
      </ul>
    `,
    categoryColor: '#dcfce7',
    categoryTextColor: '#16a34a',
  },
];

export const initialProblems: Problem[] = [
  {
    id: 'p1',
    type: 'problem',
    title: 'La limite introuvable ?',
    difficulty: 'Difficile',
    category: 'Analyse',
    level: 'Term',
    description: 'Un défi classique sur les limites.',
    content: 'Calculer la limite suivante : $$\\lim_{x \\to 0} \\frac{\\sin(x) - x}{x^3}$$',
    hints: [
      {
        id: 'h1',
        content: 'Pour résoudre cette limite, il est conseillé d\'utiliser le développement limité de $\\sin(x)$ en $0$ à l\'ordre 3.',
        formulaRefs: ['DL-SIN-001'],
      },
      {
        id: 'h2',
        content: 'Le développement limité de $\\sin(x)$ à l\'ordre 3 est : $\\sin(x) = x - \\frac{x^3}{6} + o(x^3)$',
        formulaRefs: ['DL-SIN-001'],
      },
    ],
  },
  {
    id: 'p2',
    type: 'problem',
    title: 'Intégrale de Gauss',
    difficulty: 'Difficile',
    category: 'Analyse',
    level: 'Licence',
    description: 'Calculez l\'intégrale de Gauss.',
    content: 'Calculer l\'intégrale suivante : $$I = \\int_{-\\infty}^{+\\infty} e^{-x^2} dx$$',
    hints: [
      {
        id: 'h1',
        content: 'Considérez $I^2$ et passez en coordonnées polaires.',
        formulaRefs: ['INT-GAUSS-001'],
      },
    ],
  },
  {
    id: 'p3',
    type: 'problem',
    title: 'Équation du second degré',
    difficulty: 'Facile',
    category: 'Algèbre',
    level: '3e',
    description: 'Résoudre une équation quadratique.',
    content: 'Résoudre l\'équation : $$x^2 - 5x + 6 = 0$$',
    hints: [
      {
        id: 'h1',
        content: 'Utilisez la formule du discriminant $\\Delta = b^2 - 4ac$',
        formulaRefs: ['EQ-QUAD-001'],
      },
    ],
  },
];

export const initialFormulas: Formula[] = [
  {
    id: 'f1',
    name: 'Identité d\'Euler',
    tex: 'e^{i\\pi} + 1 = 0',
    category: 'Analyse Complexe',
    level: 'Term',
    code: 'EULER-001',
    description: 'La célèbre identité reliant les cinq nombres fondamentaux des mathématiques.',
  },
  {
    id: 'f2',
    name: 'Intégrale de Gauss',
    tex: '\\int_{-\\infty}^{+\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
    category: 'Intégrales',
    level: 'Licence',
    code: 'INT-GAUSS-001',
    description: 'Une des intégrales les plus importantes en analyse.',
  },
  {
    id: 'f3',
    name: 'Développement limité de sin(x)',
    tex: '\\sin(x) = x - \\frac{x^3}{6} + \\frac{x^5}{120} + o(x^5)',
    category: 'Développements Limités',
    level: 'Term',
    code: 'DL-SIN-001',
    description: 'Développement limité de la fonction sinus à l\'ordre 5.',
  },
  {
    id: 'f4',
    name: 'Formule de Moivre',
    tex: '(\\cos(\\theta) + i\\sin(\\theta))^n = \\cos(n\\theta) + i\\sin(n\\theta)',
    category: 'Analyse Complexe',
    level: 'Term',
    code: 'MOIVRE-001',
    description: 'Permet de calculer les puissances d\'un nombre complexe.',
  },
  {
    id: 'f5',
    name: 'Discriminant d\'une équation quadratique',
    tex: '\\Delta = b^2 - 4ac',
    category: 'Algèbre',
    level: '3e',
    code: 'EQ-QUAD-001',
    description: 'Le discriminant détermine le nombre de solutions réelles.',
  },
  {
    id: 'f6',
    name: 'Transformée de Laplace',
    tex: '\\mathcal{L}\\{f(t)\\} = \\int_0^{+\\infty} e^{-st}f(t)dt',
    category: 'Transformée de Laplace',
    level: 'Licence',
    code: 'LAP-001',
    description: 'Transformée intégrale fondamentale en analyse.',
  },
  {
    id: 'f7',
    name: 'Fonction Gamma',
    tex: '\\Gamma(z) = \\int_0^{+\\infty} t^{z-1}e^{-t}dt',
    category: 'Fonction Gamma',
    level: 'Master',
    code: 'GAMMA-001',
    description: 'Généralisation de la factorielle aux nombres complexes.',
  },
  {
    id: 'f8',
    name: 'Relation Gamma et Factorielle',
    tex: '\\Gamma(n+1) = n!',
    category: 'Fonction Gamma',
    level: 'Licence',
    code: 'GAMMA-002',
    description: 'La fonction Gamma prolonge la factorielle.',
  },
  {
    id: 'f9',
    name: 'Transformée de Laplace de la dérivée',
    tex: '\\mathcal{L}\\{f\'(t)\\} = sF(s) - f(0)',
    category: 'Transformée de Laplace',
    level: 'Licence',
    code: 'LAP-002',
    description: 'Propriété fondamentale pour résoudre les EDO.',
  },
  {
    id: 'f10',
    name: 'Théorème des résidus',
    tex: '\\oint_\\gamma f(z)dz = 2i\\pi \\sum_{k=1}^n Res(f, a_k)',
    category: 'Analyse Complexe',
    level: 'Licence',
    code: 'RES-001',
    description: 'Outil puissant pour calculer des intégrales complexes.',
  },
];

export const initialBooks: Book[] = [
  {
    id: 'b1',
    title: 'Mathématiques pour la Licence - Analyse',
    author: 'Jean-Marie Monier',
    description: 'Cours complet d\'analyse pour la Licence de mathématiques.',
    level: 'Licence',
    category: 'Analyse',
    uploadDate: '2024-01-10',
  },
  {
    id: 'b2',
    title: 'Algèbre Linéaire',
    author: 'Serge Lang',
    description: 'Introduction à l\'algèbre linéaire moderne.',
    level: 'Licence',
    category: 'Algèbre',
    uploadDate: '2024-01-15',
  },
  {
    id: 'b3',
    title: 'Mathématiques Terminale S',
    author: 'Collectif',
    description: 'Manuel complet de mathématiques pour la Terminale S.',
    level: 'Term',
    category: 'Général',
    uploadDate: '2024-02-01',
  },
];

// === FONCTION D'INITIALISATION ===
// Note: Les données sont maintenant chargées depuis Supabase
// Cette fonction est conservée pour compatibilité mais ne fait plus rien
export function initializeData() {
  // Les données sont maintenant gérées par les hooks useStorage
  // qui chargent depuis Supabase (ou localStorage comme fallback)
  console.log('MathUnivers: Data will be loaded from Supabase or local cache');
}
