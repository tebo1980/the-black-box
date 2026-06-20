'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';

type TerminalLine = {
  id: string;
  type: 'input' | 'output';
  content: React.ReactNode;
};

export default function TerminalPage() {
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'output',
      content: 'THE BLACK BOX v1.0.0 -- SYSTEM INITIALIZED.',
    },
    {
      id: 'init-2',
      type: 'output',
      content: "Type 'help' for a list of available diagnostic utilities.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newHistory = [...history, { id: crypto.randomUUID(), type: 'input' as const, content: `> ${trimmed}` }];

    switch (trimmed.toLowerCase()) {
      case 'help':
        newHistory.push({
          id: crypto.randomUUID(),
          type: 'output',
          content: (
            <div className="flex flex-col space-y-1 mt-2 mb-2">
              <span>Available utilities:</span>
              <span>  status         - View operational states of the active matrix</span>
              <span>  logs --view    - Stream simulated cryptographic ingestion logs</span>
              <span>  export --court - Package immutable ledgers for legal routing</span>
              <span>  clear          - Clear terminal output</span>
            </div>
          ),
        });
        break;
      case 'status':
        newHistory.push({
          id: crypto.randomUUID(),
          type: 'output',
          content: (
            <div className="flex flex-col space-y-1 mt-2 mb-2 text-amber-400">
              <span>[TENANT]     : ACTIVE</span>
              <span>[HOA]        : RETALIATION_ALARM (Selective Enforcement Triggered)</span>
              <span>[WORKER]     : ACTIVE</span>
              <span>[GIG_WORKER] : PLATFORM_DEFICIT_ALARM (Sub-Minimum Yield Detected)</span>
              <span>[AUTO]       : NON_COMPLIANT (FTC Disclosure Breach)</span>
              <span>[MEDICAL]    : ACTIVE</span>
            </div>
          ),
        });
        break;
      case 'logs --view':
        newHistory.push({
          id: crypto.randomUUID(),
          type: 'output',
          content: (
            <div className="flex flex-col space-y-1 mt-2 mb-2 text-green-500">
              <span>[{new Date().toISOString()}] SEAL: SHA-256(b7a5...8f9d) - Payload immutably locked.</span>
              <span>[{new Date().toISOString()}] VERCEL_BLOB: Handshake acknowledged. Staging document `eviction_notice_draft.pdf`...</span>
              <span>[{new Date().toISOString()}] DB_SYNC: Drizzle ORM synchronizing to Neon Postgres instance... OK.</span>
            </div>
          ),
        });
        break;
      case 'export --court-ready':
      case 'export --court':
        newHistory.push({
          id: crypto.randomUUID(),
          type: 'output',
          content: 'Packaging ledgers... [Simulated Download Initiated]',
        });
        break;
      case 'clear':
        setHistory([]);
        setInputValue('');
        return;
      default:
        newHistory.push({
          id: crypto.randomUUID(),
          type: 'output',
          content: "Command not recognized. Type 'help' for valid system diagnostics.",
        });
        break;
    }

    setHistory(newHistory);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputValue);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-amber-500 font-mono p-6 selection:bg-amber-500/30">
      <div className="max-w-4xl mx-auto flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {history.map((line) => (
            <div key={line.id} className={line.type === 'input' ? 'text-amber-300 font-bold' : ''}>
              {line.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center">
          <span className="text-amber-300 font-bold mr-2">{'>'}</span>
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-amber-500 placeholder-amber-700/50"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
