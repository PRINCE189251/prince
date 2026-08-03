import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BrowserPage from './pages/BrowserPage';
import Chat from './pages/Chat';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browser" element={<BrowserPage />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
}
