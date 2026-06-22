import { ComputeEngine } from '@cortex-js/compute-engine';

const ce = new ComputeEngine();

function normalizeLatex(value: string): string {
  return value
    .toLowerCase()
    .replace(/\\,/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function compareExact(userLatex: string, expectedLatex: string): boolean {
  return normalizeLatex(userLatex) === normalizeLatex(expectedLatex);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function compareNumeric(userLatex: string, expectedLatex: string): boolean {
  try {
    const userExpr = ce.parse(userLatex);
    const expectedExpr = ce.parse(expectedLatex);

    const symbols = Array.from(new Set([...userExpr.symbols, ...expectedExpr.symbols]));

    if (symbols.length === 0) {
      const userVal = round2(Number(userExpr.N()));
      const expectedVal = round2(Number(expectedExpr.N()));
      if (Number.isNaN(userVal) || Number.isNaN(expectedVal)) return false;
      return Math.abs(userVal - expectedVal) < 1e-9;
    }

    if (symbols.length === 1) {
      const x = symbols[0];
      const points = [0.1, 0.5, 1, 2, Math.PI];
      for (const p of points) {
        const userVal = round2(Number(userExpr.subs({ [x]: p }).N()));
        const expectedVal = round2(Number(expectedExpr.subs({ [x]: p }).N()));
        if (Number.isNaN(userVal) || Number.isNaN(expectedVal)) return false;
        if (Math.abs(userVal - expectedVal) > 1e-9) return false;
      }
      return true;
    }

    // Multiple variables: fallback symbolic
    return compareSymbolic(userLatex, expectedLatex);
  } catch {
    return compareExact(userLatex, expectedLatex);
  }
}

function isZero(expr: any): boolean {
  if (!expr) return false;
  try {
    if (expr.isEqual(ce.parse('0')) === true) return true;
    const numeric = Number(expr.N());
    if (!Number.isNaN(numeric) && Math.abs(numeric) < 1e-9) return true;
  } catch {
    // ignore
  }
  return false;
}

export function compareSymbolic(userLatex: string, expected: string): boolean {
  if (!userLatex.trim() || !expected.trim()) return false;

  try {
    const userExpr = ce.parse(userLatex);
    const expectedExpr = ce.parse(expected);

    // 1. Différence simplifiée
    const diff = userExpr.sub(expectedExpr).simplify();
    if (isZero(diff)) return true;

    // 2. Formes simplifiées (développement + réduction)
    try {
      const userSimplified = userExpr.simplify();
      const expectedSimplified = expectedExpr.simplify();
      if (userSimplified.isEqual(expectedSimplified) === true) return true;
    } catch {
      // ignore
    }

    // 3. Test numérique multi-points (fallback robuste)
    return compareNumeric(userLatex, expected);
  } catch {
    return false;
  }
}

export function verifyAnswer(
  userLatex: string,
  expectedLatex: string,
  expectedMathJson: string | undefined,
  answerType: 'exact' | 'numeric' | 'symbolic'
): boolean {
  if (!userLatex.trim()) return false;

  switch (answerType) {
    case 'exact':
      // Exact d'abord, puis symbolique pour accepter les formes équivalentes
      // (commutativité, factorisation différente, etc.)
      return compareExact(userLatex, expectedLatex) || compareSymbolic(userLatex, expectedLatex);
    case 'numeric':
      return compareNumeric(userLatex, expectedLatex);
    case 'symbolic':
      return compareSymbolic(userLatex, expectedMathJson || expectedLatex);
    default:
      return compareExact(userLatex, expectedLatex);
  }
}
