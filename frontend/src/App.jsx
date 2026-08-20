import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import Terminal from './components/Terminal';
import PreviewIframe from './components/PreviewIframe';
import AIChat from './components/AIChat';
import { 
  startSandbox, 
  listFiles, 
  readFile, 
  updateFiles 
} from './services/api';

export default function App() {
  const [sandboxId, setSandboxId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState('');
  
  // Workspace UI Layout State
  const [layout, setLayout] = useState('split'); // 'split' | 'code' | 'preview'
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isAiChatOpen, setIsAiChatOpen] = useState(true);

  // Workspace Files State
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContents, setFileContents] = useState({});
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isSavingFile, setIsSavingFile] = useState(false);
  const [isFetchingFileList, setIsFetchingFileList] = useState(false);

  /**
   * Start a new Sandbox session
   */
  const handleStartSandbox = async (initialPrompt = null) => {
    setIsCreating(true);
    setCreationStep('Provisioning sandbox container...');

    try {
      // 1. Call API POST http://localhost/api/sandbox/start
      const res = await startSandbox();
      setSandboxId(res.sandboxId);

      setCreationStep('Fetching workspace project structure...');
      // 2. Fetch file list
      const fileList = await listFiles(res.sandboxId);
      setFiles(fileList);

      setCreationStep('Loading default source files...');
      // 3. Set default open file (e.g. src/App.jsx or App.css)
      const defaultFile = fileList.find(f => f === 'src/App.jsx' || f === 'src/App.css') || fileList[0];
      if (defaultFile) {
        setOpenFiles([defaultFile]);
        setActiveFile(defaultFile);
        
        // Read file content
        const content = await readFile(res.sandboxId, defaultFile);
        setFileContents(prev => ({
          ...prev,
          [defaultFile]: { content, isDirty: false }
        }));
      }

      setIsCreating(false);

      // If an initial prompt was provided on the Start screen, auto-invoke AI Chat
      if (initialPrompt) {
        setIsAiChatOpen(true);
      }
    } catch (error) {
      console.error('Failed to create sandbox:', error);
      setIsCreating(false);
    }
  };

  /**
   * Resume an existing Sandbox ID
   */
  const handleResumeSandbox = async (existingId) => {
    setIsCreating(true);
    setCreationStep('Connecting to existing sandbox...');
    setSandboxId(existingId);
    
    try {
      const fileList = await listFiles(existingId);
      setFiles(fileList);

      const defaultFile = fileList.find(f => f === 'src/App.jsx') || fileList[0];
      if (defaultFile) {
        setOpenFiles([defaultFile]);
        setActiveFile(defaultFile);
        const content = await readFile(existingId, defaultFile);
        setFileContents(prev => ({
          ...prev,
          [defaultFile]: { content, isDirty: false }
        }));
      }
    } catch (e) {
      console.error('Failed to resume sandbox:', e);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Refresh file list and reload open files (called on AI updates)
   */
  const handleRefreshWorkspace = async () => {
    if (!sandboxId) return;
    setIsFetchingFileList(true);
    try {
      const updatedList = await listFiles(sandboxId);
      setFiles(updatedList);

      // Re-read currently active file
      if (activeFile) {
        const freshContent = await readFile(sandboxId, activeFile);
        setFileContents(prev => ({
          ...prev,
          [activeFile]: { content: freshContent, isDirty: false }
        }));
      }
    } catch (error) {
      console.error('Workspace refresh error:', error);
    } finally {
      setIsFetchingFileList(false);
    }
  };

  /**
   * Select & Open File in Editor
   */
  const handleSelectFile = async (filePath) => {
    if (!openFiles.includes(filePath)) {
      setOpenFiles(prev => [...prev, filePath]);
    }
    setActiveFile(filePath);

    // If file content not loaded yet, fetch it
    if (!fileContents[filePath]) {
      setIsReadingFile(true);
      try {
        const content = await readFile(sandboxId, filePath);
        setFileContents(prev => ({
          ...prev,
          [filePath]: { content, isDirty: false }
        }));
      } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
      } finally {
        setIsReadingFile(false);
      }
    }
  };

  /**
   * Close Tab
   */
  const handleCloseTab = (filePath) => {
    const updatedTabs = openFiles.filter(f => f !== filePath);
    setOpenFiles(updatedTabs);
    
    if (activeFile === filePath) {
      setActiveFile(updatedTabs.length > 0 ? updatedTabs[updatedTabs.length - 1] : null);
    }
  };

  /**
   * Code Content Editing
   */
  const handleContentChange = (filePath, newContent) => {
    setFileContents(prev => ({
      ...prev,
      [filePath]: { content: newContent, isDirty: true }
    }));
  };

  /**
   * Save File to Agent Backend
   */
  const handleSaveFile = async (filePath, content) => {
    if (!sandboxId) return false;
    setIsSavingFile(true);
    try {
      await updateFiles(sandboxId, [{ file: filePath, content }]);
      setFileContents(prev => ({
        ...prev,
        [filePath]: { content, isDirty: false }
      }));
      return true;
    } catch (error) {
      console.error(`Error saving ${filePath}:`, error);
      return false;
    } finally {
      setIsSavingFile(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation Header */}
      <Header
        sandboxId={sandboxId}
        layout={layout}
        setLayout={setLayout}
        onStartNewSandbox={() => {
          setSandboxId(null);
          setFiles([]);
          setOpenFiles([]);
          setActiveFile(null);
          setFileContents({});
        }}
        isCreating={isCreating}
        isTerminalOpen={isTerminalOpen}
        setIsTerminalOpen={setIsTerminalOpen}
        isAiChatOpen={isAiChatOpen}
        setIsAiChatOpen={setIsAiChatOpen}
      />

      {/* Main Container */}
      {!sandboxId ? (
        <StartScreen
          onStartSandbox={handleStartSandbox}
          isCreating={isCreating}
          creationStep={creationStep}
          onResumeSandbox={handleResumeSandbox}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* AI Chat Drawer Panel */}
          {isAiChatOpen && (
            <div className="w-80 md:w-96 shrink-0 h-full z-20 transition-all">
              <AIChat
                sandboxId={sandboxId}
                onFilesUpdated={handleRefreshWorkspace}
                isOpen={isAiChatOpen}
                onClose={() => setIsAiChatOpen(false)}
              />
            </div>
          )}

          {/* Left Column: File Explorer */}
          {(layout === 'split' || layout === 'code') && (
            <div className="w-56 md:w-64 shrink-0 h-full hidden sm:block">
              <FileExplorer
                files={files}
                activeFile={activeFile}
                onSelectFile={handleSelectFile}
                onRefresh={handleRefreshWorkspace}
                isLoading={isFetchingFileList}
              />
            </div>
          )}

          {/* Center / Main Column: Code Editor & Terminal */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            
            {/* Upper Section: Code Editor / Preview depending on layout */}
            <div className="flex-1 min-h-0 flex overflow-hidden">
              
              {/* Code Editor */}
              {(layout === 'split' || layout === 'code') && (
                <div className="flex-1 min-w-0 h-full">
                  <CodeEditor
                    openFiles={openFiles}
                    activeFile={activeFile}
                    onSelectTab={setActiveFile}
                    onCloseTab={handleCloseTab}
                    fileContents={fileContents}
                    onContentChange={handleContentChange}
                    onSaveFile={handleSaveFile}
                    isSaving={isSavingFile}
                    isReading={isReadingFile}
                  />
                </div>
              )}

              {/* Live Preview Iframe (Shown side-by-side in split, or full in preview layout) */}
              {(layout === 'split' || layout === 'preview') && (
                <div className="flex-1 min-w-0 h-full">
                  <PreviewIframe sandboxId={sandboxId} />
                </div>
              )}

            </div>

            {/* Bottom Terminal Section */}
            {isTerminalOpen && (
              <div className="h-48 md:h-56 shrink-0 z-10">
                <Terminal
                  sandboxId={sandboxId}
                  isOpen={isTerminalOpen}
                  onClose={() => setIsTerminalOpen(false)}
                />
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
