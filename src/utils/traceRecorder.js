export function createTraceRecorder(agent = 'context-pruning') {
  const trace = { agent, steps: [], final_answer: null, total_tokens: 0, total_latency_ms: 0 };
  return {
    recordStep(step) { trace.steps.push(step); trace.total_tokens += step.tokens || 0; trace.total_latency_ms += step.latency_ms || 0; },
    finalize(final_answer, F1) { trace.final_answer = final_answer; if (F1 !== undefined) trace.F1 = F1; return trace; },
    getTrace() { return { ...trace }; },
  };
}

export function exportTrace(trace) {
  const blob = new Blob([JSON.stringify(trace, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `trace_${Date.now()}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

export async function importTrace(file) {
  const text = await file.text();
  return JSON.parse(text);
}
