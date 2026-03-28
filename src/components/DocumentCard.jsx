import { useState } from 'react';

function StatusBadge({ kept, pruneReason, inContext }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (inContext) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-300 border border-blue-700">
        IN CONTEXT
      </span>
    );
  }

  if (kept === true) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-300 border border-green-700">
        ✓ KEPT
      </span>
    );
  }

  if (kept === false) {
    return (
      <div className="relative inline-block">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-900 text-red-300 border border-red-700 cursor-help"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          ✗ PRUNED <span className="opacity-60">ℹ</span>
        </span>
        {showTooltip && pruneReason && (
          <div className="absolute bottom-full left-0 mb-2 z-20 w-56 bg-gray-800 border border-gray-600 text-gray-200 text-xs rounded-lg p-2 shadow-xl">
            {pruneReason}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function DocumentCard({ doc, status = 'default', animate = false }) {
  const { kept, prune_reason, inContext } = status === 'default'
    ? { kept: doc.kept, prune_reason: doc.prune_reason, inContext: false }
    : { kept: status === 'kept', prune_reason: doc.prune_reason, inContext: status === 'in-context' };

  const baseClasses = 'rounded-xl border p-3 transition-all duration-500';
  const stateClasses = kept === false
    ? 'bg-red-950/30 border-red-900/50 opacity-60'
    : inContext
    ? 'bg-blue-950/30 border-blue-800/50'
    : 'bg-gray-800 border-gray-700';

  return (
    <div className={`${baseClasses} ${stateClasses} ${animate ? 'animate-fade-in' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="font-medium text-sm text-gray-200 truncate flex-1">{doc.title || doc.id}</div>
        <div className="flex items-center gap-1.5 shrink-0">
          {doc.score !== undefined && (
            <span className="text-xs text-gray-500 font-mono">{(doc.score * 100).toFixed(0)}%</span>
          )}
          <StatusBadge kept={kept} pruneReason={doc.prune_reason} inContext={inContext} />
        </div>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{doc.snippet}</p>
    </div>
  );
}
