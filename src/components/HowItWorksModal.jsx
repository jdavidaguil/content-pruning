export default function HowItWorksModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">How Context Pruning Works</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="font-semibold text-red-400 mb-2">🔴 Vanilla RAG</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Retrieves top-K docs every step</li>
                <li>• All retrieved docs stay in context</li>
                <li>• Context window grows unbounded</li>
                <li>• More tokens = higher cost + latency</li>
                <li>• Noise degrades answer quality</li>
              </ul>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="font-semibold text-green-400 mb-2">🟢 Context Pruning</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Retrieves top-K docs every step</li>
                <li>• Scores docs for relevance & novelty</li>
                <li>• Prunes redundant & off-topic docs</li>
                <li>• Context stays focused and lean</li>
                <li>• Better answers at lower cost</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-950 border border-blue-800 rounded-xl p-4">
            <h3 className="font-semibold text-blue-300 mb-2">🔬 Pruning Criteria</h3>
            <p className="text-sm text-gray-300">
              Documents are pruned when they are: <strong className="text-white">redundant</strong> (information already covered in context),
              <strong className="text-white"> off-topic</strong> (low relevance to the current query chain), or
              <strong className="text-white"> superseded</strong> (a higher-quality source covers the same facts).
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="font-semibold text-yellow-400 mb-2">📊 Typical Results</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">~50%</div>
                <div className="text-xs text-gray-400">Token reduction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">~30%</div>
                <div className="text-xs text-gray-400">Latency improvement</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">+15%</div>
                <div className="text-xs text-gray-400">F1 score gain</div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Got it, show me the demo!
        </button>
      </div>
    </div>
  );
}
