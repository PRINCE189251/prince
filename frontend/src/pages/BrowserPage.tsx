import React, { useState, useRef } from 'react';

export default function BrowserPage() {
  const [url, setUrl] = useState('https://example.com');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const go = () => {
    const target = `/api/proxy?url=${encodeURIComponent(url)}`;
    window.location.href = target;
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <button className="px-3 py-2 bg-white/10 rounded">◀</button>
        <button className="px-3 py-2 bg-white/10 rounded">▶</button>
        <button className="px-3 py-2 bg-white/10 rounded">↻</button>
        <input
          className="flex-1 px-3 py-2 rounded bg-white/5"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={go} className="px-4 py-2 bg-emerald-500 rounded">
          Go
        </button>
      </div>
      <div className="border rounded overflow-hidden" style={{ height: 600 }}>
        <iframe ref={iframeRef} title="ai-browser" src={`/api/proxy?url=${encodeURIComponent(url)}`} className="w-full h-full" />
      </div>
    </div>
  );
}
