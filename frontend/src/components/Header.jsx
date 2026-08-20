import React, { useState } from 'react';
import { 
  Box, 
  Terminal as TerminalIcon, 
  Code, 
  Eye, 
  Columns, 
  Copy, 
  Check, 
  PlusCircle, 
  Sparkles, 
  Server,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { getPreviewUrl } from '../services/api';

export default function Header({ 
  sandboxId, 
  layout, 
  setLayout, 
  onStartNewSandbox, 
  isCreating, 
  isTerminalOpen, 
  setIsTerminalOpen,
  isAiChatOpen,
  setIsAiChatOpen
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (!sandboxId) return;
    navigator.clipboard.writeText(sandboxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewUrl = getPreviewUrl(sandboxId);

  return (
    <header className="h-14 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Brand Logo & Sandbox Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-lg text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            SandboxAI
          </span>
        </div>

        {sandboxId ? (
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-full px-3 py-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 hidden sm:inline">ID:</span>
            <code className="text-indigo-300 font-mono font-medium max-w-[120px] sm:max-w-[180px] truncate">
              {sandboxId}
            </code>
            <button
              onClick={handleCopyId}
              title="Copy Sandbox ID"
              className="text-slate-400 hover:text-white transition-colors p-0.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-3 py-1 text-xs text-slate-400">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>No Active Sandbox</span>
          </div>
        )}
      </div>

      {/* Main Workspace View Controls */}
      {sandboxId && (
        <div className="flex items-center bg-slate-950/80 p-1 rounded-lg border border-slate-800/80 gap-1 text-xs font-medium">
          <button
            onClick={() => setLayout('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              layout === 'split' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Split Code & Preview"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Split</span>
          </button>
          
          <button
            onClick={() => setLayout('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              layout === 'code' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Focus Code Editor"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Code</span>
          </button>

          <button
            onClick={() => setLayout('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              layout === 'preview' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Focus Live Preview"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Preview</span>
          </button>
        </div>
      )}

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-2">
        {sandboxId && (
          <>
            {/* Toggle AI Chat Panel */}
            <button
              onClick={() => setIsAiChatOpen(!isAiChatOpen)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                isAiChatOpen
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Chat</span>
            </button>

            {/* Toggle Terminal Panel */}
            <button
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                isTerminalOpen
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Terminal</span>
            </button>

            {/* External Preview Link */}
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              title="Open Preview in New Window"
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700/60 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </>
        )}

        {/* Start New Sandbox Button */}
        <button
          onClick={onStartNewSandbox}
          disabled={isCreating}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
        >
          {isCreating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <PlusCircle className="w-3.5 h-3.5" />
          )}
          <span>{sandboxId ? 'New Sandbox' : 'Start Sandbox'}</span>
        </button>
      </div>
    </header>
  );
}
