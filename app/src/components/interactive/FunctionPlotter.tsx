import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface FunctionPlotterProps {
  expr?: string;
  min?: number;
  max?: number;
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

export function FunctionPlotter({
  expr = 'sin(x)',
  min = -6.28,
  max = 6.28,
}: FunctionPlotterProps) {
  const data = useMemo(() => {
    const points = 300;
    const step = (max - min) / points;
    const result = [];
    for (let i = 0; i <= points; i++) {
      const x = min + i * step;
      const y = evaluateFunction(expr, x);
      result.push({ x, y });
    }
    return result;
  }, [expr, min, max]);

  const yValues = data.map(d => d.y);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const padding = Math.max(0.1, (yMax - yMin) * 0.1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 my-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Graphe interactif</h3>
          <p className="text-sm text-gray-500">
            y = {expr} sur [{min.toFixed(2)}, {max.toFixed(2)}]
          </p>
        </div>
      </div>

      <div className="h-64 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
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
              domain={[yMin - padding, yMax + padding]}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip
              formatter={(value: number) => [Number(value).toFixed(4), 'y']}
              labelFormatter={(label: number) => `x = ${Number(label).toFixed(3)}`}
              contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
            />
            <ReferenceLine y={0} stroke="#6b7280" />
            <ReferenceLine x={0} stroke="#6b7280" />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#9333ea"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
