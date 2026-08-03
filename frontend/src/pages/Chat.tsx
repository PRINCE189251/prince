import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function Chat() {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000');
    setSocket(s);
    s.on('connect', () => console.log('connected'));
    s.on('chat:response', (msg: any) => setMessages((m) => [...m, msg]));
    return () => s.disconnect();
  }, []);

  const send = () => {
    const id = Date.now();
    socket.emit('chat:message', { id, text: input });
    setMessages((m) => [...m, { id, text: input, role: 'user' }]);
    setInput('');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">AI Assistant</h2>
      <div className="border rounded p-4 mb-4 max-h-96 overflow-auto">
        {messages.map((m) => (
          <div key={m.id} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className="inline-block bg-white/10 p-2 rounded">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 p-2 rounded bg-white/5" value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={send} className="px-4 py-2 bg-blue-600 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
