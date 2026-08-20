import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  FileSearch, 
  FileDiff, 
  CheckCircle2, 
  Loader2, 
  Wand2,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { invokeAIStream } from '../services/api';

export default function AIChat({ sandboxId, onFilesUpdated, isOpen, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Hello! I am your AI Frontend Engineer. Ask me to design UI components, tweak color themes, build games, or add features to your sandbox application.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusBadge, setStatusBadge] = useState(null); // { type: 'reading' | 'updating' | 'done', text: string }
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, statusBadge]);

  const handleSubmitPrompt = async (e, customPrompt) => {
    if (e) e.preventDefault();
    const activeText = customPrompt || prompt;
    if (!activeText.trim() || isStreaming || !sandboxId) return;

    const userMessageId = `user-${Date.now()}`;
    const aiMessageId = `ai-${Date.now()}`;

    // Add User message
    const userMsg = {
      id: userMessageId,
      sender: 'user',
      text: activeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add empty placeholder for AI response
    const aiMsgPlaceholder = {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      statusLogs: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, aiMsgPlaceholder]);
    setPrompt('');
    setIsStreaming(true);
    setStatusBadge(null);

    let accumulatedText = '';

    await invokeAIStream(
      activeText,
      sandboxId,
      // 1. Chunk received
      (chunkText) => {
        accumulatedText += chunkText;
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg))
        );
      },
      // 2. Status event received (Reading/Updating files)
      (statusType, detailText) => {
        if (statusType === 'Reading files') {
          setStatusBadge({ type: 'reading', text: detailText });
        } else if (statusType === 'Files read') {
          setStatusBadge({ type: 'read_done', text: 'Files read successfully.' });
        } else if (statusType === 'Updating files') {
          setStatusBadge({ type: 'updating', text: detailText });
        } else if (statusType === 'Files updated') {
          setStatusBadge({ type: 'updated_done', text: 'Files updated successfully.' });
          // Auto-trigger workspace file refresh
          onFilesUpdated && onFilesUpdated();
        }
      },
      // 3. Error
      (err) => {
        console.error('AI Stream Error:', err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, text: (msg.text || '') + '\n[Error: Streaming interrupted. Please try again.]' }
              : msg
          )
        );
      }
    );

    setIsStreaming(false);
    setStatusBadge(null);
    onFilesUpdated && onFilesUpdated();
  };

  const samplePrompts = [
    "Make the games in dark theme with color red",
    "Add a responsive navbar with active link highlight",
    "Create a clean counter component with CSS animations",
  ];

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-slate-900 border-r border-slate-800 select-none overflow-hidden">
      {/* AI Chat Header */}
      <div className="h-10 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-purple-600/20 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-200">AI Co-Pilot</span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-[11px] text-purple-400 font-mono animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating...
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text ? (
                  <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.text}</div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    <span>Thinking & analyzing project...</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 font-mono px-1">
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Real-time SSE Status Pill */}
        {statusBadge && (
          <div className="my-2 p-2.5 rounded-xl bg-slate-950/90 border border-purple-500/40 text-xs text-purple-300 font-mono flex items-center gap-2.5 shadow-lg animate-pulse-subtle">
            {statusBadge.type === 'reading' && <FileSearch className="w-4 h-4 text-purple-400 shrink-0" />}
            {statusBadge.type === 'updating' && <FileDiff className="w-4 h-4 text-amber-400 shrink-0" />}
            {(statusBadge.type === 'read_done' || statusBadge.type === 'updated_done') && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{statusBadge.text}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {samplePrompts.map((pText, i) => (
            <button
              key={i}
              onClick={(e) => handleSubmitPrompt(e, pText)}
              disabled={isStreaming}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50"
            >
              <Wand2 className="w-3 h-3 text-purple-400" />
              <span>{pText}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmitPrompt}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask AI to update frontend code..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isStreaming}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors font-sans disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isStreaming}
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-colors shadow-md shadow-purple-600/20"
        >
          {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
