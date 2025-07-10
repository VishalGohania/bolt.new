import React, { useState, useEffect } from 'react';
import { ArrowLeft, Code, Eye, Loader, Menu, X } from 'lucide-react';
import { FileExplorer } from './FileExplorer';
import { StepsPanel } from './StepsPanel';
import { CodeEditor } from './CodeEditor';
import { Preview } from './Preview';
import { FileNode, Step, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';

interface BuilderInterfaceProps {
  prompt: string;
  files: FileNode[];
  onBack: () => void;
}

const findFirstFile = (nodes: FileNode[]): FileNode | null => {
  for (const node of nodes) {
    if (node.type === 'file') return node;
    if (node.type === 'folder' && node.children) {
      const firstFile = findFirstFile(node.children);
      if (firstFile) return firstFile;
    }
  }
  return null;
};

// Sort files: folders first, then files, with src folder at the top
const sortFiles = (files: FileNode[]): FileNode[] => {
  return files.sort((a, b) => {
    // src folder always comes first
    if (a.name === 'src' && a.type === 'folder') return -1;
    if (b.name === 'src' && b.type === 'folder') return 1;

    // Then folders before files
    if (a.type === 'folder' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'folder') return 1;

    // Then alphabetical
    return a.name.localeCompare(b.name);
  });
};

export const Builder: React.FC<BuilderInterfaceProps> = ({
  prompt,
  onBack,
}) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "model", content: string; }[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const webcontainer = useWebContainer();

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      const firstFile = findFirstFile(files);
      if (firstFile) setSelectedFile(firstFile);
    }
  }, [files, selectedFile]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;

    steps
      .filter(({ status }) => status === "pending")
      .forEach(step => {
        if (step?.type === StepType.CreateFile) {
          updateHappened = true;
          let parsedPath = step.path?.split('/').filter(Boolean) ?? [];
          let currentFileStructure = originalFiles;
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = currentFolder ? `${currentFolder}/${parsedPath[0]}` : parsedPath[0];
            const currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              let file = currentFileStructure.find(x => x.path === currentFolder);
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: 'file',
                  path: currentFolder,
                  content: step.code
                })
              } else {
                file.content = step.code;
              }
            } else {
              let folder = currentFileStructure.find(x => x.path === currentFolder);
              if (!folder) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: 'folder',
                  path: currentFolder,
                  children: []
                });
              }
              currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      // Sort files before setting them
      const sortedFiles = sortFiles(originalFiles);
      setFiles(sortedFiles);
      setSteps(steps => steps.map((s: Step) => ({
        ...s,
        status: "completed"
      })));
    }
  }, [steps]);

  useEffect(() => {
    const createMountStructure = (files: FileNode[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileNode, isRootFolder: boolean) => {
        if (file.type === 'folder') {
          mountStructure[file.name] = {
            directory: file.children ?
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              )
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }

        return mountStructure[file.name];
      };

      files.forEach(file => processFile(file, true));
      return mountStructure;
    };

    const mountStructure = createMountStructure(files);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    try {
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim()
      });
      setTemplate(true);

      const { prompts, uiPrompts } = response.data;
      const uiRawXml = Array.isArray(uiPrompts?.[0]) ? uiPrompts[0][0] : "";

      const initialParsedSteps = parseXml(uiRawXml);
      const intialSteps: Step[] = initialParsedSteps.map((step, i) => ({
        ...step,
        status: "pending" as const,
        id: `init-step-${i + 1}`,
      }));

      setSteps(intialSteps);
      setLoading(true);

      const stepResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...prompts, prompt].map(parts => ({
          role: 'user',
          content: parts
        }))
      })
      setLoading(false);

      const newSteps = parseXml(stepResponse.data.response);
      if (Array.isArray(newSteps)) {
        setSteps(s => [...s, ...newSteps.map((x, i) => ({
          ...x,
          id: `chat-step-${s.length + i + 1}`,
          status: "pending" as const
        }))]);
      }

      setLlmMessages([...prompts, prompt].map(content => ({
        role: "user",
        content
      })));

      setLlmMessages(x => [...x, { role: "model", content: stepResponse.data.response }]);

    } catch (error) {
      console.error('Error initializing builder:', error);
      setLoading(false);
      setSteps([]);
    }
  }

  useEffect(() => {
    init();
  }, [])

  const sendMessage = async () => {
    if (!userPrompt.trim() || loading) return;

    const newMessage = {
      role: "user" as const,
      content: userPrompt.trim()
    };

    setLoading(true);
    const currentPrompt = userPrompt.trim();
    setUserPrompt(''); // Clear input immediately

    try {
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...llmMessages, newMessage]
      });

      setLoading(false);

      setLlmMessages(x => [...x, newMessage]);
      setLlmMessages(x => [...x, {
        role: "model",
        content: stepsResponse.data.response
      }]);

      const newSteps = parseXml(stepsResponse.data.response);
      if (Array.isArray(newSteps)) {
        setSteps(s => [...s, ...newSteps.map((x, i) => ({
          ...x,
          id: `follow-up-${s.length + i + 1}`,
          status: "pending" as const
        }))]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
      setUserPrompt(currentPrompt); // Restore input on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#111111] border-b border-gray-800/50 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-800/50 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Back</span>
            </button>
            <div className="h-4 w-px bg-gray-700 hidden sm:block" />
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
              <div className="min-w-0">
                <h1 className="text-sm font-medium">WebCraft AI</h1>
                <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-md">{prompt}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded hover:bg-gray-700"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Tab Switcher */}
            <div className="flex bg-gray-800/50 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 rounded-md text-sm transition-all ${activeTab === "code" ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
              >
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Code</span>
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 rounded-md text-sm transition-all ${activeTab === "preview" ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Left Sidebar - Steps Panel */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative z-50 w-80 lg:w-1/4 xl:w-1/5 h-full bg-[#0d1117] border-r border-gray-800/50 flex flex-col transition-transform duration-300 ease-in-out`}>

          {/* Steps Panel */}
          <div className="flex-1 min-h-0">
            <StepsPanel steps={steps} />
          </div>

          {/* Chat Input below Steps Panel */}
          <div className="p-4 border-t border-gray-800/50 bg-[#111111]">
            {loading || !template ? (
              <div className="flex items-center justify-center p-4">
                <Loader className="w-5 h-5 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-gray-400">
                  {!template ? 'Initializing...' : 'Processing...'}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Add Feature</h3>
                <div className="space-y-2">
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe what you want to add..."
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="text-xs text-gray-500">Press Enter to send, Shift+Enter for new line</p>
                    <button
                      onClick={sendMessage}
                      disabled={loading || !userPrompt.trim()}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Explorer - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block lg:w-1/4 xl:w-1/5 bg-[#0d1117] border-r border-gray-800/50">
          <FileExplorer
            files={files}
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#0d1117] min-w-0">
          {activeTab === "code" ? (
            <CodeEditor selectedFile={selectedFile} />
          ) : (
            webcontainer && <Preview webContainer={webcontainer} files={files} />
          )}
        </div>
      </div>
    </div>
  );
};

export const BuilderInterface = Builder;