import { useState, useRef } from 'react';
import { ingestFile } from '../../utils/corpusIngestion';

export default function CorpusUploader({ onCorpusChange }) {
  const [files, setFiles] = useState([]);
  const [docs, setDocs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const processFiles = async (newFiles) => {
    setError('');
    const allDocs = [];
    for (const file of newFiles) {
      try {
        const ingested = await ingestFile(file);
        allDocs.push(...ingested);
      } catch (e) {
        setError(e.message);
      }
    }
    const updated = [...docs, ...allDocs];
    setDocs(updated);
    onCorpusChange(updated);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    processFiles(dropped);
  };

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    setDocs([]);
    onCorpusChange([]);
    if (updated.length > 0) processFiles(updated);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      <h2 className="text-lg font-semibold text-white mb-4">📂 Corpus Upload</h2>

      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-950/20' : 'border-gray-700 hover:border-gray-500'
        }`}
      >
        <div className="text-3xl mb-2">📄</div>
        <div className="text-gray-300 font-medium">Drop files here or click to browse</div>
        <div className="text-gray-500 text-sm mt-1">Supports .txt, .csv, .json</div>
        <input ref={inputRef} type="file" multiple accept=".txt,.csv,.json" className="hidden" onChange={e => processFiles(Array.from(e.target.files))} />
      </div>

      {error && <div className="mt-2 text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2">{error}</div>}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-300">{file.name}</span>
              <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-400 text-sm transition-colors">✕</button>
            </div>
          ))}
        </div>
      )}

      {docs.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">{docs.length} documents ingested — preview:</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {docs.slice(0, 5).map(doc => (
              <div key={doc.id} className="bg-gray-800 rounded-lg px-3 py-2">
                <div className="text-xs font-medium text-gray-300">{doc.title}</div>
                <div className="text-xs text-gray-500 truncate">{doc.snippet}</div>
              </div>
            ))}
            {docs.length > 5 && <div className="text-xs text-gray-600 pl-3">+{docs.length - 5} more…</div>}
          </div>
        </div>
      )}
    </div>
  );
}
