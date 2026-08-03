import React from 'react';

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">AI Hub</h1>
      <p className="text-slate-300">A modular, scalable AI-powered web browser platform.</p>
      <div className="mt-8 space-x-4">
        <a href="/browser" className="px-4 py-2 bg-white/10 rounded">Open Browser</a>
        <a href="/chat" className="px-4 py-2 bg-white/10 rounded">Open Chat</a>
      </div>
    </div>
  );
}
