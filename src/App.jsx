import { useState } from 'react';
import PrivacyBadge from './components/PrivacyBadge';
import HowItWorksModal from './components/HowItWorksModal';
import ScenarioSelector from './components/demo/ScenarioSelector';
import TraceViewer from './components/demo/TraceViewer';
import BackendSelector from './components/live/BackendSelector';
import CorpusUploader from './components/live/CorpusUploader';
import QueryForm from './components/live/QueryForm';
import LiveRunner from './components/live/LiveRunner';
import { sampleScenarios } from './data/sampleTraces';

export default function App() {
  const [mode, setMode] = useState('demo');
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [showModal, setShowModal] = useState(() => !localStorage.getItem('howItWorksSeen'));
  const [backendConfig, setBackendConfig] = useState(null);
  const [corpus, setCorpus] = useState([]);
  const [query, setQuery] = useState('');
  const [liveRunStarted, setLiveRunStarted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Context Pruning Demo</h1>
          <p className="text-sm text-gray-400 mt-1">Intelligent context management vs vanilla RAG — see the difference.</p>
        </div>
        <div className="flex items-center gap-4">
          <PrivacyBadge />
          <button onClick={() => setShowModal(true)} className="text-sm text-blue-400 hover:text-blue-300 underline">
            How it works
          </button>
        </div>
      </header>

      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('demo')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'demo' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            📊 Demo Scenarios
          </button>
          <button
            onClick={() => setMode('live')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'live' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            ⚡ Live / Test Your Own
          </button>
        </div>
      </div>

      <main className="px-6 py-6">
        {mode === 'demo' && (
          <div>
            {!selectedScenario ? (
              <ScenarioSelector scenarios={sampleScenarios} onSelect={setSelectedScenario} />
            ) : (
              <div>
                <button
                  onClick={() => setSelectedScenario(null)}
                  className="mb-4 text-sm text-blue-400 hover:text-blue-300"
                >
                  ← Back to scenarios
                </button>
                <TraceViewer key={selectedScenario?.id} scenario={selectedScenario} />
              </div>
            )}
          </div>
        )}

        {mode === 'live' && (
          <div className="space-y-6">
            <BackendSelector onConfigChange={setBackendConfig} />
            <CorpusUploader onCorpusChange={setCorpus} />
            <QueryForm
              query={query}
              onChange={setQuery}
              onSubmit={() => setLiveRunStarted(true)}
              disabled={!backendConfig || corpus.length === 0 || !query.trim()}
            />
            {liveRunStarted && backendConfig && corpus.length > 0 && query.trim() && (
              <LiveRunner
                backendConfig={backendConfig}
                corpus={corpus}
                query={query}
                onReset={() => setLiveRunStarted(false)}
              />
            )}
          </div>
        )}
      </main>

      {showModal && <HowItWorksModal onClose={() => { localStorage.setItem('howItWorksSeen', '1'); setShowModal(false); }} />}
    </div>
  );
}
