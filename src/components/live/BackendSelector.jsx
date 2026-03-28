import { useState } from 'react';
import { validateApiKey } from '../../adapters/openaiAdapter';
import { detectLocalLLM } from '../../adapters/localAdapter';

export default function BackendSelector({ onConfigChange }) {
  const [mode, setMode] = useState('api');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [baseUrl, setBaseUrl] = useState('');
  const [endpoint, setEndpoint] = useState('http://localhost:11434');
  const [localModel, setLocalModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [status, setStatus] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const handleValidate = async () => {
    setStatus('loading');
    const result = await validateApiKey(apiKey, baseUrl || undefined);
    if (result.valid) {
      setStatus('success');
      setStatusMsg('API key validated!');
      onConfigChange({ type: 'api', apiKey, model, baseUrl: baseUrl || undefined });
    } else {
      setStatus('error');
      setStatusMsg(result.error || 'Validation failed');
    }
  };

  const handleDetect = async () => {
    setStatus('loading');
    const result = await detectLocalLLM(endpoint);
    if (result.available) {
      setStatus('success');
      setStatusMsg(`Found ${result.models.length} model(s)`);
      setAvailableModels(result.models);
      const m = result.models[0] || 'llama3';
      setLocalModel(m);
      onConfigChange({ type: 'local', endpoint, model: m });
    } else {
      setStatus('error');
      setStatusMsg('No local LLM detected at this endpoint');
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      <h2 className="text-lg font-semibold text-white mb-4">🔌 Backend Configuration</h2>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => { setMode('api'); setStatus(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'api' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          🌐 API (OpenAI-compatible)
        </button>
        <button
          onClick={() => { setMode('local'); setStatus(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'local' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          🖥 Local LLM (Ollama)
        </button>
      </div>

      {mode === 'api' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Model</label>
              <input
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="gpt-3.5-turbo"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Base URL (optional)</label>
              <input
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleValidate}
            disabled={!apiKey || status === 'loading'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {status === 'loading' ? '⏳ Validating...' : 'Validate Key'}
          </button>
        </div>
      )}

      {mode === 'local' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Endpoint</label>
            <input
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          {availableModels.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Model</label>
              <select
                value={localModel}
                onChange={e => { setLocalModel(e.target.value); onConfigChange({ type: 'local', endpoint, model: e.target.value }); }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}
          <button
            onClick={handleDetect}
            disabled={status === 'loading'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {status === 'loading' ? '⏳ Detecting...' : '🔍 Detect Models'}
          </button>
        </div>
      )}

      {status && status !== 'loading' && (
        <div className={`mt-3 text-sm px-3 py-2 rounded-lg ${status === 'success' ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
          {status === 'success' ? '✓' : '✗'} {statusMsg}
        </div>
      )}
    </div>
  );
}
