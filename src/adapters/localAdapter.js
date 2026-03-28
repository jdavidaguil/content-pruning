// Local LLM adapter (Ollama / LM Studio / GPT4All compatible)
export async function queryLocal({ endpoint, model, messages }) {
  const url = `${endpoint}/api/chat`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: model || 'llama3', messages, stream: false }),
  });
  if (!response.ok) throw new Error(`Local LLM error: ${response.status}`);
  const data = await response.json();
  return { choices: [{ message: { content: data?.message?.content || data?.response || '' } }] };
}

export async function detectLocalLLM(endpoint) {
  try {
    const response = await fetch(`${endpoint}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json();
      return { available: true, models: data?.models?.map(m => m.name) || [] };
    }
    return { available: false };
  } catch {
    return { available: false };
  }
}
