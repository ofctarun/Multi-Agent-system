import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Terminal as TerminalIcon, RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-react';
import { getAgentUrl } from '../services/api';

export default function Terminal({ sandboxId, isOpen, onClose }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connecting to terminal socket...');

  useEffect(() => {
    if (!sandboxId || !isOpen || !terminalRef.current) return;

    // Create xterm instance
    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        selectionBackground: '#1f6feb',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: 13,
      lineHeight: 1.2,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;34m=== Sandbox Terminal Initialized ===\x1b[0m');
    term.writeln(`Connecting socket to \x1b[33mhttp://${sandboxId}.agent.localhost\x1b[0m...\r\n`);

    // Initialize Socket.io connection to agent
    const agentSocketUrl = getAgentUrl(sandboxId);
    const socket = io(agentSocketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setStatusMessage('Connected');
      term.writeln('\r\n\x1b[1;32m[Connected to Sandbox Shell]\x1b[0m\r\n');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setStatusMessage('Disconnected');
      term.writeln('\r\n\x1b[1;31m[Socket Disconnected]\x1b[0m\r\n');
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      setStatusMessage('Local Shell Mode');
      // Graceful fallback echo so terminal remains interactive for demo/testing
    });

    // 1. Listen for terminal output from backend
    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    // 2. Send terminal input to backend socket
    const dataDisposable = term.onData((data) => {
      if (socket.connected) {
        socket.emit('terminal-input', data);
      } else {
        // Fallback local echo mode if socket connection is offline
        if (data === '\r') {
          term.write('\r\n\x1b[34m$ \x1b[0m');
        } else if (data === '\u007F') {
          term.write('\b \b');
        } else {
          term.write(data);
        }
      }
    });

    // Resize listener
    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        // ignore fit error on hidden container
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      dataDisposable.dispose();
      socket.disconnect();
      term.dispose();
    };
  }, [sandboxId, isOpen]);

  // Refit when tab/panel opens
  useEffect(() => {
    if (isOpen && fitAddonRef.current) {
      setTimeout(() => {
        try {
          fitAddonRef.current.fit();
        } catch (e) {}
      }, 100);
    }
  }, [isOpen]);

  const handleClear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
  };

  const handleReconnect = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-t border-slate-800 select-none overflow-hidden">
      {/* Terminal Header */}
      <div className="h-9 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300 font-mono">Terminal Shell</span>
          <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px]">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-mono">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 font-mono">{statusMessage}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReconnect}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reconnect Socket"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal XTerm Container */}
      <div className="flex-1 relative w-full h-full p-1 overflow-hidden">
        <div ref={terminalRef} className="w-full h-full" />
      </div>
    </div>
  );
}
