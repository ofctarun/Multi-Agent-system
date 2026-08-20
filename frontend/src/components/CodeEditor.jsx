import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Save, X, FileCode, Check, Loader2, Code2 } from 'lucide-react';

function getMonacoLanguage(filename) {
  if (!filename) return 'javascript';
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jsx':
    case 'tsx':
    case 'js':
    case 'ts':
      return 'javascript';
    case 'css':
    case 'scss':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

export default function CodeEditor({ 
  openFiles = [], 
  activeFile, 
  onSelectTab, 
  onCloseTab, 
  fileContents = {}, 
  onContentChange, 
  onSaveFile,
  isSaving,
  isReading
}) {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentContent = activeFile ? (fileContents[activeFile]?.content ?? '') : '';
  const isDirty = activeFile ? (fileContents[activeFile]?.isDirty ?? false) : false;

  const handleSave = async () => {
    if (!activeFile || !isDirty) return;
    const success = await onSaveFile(activeFile, currentContent);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, currentContent, isDirty]);

  if (!activeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-slate-500 p-6 select-none">
        <Code2 className="w-12 h-12 text-slate-700 mb-3" />
        <p className="text-sm font-medium text-slate-400">No File Open</p>
        <p className="text-xs text-slate-600 mt-1">Select a file from the explorer on the left to edit code</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* File Tabs & Actions Bar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between px-2 select-none shrink-0">
        {/* Open File Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {openFiles.map((filePath) => {
            const fileName = filePath.split('/').pop();
            const isActive = activeFile === filePath;
            const fileDirty = fileContents[filePath]?.isDirty;

            return (
              <div
                key={filePath}
                onClick={() => onSelectTab(filePath)}
                className={`group flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-t-md cursor-pointer border-t-2 transition-all ${
                  isActive
                    ? 'bg-slate-950 text-indigo-300 border-indigo-500 font-medium'
                    : 'bg-slate-900/60 text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
                <span className="truncate max-w-[140px]">{fileName}</span>
                {fileDirty && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(filePath);
                  }}
                  className="p-0.5 hover:bg-slate-700/60 rounded text-slate-500 hover:text-slate-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pl-2">
          {isReading && (
            <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-mono">
              <Loader2 className="w-3 h-3 animate-spin" />
              Reading...
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              saveSuccess
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/50'
                : isDirty
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saveSuccess ? 'Saved!' : 'Save (Ctrl+S)'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative bg-slate-950">
        <Editor
          height="100%"
          path={activeFile}
          language={getMonacoLanguage(activeFile)}
          value={currentContent}
          onChange={(value) => onContentChange(activeFile, value || '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
          }}
          loading={
            <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Loading Code Editor...</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
