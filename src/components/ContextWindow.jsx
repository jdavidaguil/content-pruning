import DocumentCard from './DocumentCard';

export default function ContextWindow({ docs = [], label = 'Context Window', tokenCount, corpus = [] }) {
  const getDocById = (id) => corpus.find(d => d.id === id) || { id, title: id, snippet: '' };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300">{label}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{docs.length} docs</span>
          {tokenCount !== undefined && <span>· {tokenCount.toLocaleString()} tokens</span>}
        </div>
      </div>
      {docs.length === 0 ? (
        <div className="text-center py-6 text-gray-600 text-sm">Empty context window</div>
      ) : (
        <div className="space-y-2">
          {docs.map(id => {
            const doc = getDocById(id);
            return <DocumentCard key={id} doc={doc} status="in-context" />;
          })}
        </div>
      )}
    </div>
  );
}
