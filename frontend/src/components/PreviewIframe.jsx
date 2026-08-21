import React, { useState, useRef } from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Globe, 
  ShieldCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { getPreviewUrl, getDirectPreviewUrl } from '../services/api';

export default function PreviewIframe({ sandboxId, backendPreviewUrl }) {
  const [key, setKey] = useState(0);
  const [device, setDevice] = useState('responsive'); // 'responsive', 'tablet', 'mobile'
  const [useProxy, setUseProxy] = useState(false); // Toggle between Direct URL and Proxy URL
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const iframeRef = useRef(null);

  // Active preview URL
  const activeUrl = backendPreviewUrl 
    ? (useProxy ? getPreviewUrl(sandboxId) : backendPreviewUrl)
    : (useProxy ? getPreviewUrl(sandboxId) : getDirectPreviewUrl(sandboxId));

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

        {/* Address Input Bar & Proxy Toggle */}
        <div className="flex-1 max-w-lg flex items-center gap-2 bg-slate-950/90 border border-slate-800/80 rounded-md px-3 py-1 text-xs text-slate-300 font-mono">
          <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate text-slate-300 flex-1">{activeUrl}</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          
          <button
            onClick={() => {
              setUseProxy(!useProxy);
              handleRefresh();
            }}
            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
            title="Toggle between Direct Domain and Local Dev Proxy"
          >
            {useProxy ? <ToggleRight className="w-3 h-3 text-indigo-400" /> : <ToggleLeft className="w-3 h-3 text-slate-400" />}
            <span>{useProxy ? 'Proxy' : 'Direct'}</span>
          </button>
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
            href={activeUrl}
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

        {/* Error Fallback Banner if iframe fails */}
        {loadError && (
          <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 animate-bounce" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-200">Unable to load direct preview domain</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Switched preview mode or proxy setting might be required for your local environment.
              </p>
            </div>
            <button
              onClick={() => {
                setUseProxy(!useProxy);
                handleRefresh();
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Switch to {useProxy ? 'Direct URL' : 'Proxy Mode'} & Retry
            </button>
          </div>
        )}

        {/* Iframe Viewport */}
        <div className={`transition-all duration-300 flex items-center justify-center ${getWidthStyle()}`}>
          <iframe
            key={key}
            ref={iframeRef}
            src={activeUrl}
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
