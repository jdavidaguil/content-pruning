// OpenAI-compatible API adapter
export async function queryOpenAI({ apiKey, model, messages, baseUrl }) {
  const url = baseUrl || 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: model || 'gpt-3.5-turbo', messages }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }
  return response.json();
}

export async function validateApiKey(apiKey, baseUrl) {
  try {
    await queryOpenAI({
      apiKey, baseUrl,
      messages: [{ role: 'user', content: 'ping' }],
      model: 'gpt-3.5-turbo',
    });
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}
