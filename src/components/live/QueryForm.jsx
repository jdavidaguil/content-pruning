export default function QueryForm({ query, onChange, onSubmit, disabled, loading }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      <h2 className="text-lg font-semibold text-white mb-4">💬 Query</h2>
      <textarea
        value={query}
        onChange={e => onChange(e.target.value)}
        placeholder="Ask a question about your uploaded corpus…"
        rows={3}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-500">{query.length} characters</span>
        <button
          onClick={onSubmit}
          disabled={disabled || loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {loading ? '⏳ Running…' : '▶ Run Context Pruning'}
        </button>
      </div>
      {disabled && (
        <div className="mt-2 text-xs text-gray-500">
          {!query.trim() ? 'Enter a query to continue.' : 'Configure a backend and upload corpus to run.'}
        </div>
      )}
    </div>
  );
}
