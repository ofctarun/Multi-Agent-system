import React, { useState, useRef } from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Globe, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { getPreviewUrl } from '../services/api';

export default function PreviewIframe({ sandboxId }) {
  const [key, setKey] = useState(0);
  const [device, setDevice] = useState('responsive'); // 'responsive', 'tablet', 'mobile'
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const iframeRef = useRef(null);

  const previewUrl = getPreviewUrl(sandboxId);

  const handleRefresh = () => {
    setIsLoading(true);
    setLoadError(false);
    setKey((prev) => prev + 1);
  };

  const getWidthStyle = () => {
    switch (device) {
      case 'mobile':
        return 'w-[375px] h-[667px] shadow-2xl border border-slate-700 rounded-2xl overflow-hidden my-auto';
      case 'tablet':
        return 'w-[768px] h-[90%] shadow-2xl border border-slate-700 rounded-xl overflow-hidden my-auto';
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800 overflow-hidden select-none">
      {/* Top Address & Controls Bar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between gap-3 shrink-0">
        
        {/* Device Switcher */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setDevice('responsive')}
            className={`p-1.5 rounded transition-colors ${
              device === 'responsive' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Responsive View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded transition-colors ${
              device === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded transition-colors ${
              device === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Input Bar */}
        <div className="flex-1 max-w-lg flex items-center gap-2 bg-slate-950/90 border border-slate-800/80 rounded-md px-3 py-1 text-xs text-slate-300 font-mono">
          <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate text-slate-300 flex-1">{previewUrl}</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Iframe Canvas Container */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-2 overflow-hidden">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-2 text-xs text-slate-400 font-mono">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Loading Live Preview...</span>
          </div>
        )}

        {/* Iframe Viewport */}
        <div className={`transition-all duration-300 flex items-center justify-center ${getWidthStyle()}`}>
          <iframe
            key={key}
            ref={iframeRef}
            src={previewUrl}
            title="Sandbox Application Live Preview"
            className="w-full h-full border-0 bg-white"
            onLoad={() => {
              setIsLoading(false);
              setLoadError(false);
            }}
            onError={() => {
              setIsLoading(false);
              setLoadError(true);
            }}
          />
        </div>

      </div>
    </div>
  );
}
