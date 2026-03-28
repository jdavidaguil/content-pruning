const COST_PER_1K = 0.002;
const TOKEN_LIMIT = 16384;

function MetricBar({ value, max, color = 'blue' }) {
  const pct = Math.min(100, (value / max) * 100);
  const colorClass = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-orange-500' : `bg-${color}-500`;
  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5">
      <div className={`${colorClass} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function TokenMetrics({ tokens = 0, latencyMs = 0, f1Score, label = '' }) {
  const cost = ((tokens / 1000) * COST_PER_1K).toFixed(4);
  const tokenPct = Math.min(100, (tokens / TOKEN_LIMIT) * 100);
  const tokenColor = tokenPct > 80 ? 'text-red-400' : tokenPct > 60 ? 'text-orange-400' : 'text-blue-400';

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
      {label && <div className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wide">{label}</div>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Tokens Used</div>
          <div className={`text-lg font-bold font-mono ${tokenColor}`}>{tokens.toLocaleString()}</div>
          <MetricBar value={tokens} max={TOKEN_LIMIT} color="blue" />
          <div className="text-xs text-gray-600 mt-0.5">of {TOKEN_LIMIT.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Est. Cost</div>
          <div className="text-lg font-bold font-mono text-green-400">${cost}</div>
          <div className="text-xs text-gray-600">@ $0.002/1K tokens</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Latency</div>
          <div className="text-lg font-bold font-mono text-purple-400">
            {latencyMs >= 1000 ? `${(latencyMs / 1000).toFixed(1)}s` : `${latencyMs}ms`}
          </div>
          <MetricBar value={latencyMs} max={20000} color="purple" />
        </div>
        {f1Score !== undefined && (
          <div>
            <div className="text-xs text-gray-500 mb-1">F1 Score</div>
            <div className={`text-lg font-bold font-mono ${f1Score >= 0.9 ? 'text-green-400' : f1Score >= 0.7 ? 'text-yellow-400' : 'text-red-400'}`}>
              {(f1Score * 100).toFixed(0)}%
            </div>
            <MetricBar value={f1Score * 100} max={100} color="green" />
          </div>
        )}
      </div>
    </div>
  );
}
