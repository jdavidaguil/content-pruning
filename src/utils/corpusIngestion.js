// Browser-side corpus ingestion - data never leaves the device
export async function ingestFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'txt') return ingestText(file);
  if (ext === 'csv') return ingestCsv(file);
  if (ext === 'json') return ingestJson(file);
  throw new Error(`Unsupported file type: .${ext}. Supported: .txt, .csv, .json`);
}

async function ingestText(file) {
  const text = await file.text();
  const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
  return chunks.map((chunk, i) => ({
    id: `doc_${i}`, title: `Chunk ${i + 1}`,
    snippet: chunk.trim().slice(0, 200), content: chunk.trim(),
  })).filter(d => d.content.length > 20);
}

async function ingestCsv(file) {
  const text = await file.text();
  const lines = text.split('\n').filter(Boolean);
  const headers = lines[0].split(',');
  return lines.slice(1).map((line, i) => {
    const vals = line.split(',');
    const obj = Object.fromEntries(headers.map((h, j) => [h.trim(), vals[j]?.trim() || '']));
    const content = Object.values(obj).join(' ');
    return { id: `doc_${i}`, title: obj.title || obj.name || `Row ${i + 1}`, snippet: content.slice(0, 200), content };
  });
}

async function ingestJson(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : [data];
  return arr.map((item, i) => ({
    id: item.id || `doc_${i}`,
    title: item.title || item.name || `Item ${i + 1}`,
    snippet: (item.snippet || item.content || item.text || JSON.stringify(item)).slice(0, 200),
    content: item.content || item.text || JSON.stringify(item),
  }));
}

export function simpleSearch(query, docs, topK = 5) {
  const qWords = query.toLowerCase().split(/\s+/);
  return docs
    .map(doc => {
      const text = (doc.content || doc.snippet || '').toLowerCase();
      const score = qWords.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0) / qWords.length;
      return { ...doc, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
