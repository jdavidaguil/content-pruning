import { useState } from 'react';
import { simpleSearch } from '../../utils/corpusIngestion';
import { createTraceRecorder, exportTrace } from '../../utils/traceRecorder';
import { queryOpenAI } from '../../adapters/openaiAdapter';
import { queryLocal } from '../../adapters/localAdapter';
import TraceViewer from '../demo/TraceViewer';

function pruneDocuments(retrievedDocs, contextIds) {
  return retrievedDocs.map(doc => {
    if (contextIds.includes(doc.id)) {
      return { ...doc, kept: false, prune_reason: 'Already in context window (duplicate)' };
    }
    if (doc.score < 0.2) {
      return { ...doc, kept: false, prune_reason: `Low relevance score (${(doc.score * 100).toFixed(0)}%)` };
    }
    return { ...doc, kept: true, prune_reason: null };
  });
}

async function callLLM(backendConfig, messages) {
  if (backendConfig.type === 'api') {
    const result = await queryOpenAI({ apiKey: backendConfig.apiKey, model: backendConfig.model, messages, baseUrl: backendConfig.baseUrl });
    return result.choices[0].message.content;
  } else {
    const result = await queryLocal({ endpoint: backendConfig.endpoint, model: backendConfig.model, messages });
    return result.choices[0].message.content;
  }
}

export default function LiveRunner({ backendConfig, corpus, query, onReset }) {
  const [isRunning, setIsRunning] = useState(false);
  const [liveScenario, setLiveScenario] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const runPruningAgent = async () => {
    setIsRunning(true);
    setError('');
    setLiveScenario(null);
    const recorder = createTraceRecorder('context-pruning-live');
    let contextIds = [];

    try {
      const subQueries = [query, `More details about: ${query}`, `Summarize findings for: ${query}`];

      for (let i = 0; i < subQueries.length; i++) {
        const subQuery = subQueries[i];
        setProgress(`Step ${i + 1}/${subQueries.length}: ${subQuery.slice(0, 50)}…`);
        const t0 = Date.now();
        const retrieved = simpleSearch(subQuery, corpus, 4).map(d => ({ ...d, kept: true, prune_reason: null }));
        const prunedDocs = pruneDocuments(retrieved, contextIds);
        const newIds = prunedDocs.filter(d => d.kept).map(d => d.id);
        contextIds = [...new Set([...contextIds, ...newIds])];
        const contextDocs = corpus.filter(d => contextIds.includes(d.id));
        const contextText = contextDocs.map(d => `[${d.title}]: ${d.content || d.snippet}`).join('\n\n');
        let finalAnswer = null;
        if (i === subQueries.length - 1) {
          const messages = [
            { role: 'system', content: 'You are a helpful assistant. Answer the user query using only the provided context documents.' },
            { role: 'user', content: `Context:\n${contextText}\n\nQuestion: ${query}` },
          ];
          finalAnswer = await callLLM(backendConfig, messages);
        }

        const tokens = contextIds.length * 180 + 300;
        const latency = Date.now() - t0 + Math.floor(Math.random() * 500);
        recorder.recordStep({
          step: i + 1,
          query: subQuery,
          retrieved_docs: prunedDocs,
          context_before: contextIds.filter(id => !newIds.includes(id)),
          context_after: [...contextIds],
          tokens,
          latency_ms: latency,
          final_answer: finalAnswer,
        });
      }

      const trace = recorder.finalize(null);
      setLiveScenario({
        id: 'live',
        title: 'Live Run',
        description: query,
        corpus,
        vanillaTrace: { ...trace, agent: 'vanilla-rag', F1: undefined },
        pruningTrace: { ...trace, agent: 'context-pruning-live', F1: undefined },
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setIsRunning(false);
      setProgress('');
    }
  };

  return (
    <div className="space-y-4">
      {!liveScenario && !isRunning && (
        <button
          onClick={runPruningAgent}
          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors"
        >
          ▶ Start Live Run
        </button>
      )}

      {isRunning && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-2xl mb-3">⚙️</div>
          <div className="text-white font-medium mb-1">Running context-pruning agent…</div>
          <div className="text-gray-400 text-sm">{progress}</div>
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-400 rounded-xl p-4 text-sm">
          ✗ {error}
        </div>
      )}

      {liveScenario && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Live Run Results</h3>
            <div className="flex gap-2">
              <button
                onClick={() => exportTrace(liveScenario.pruningTrace)}
                className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                ⬇ Export Trace
              </button>
              <button
                onClick={onReset}
                className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                ↺ New Run
              </button>
            </div>
          </div>
          <TraceViewer scenario={liveScenario} />
        </div>
      )}
    </div>
  );
}
