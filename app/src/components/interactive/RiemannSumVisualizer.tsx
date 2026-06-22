import { useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Calculator, MoveHorizontal } from 'lucide-react';

interface RiemannSumVisualizerProps {
  functionExpr?: string;
  min?: number;
  max?: number;
  initialRectangles?: number;
}

function evaluateFunction(expr: string, x: number): number {
  const normalized = expr
    .replace(/\^/g, '**')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan')
    .replace(/\bexp\b/g, 'Math.exp')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\blog\b/g, 'Math.log')
    .replace(/\bpi\b/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E');
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `return ${normalized}`);
    const result = Number(fn(x));
    return Number.isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

function computeExactIntegral(expr: string, min: number, max: number): number | null {
  // Approximation "exacte" par une somme de Riemann très fine
  const n = 10000;
  const width = (max - min) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const x = min + (i + 0.5) * width;
    sum += evaluateFunction(expr, x) * width;
  }
  return Number.isFinite(sum) ? sum : null;
}

export function RiemannSumVisualizer({
  functionExpr = 'x^2',
  min = 0,
  max = 2,
  initialRectangles = 5,
}: RiemannSumVisualizerProps) {
  const [rectangles, setRectangles] = useState(initialRectangles);

  const curveData = useMemo(() => {
    const points = 200;
    const data = [];
    const step = (max - min) / points;
    let maxY = 0;
    for (let i = 0; i <= points; i++) {
      const x = min + i * step;
      const y = evaluateFunction(functionExpr, x);
      maxY = Math.max(maxY, y);
      data.push({ x, y });
    }
    return { data, maxY };
  }, [functionExpr, min, max]);

  const rectanglesData = useMemo(() => {
    const width = (max - min) / rectangles;
    const data = [];
    let sum = 0;
    for (let i = 0; i < rectangles; i++) {
      const x0 = min + i * width;
      const xMid = x0 + width / 2;
      const y = evaluateFunction(functionExpr, xMid);
      const area = y * width;
      sum += area;
      data.push({ x: xMid, y, x0, width, area });
    }
    return { data, sum };
  }, [functionExpr, min, max, rectangles]);

  const exactIntegral = useMemo(
    () => computeExactIntegral(functionExpr, min, max),
    [functionExpr, min, max]
  );

  const yMax = Math.max(curveData.maxY, ...rectanglesData.data.map(d => d.y)) * 1.1;

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-4 md:p-6 my-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Sommes de Riemann interactives</h3>
          <p className="text-sm text-gray-500">
            f(x) = {functionExpr} sur [{min}, {max}]
          </p>
        </div>
      </div>

      <div className="h-64 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[min, max]}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis
              type="number"
              domain={[0, Math.max(yMax, 0.1)]}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                Number(value).toFixed(4),
                name === 'y' ? 'f(x)' : 'Aire',
              ]}
              labelFormatter={(label: number) => `x = ${Number(label).toFixed(3)}`}
              contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
            />
            <ReferenceLine y={0} stroke="#6b7280" />
            <Bar
              data={rectanglesData.data}
              dataKey="y"
              fill="rgba(59, 130, 246, 0.35)"
              stroke="rgba(59, 130, 246, 0.6)"
              barSize={Math.max(2, 600 / rectangles)}
              isAnimationActive={false}
            />
            <Line
              data={curveData.data}
              type="monotone"
              dataKey="y"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MoveHorizontal className="w-4 h-4" />
              Nombre de rectangles : <span className="font-bold text-blue-600">{rectangles}</span>
            </label>
            <span className="text-xs text-gray-500">
              Largeur : {((max - min) / rectangles).toFixed(4)}
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={200}
            value={rectangles}
            onChange={(e) => setRectangles(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2</span>
            <span>200</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium mb-1">Aire approchée</p>
            <p className="text-xl font-bold text-blue-700">{rectanglesData.sum.toFixed(5)}</p>
          </div>
          {exactIntegral !== null && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <p className="text-xs text-green-600 font-medium mb-1">Aire "exacte"</p>
              <p className="text-xl font-bold text-green-700">{exactIntegral.toFixed(5)}</p>
            </div>
          )}
        </div>

        {exactIntegral !== null && (
          <p className="text-sm text-gray-600">
            Erreur :{' '}
            <span className="font-semibold">
              {Math.abs(rectanglesData.sum - exactIntegral).toFixed(5)}
            </span>{' '}
            ({(Math.abs(rectanglesData.sum - exactIntegral) / exactIntegral * 100).toFixed(2)}%)
          </p>
        )}
      </div>
    </div>
  );
}
