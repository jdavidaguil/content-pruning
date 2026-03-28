import { useState, useEffect, useCallback } from 'react';
import TimelineScrubber from '../TimelineScrubber';
import DocumentCard from '../DocumentCard';
import ContextWindow from '../ContextWindow';
import TokenMetrics from '../TokenMetrics';

function StepPanel({ step, corpus, label, accentColor }) {
  if (!step) return null;
  const borderClass = accentColor === 'red' ? 'border-red-900/50' : 'border-green-900/50';
  const bgClass = accentColor === 'red' ? 'bg-red-950/10' : 'bg-green-950/10';
  const textClass = accentColor === 'red' ? 'text-red-400' : 'text-green-400';

  return (
    <div className={`bg-gray-900 border rounded-xl p-4 ${borderClass} ${bgClass}`}>
      <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textClass}`}>{label}</div>

      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Query</div>
        <div className="text-sm text-gray-200 bg-gray-800 rounded-lg p-2 italic">&ldquo;{step.query}&rdquo;</div>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-2">Retrieved Documents ({step.retrieved_docs?.length || 0})</div>
        <div className="space-y-2">
          {step.retrieved_docs?.map(doc => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      </div>

      <ContextWindow
        docs={step.context_after || []}
        corpus={corpus}
        label="Context After Step"
        tokenCount={step.tokens}
      />

      {step.final_answer && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1">Final Answer</div>
          <div className="text-sm text-gray-200 bg-gray-800 rounded-lg p-3 leading-relaxed">{step.final_answer}</div>
        </div>
      )}
    </div>
  );
}

export default function TraceViewer({ scenario }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const vanillaSteps = scenario?.vanillaTrace?.steps || [];
  const pruningSteps = scenario?.pruningTrace?.steps || [];
  const maxSteps = Math.max(vanillaSteps.length, pruningSteps.length);

  const corpus = scenario?.corpus || [];

  const advance = useCallback(() => {
    setCurrentStep(prev => {
      if (prev >= maxSteps - 1) { setIsPlaying(false); return prev; }
      return prev + 1;
    });
  }, [maxSteps]);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(advance, 2000);
    return () => clearTimeout(t);
  }, [isPlaying, currentStep, advance]);

  const vanillaStep = vanillaSteps[currentStep];
  const pruningStep = pruningSteps[currentStep];
  const isLastStep = currentStep >= maxSteps - 1;

  const vanillaTokensUpToStep = vanillaSteps.slice(0, currentStep + 1).reduce((s, st) => s + (st.tokens || 0), 0);
  const pruningTokensUpToStep = pruningSteps.slice(0, currentStep + 1).reduce((s, st) => s + (st.tokens || 0), 0);
  const vanillaLatencyUpToStep = vanillaSteps.slice(0, currentStep + 1).reduce((s, st) => s + (st.latency_ms || 0), 0);
  const pruningLatencyUpToStep = pruningSteps.slice(0, currentStep + 1).reduce((s, st) => s + (st.latency_ms || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{scenario?.title}</h2>
          <p className="text-sm text-gray-400">{scenario?.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-40 transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${isPlaying ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            {isPlaying ? '⏸ Pause' : isLastStep ? '↺ Replay' : '▶ Play'}
          </button>
          <button
            onClick={() => {
              if (isLastStep) setCurrentStep(0);
              else setCurrentStep(Math.min(maxSteps - 1, currentStep + 1));
            }}
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <TimelineScrubber
        steps={pruningSteps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StepPanel step={vanillaStep} corpus={corpus} label="🔴 Vanilla RAG" accentColor="red" />
        <StepPanel step={pruningStep} corpus={corpus} label="🟢 Context Pruning" accentColor="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TokenMetrics
          tokens={vanillaTokensUpToStep}
          latencyMs={vanillaLatencyUpToStep}
          f1Score={isLastStep ? scenario?.vanillaTrace?.F1 : undefined}
          label="Vanilla RAG Metrics"
        />
        <TokenMetrics
          tokens={pruningTokensUpToStep}
          latencyMs={pruningLatencyUpToStep}
          f1Score={isLastStep ? scenario?.pruningTrace?.F1 : undefined}
          label="Context Pruning Metrics"
        />
      </div>

      {isLastStep && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">📊 Final Comparison</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500 mb-1">Token Savings</div>
              <div className="text-xl font-bold text-green-400">
                {Math.round((1 - scenario?.pruningTrace?.total_tokens / scenario?.vanillaTrace?.total_tokens) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Speed Improvement</div>
              <div className="text-xl font-bold text-blue-400">
                {Math.round((1 - scenario?.pruningTrace?.total_latency_ms / scenario?.vanillaTrace?.total_latency_ms) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">F1: Vanilla</div>
              <div className="text-xl font-bold text-red-400">{((scenario?.vanillaTrace?.F1 || 0) * 100).toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">F1: Pruning</div>
              <div className="text-xl font-bold text-green-400">{((scenario?.pruningTrace?.F1 || 0) * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
