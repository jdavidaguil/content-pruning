# Context Pruning Demo

An interactive SPA that lets you experience and inspect **context-pruning** vs **vanilla RAG** using precomputed demo scenarios or your own corpus and LLM backend.

![Demo scenarios](https://github.com/user-attachments/assets/0cc7233d-fa67-4fe5-bdfc-f72f7e1b93be)

## Features

### Demo Mode (default)
- 3 precomputed scenarios: *Climate Change FAQ*, *Medical Diagnosis Support*, *Legal Contract Analysis*
- Side-by-side **Vanilla RAG** vs **Context Pruning** trace viewer
- Animated document cards showing KEPT / PRUNED (with prune reason tooltip) / IN CONTEXT status
- Interactive **timeline scrubber** — click any step or hit ▶ Play for auto-advance
- Token count, estimated cost, and latency metrics per step
- Final comparison panel (token savings %, speed improvement %, F1 scores)

### Live Mode
- **API backend**: connect any OpenAI-compatible endpoint (OpenAI, Anthropic-compatible, Azure, etc.)
- **Local LLM**: connect Ollama / LM Studio / GPT4All at `localhost:11434`
- Drag-and-drop corpus upload (`.txt`, `.csv`, `.json`) — ingested entirely in the browser
- Real-time stepwise agent execution with trace recording
- Export / import trace JSON files for offline inspection or replay

### Privacy & Security
- 🔒 **Your data and API keys never leave your device.** All corpus ingestion and indexing runs in the browser. API keys are stored only in session memory and never sent to any server other than the LLM provider you configure.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Architecture

```
src/
├── adapters/
│   ├── openaiAdapter.js   # OpenAI-compatible REST client
│   └── localAdapter.js    # Ollama / local LLM client
├── components/
│   ├── demo/
│   │   ├── ScenarioSelector.jsx
│   │   └── TraceViewer.jsx      # side-by-side step visualizer
│   ├── live/
│   │   ├── BackendSelector.jsx
│   │   ├── CorpusUploader.jsx
│   │   ├── QueryForm.jsx
│   │   └── LiveRunner.jsx       # orchestrates live pruning agent
│   ├── ContextWindow.jsx
│   ├── DocumentCard.jsx
│   ├── HowItWorksModal.jsx
│   ├── PrivacyBadge.jsx
│   ├── TimelineScrubber.jsx
│   └── TokenMetrics.jsx
├── data/
│   └── sampleTraces.js    # 3 precomputed demo scenarios
└── utils/
    ├── corpusIngestion.js  # browser-side file parsing & search
    └── traceRecorder.js    # trace builder + JSON export/import
```

## Trace Data Format

```json
{
  "agent": "context-pruning",
  "steps": [
    {
      "step": 1,
      "query": "What is X?",
      "retrieved_docs": [
        { "id": "doc123", "snippet": "...", "score": 0.92, "kept": true, "prune_reason": null },
        { "id": "doc456", "snippet": "...", "score": 0.67, "kept": false, "prune_reason": "Redundant after matching entity Y" }
      ],
      "context_before": ["docABC"],
      "context_after": ["docABC", "doc123"],
      "tokens": 1536,
      "latency_ms": 3200,
      "final_answer": null
    }
  ],
  "final_answer": "XYZ...",
  "total_tokens": 8432,
  "total_latency_ms": 15200,
  "F1": 0.92
}
```
