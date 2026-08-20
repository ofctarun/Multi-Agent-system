import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Terminal as TerminalIcon, 
  Code2, 
  Layers, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Cpu,
  Monitor,
  Zap
} from 'lucide-react';

export default function StartScreen({ onStartSandbox, isCreating, creationStep, onResumeSandbox }) {
  const [customSandboxId, setCustomSandboxId] = useState('');

  const samplePrompts = [
    { title: "Dark Theme Arcade", prompt: "Make the games in dark theme with color red" },
    { title: "AI Analytics Dashboard", prompt: "Build a sleek modern analytics dashboard with chart widgets and dark mode" },
    { title: "Product Landing Page", prompt: "Create a high converting SaaS landing page with glassmorphism design" },
    { title: "Interactive Portfolio", prompt: "Design an interactive developer portfolio with smooth animations" },
  ];

  const handleResume = (e) => {
    e.preventDefault();
    if (customSandboxId.trim()) {
      onResumeSandbox(customSandboxId.trim());
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-[#090d16] flex flex-col items-center justify-center p-6 text-slate-100 overflow-hidden">
      {/* Background Decor Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl w-full mx-auto flex flex-col items-center text-center z-10 space-y-8">
        
        {/* Top Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-indigo-400 backdrop-blur-md shadow-inner">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Full-Stack Web Sandbox + AI Co-Pilot + Socket.IO Terminal</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Build & Preview Apps <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              In Real-Time AI Sandbox
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            One-click isolated sandbox environment with full terminal control, 
            live preview iframe, and AI-driven code generation.
          </p>
        </div>

        {/* Primary Start Sandbox Card */}
        <div className="w-full max-w-xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
          {isCreating ? (
            <div className="py-8 space-y-6 flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-slate-950" />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <h3 className="text-lg font-semibold text-white">Initializing Sandbox Environment</h3>
                <p className="text-sm text-indigo-300 font-mono animate-pulse">{creationStep}</p>
              </div>

              <div className="w-full max-w-xs bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-3/4 animate-pulse rounded-full" />
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => onStartSandbox()}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-lg shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Sandbox Environment</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-widest absolute">
                  or connect to existing
                </span>
              </div>

              <form onSubmit={handleResume} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Sandbox ID (e.g. 019e31af-1e2a-70af...)"
                  value={customSandboxId}
                  onChange={(e) => setCustomSandboxId(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
                <button
                  type="submit"
                  disabled={!customSandboxId.trim()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Load
                </button>
              </form>
            </>
          )}
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl text-left">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">AI Code Generation</h4>
              <p className="text-xs text-slate-400 mt-1">Real-time SSE stream with automatic file modification.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TerminalIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Socket.IO Terminal</h4>
              <p className="text-xs text-slate-400 mt-1">xterm.js integration with terminal-input & output events.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Hot Preview Iframe</h4>
              <p className="text-xs text-slate-400 mt-1">Instant browser preview iframe connected to preview domain.</p>
            </div>
          </div>
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="w-full max-w-3xl space-y-3 pt-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick Prompts
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onStartSandbox(p.prompt)}
                className="p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/60 hover:border-indigo-500/50 transition-all group flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-300 group-hover:text-indigo-300">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                    "{p.prompt}"
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
