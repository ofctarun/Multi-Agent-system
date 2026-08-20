import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  FileCode, 
  FileJson, 
  FileImage, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  File,
  Code2,
  Terminal,
  Settings
} from 'lucide-react';

/**
 * Builds nested tree from array of relative file paths
 */
function buildFileTree(files) {
  const root = { name: 'root', isDirectory: true, children: {} };

  files.forEach((filePath) => {
    const parts = filePath.split('/').filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          isDirectory: !isLast,
          children: isLast ? null : {},
        };
      }
      current = current.children[part];
    });
  });

  return root;
}

/**
 * Renders file type icon
 */
function getFileIcon(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (filename === 'package.json' || filename === 'package-lock.json') {
    return <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />;
  }
  if (filename.includes('docker') || filename.includes('Dockerfile')) {
    return <Terminal className="w-4 h-4 text-blue-400 shrink-0" />;
  }
  if (filename.includes('config') || filename.startsWith('.')) {
    return <Settings className="w-4 h-4 text-slate-400 shrink-0" />;
  }

  switch (ext) {
    case 'jsx':
    case 'js':
    case 'ts':
    case 'tsx':
      return <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />;
    case 'css':
    case 'scss':
      return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
    case 'html':
      return <FileCode className="w-4 h-4 text-amber-400 shrink-0" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-400 shrink-0" />;
    case 'md':
      return <FileText className="w-4 h-4 text-slate-300 shrink-0" />;
    case 'png':
    case 'svg':
    case 'jpg':
    case 'ico':
      return <FileImage className="w-4 h-4 text-purple-400 shrink-0" />;
    default:
      return <File className="w-4 h-4 text-slate-400 shrink-0" />;
  }
}

function TreeNode({ node, activeFile, onSelectFile, filterQuery }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!node.isDirectory) {
    const isSelected = activeFile === node.path;
    return (
      <button
        onClick={() => onSelectFile(node.path)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md text-left transition-colors font-mono ${
          isSelected 
            ? 'bg-indigo-600/30 text-indigo-200 border-l-2 border-indigo-500 font-medium' 
            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
        }`}
      >
        {getFileIcon(node.name)}
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  const childrenArray = Object.values(node.children || {}).sort((a, b) => {
    if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
    return a.isDirectory ? -1 : 1;
  });

  return (
    <div className="select-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 font-medium text-left hover:bg-slate-800/40 rounded-md transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        )}
        {isOpen ? (
          <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-indigo-400 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {isOpen && (
        <div className="pl-3 border-l border-slate-800/60 ml-2.5 my-0.5 space-y-0.5">
          {childrenArray.map((childNode) => (
            <TreeNode
              key={childNode.path}
              node={childNode}
              activeFile={activeFile}
              onSelectFile={onSelectFile}
              filterQuery={filterQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({ files = [], activeFile, onSelectFile, onRefresh, isLoading }) {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredFiles = useMemo(() => {
    if (!filterQuery.trim()) return files;
    return files.filter((f) => f.toLowerCase().includes(filterQuery.toLowerCase()));
  }, [files, filterQuery]);

  const tree = useMemo(() => buildFileTree(filteredFiles), [filteredFiles]);
  const rootChildren = Object.values(tree.children).sort((a, b) => {
    if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
    return a.isDirectory ? -1 : 1;
  });

  return (
    <div className="h-full flex flex-col bg-slate-900/90 border-r border-slate-800/80 select-none overflow-hidden">
      {/* Header Bar */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span>Files</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono">
            {files.length}
          </span>
        </span>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Refresh File List"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Filter / Search Input */}
      <div className="p-2 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-md pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {rootChildren.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 font-mono">
            {isLoading ? 'Loading workspace files...' : 'No files found.'}
          </div>
        ) : (
          rootChildren.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              activeFile={activeFile}
              onSelectFile={onSelectFile}
              filterQuery={filterQuery}
            />
          ))
        )}
      </div>
    </div>
  );
}
