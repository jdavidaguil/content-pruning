export default function ScenarioSelector({ scenarios = [], onSelect }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Choose a Demo Scenario</h2>
        <p className="text-gray-400 text-sm">Each scenario shows side-by-side how context pruning improves RAG quality vs vanilla retrieval.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map(scenario => {
          const vanillaF1 = scenario.vanillaTrace?.F1 || 0;
          const pruningF1 = scenario.pruningTrace?.F1 || 0;
          const gain = ((pruningF1 - vanillaF1) * 100).toFixed(0);
          const tokenReduction = Math.round((1 - scenario.pruningTrace?.total_tokens / scenario.vanillaTrace?.total_tokens) * 100);

          return (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className="text-left bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-blue-600 rounded-2xl p-5 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">{scenario.title}</h3>
                <span className="text-xs bg-green-900/60 text-green-400 border border-green-800 px-2 py-0.5 rounded-full font-mono whitespace-nowrap ml-2">
                  F1 +{gain}%
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{scenario.description}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-800 rounded-lg p-2">
                  <div className="text-sm font-bold text-blue-400">{scenario.pruningTrace?.steps?.length}</div>
                  <div className="text-xs text-gray-500">Steps</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-2">
                  <div className="text-sm font-bold text-green-400">{tokenReduction}%</div>
                  <div className="text-xs text-gray-500">Token ↓</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-2">
                  <div className="text-sm font-bold text-yellow-400">{(pruningF1 * 100).toFixed(0)}%</div>
                  <div className="text-xs text-gray-500">F1</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
