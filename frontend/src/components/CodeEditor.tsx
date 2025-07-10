import React from 'react';
import { FileNode } from '../types';
import { File, Code } from 'lucide-react';

interface CodeEditorProps {
  selectedFile: FileNode | null;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ selectedFile }) => {
  if (!selectedFile) {
    return (
      <div className="h-full bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
            <Code className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No File Selected</h3>
          <p className="text-sm text-gray-500 max-w-md">
            Select a file from the file explorer to view and edit its contents
          </p>
        </div>
      </div>
    );
  }

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return languageMap[ext || ''] || 'text';
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const colors = {
      tsx: 'text-blue-400', jsx: 'text-blue-400',
      ts: 'text-yellow-400', js: 'text-yellow-400',
      css: 'text-pink-400', html: 'text-orange-400',
      json: 'text-green-400', md: 'text-purple-400'
    };
    return colors[ext as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className="h-full bg-[#0d1117] flex flex-col">
      {/* File Header */}
      <div className="bg-[#111111] border-b border-gray-800/50 px-4 py-3 flex items-center space-x-3 flex-shrink-0">
        <File className={`w-4 h-4 ${getFileIcon(selectedFile.name)}`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-200 truncate">{selectedFile.name}</h3>
          <p className="text-xs text-gray-500 truncate">{selectedFile.path}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
            {getLanguage(selectedFile.name)}
          </span>
          <span className="text-xs text-gray-500">
            {selectedFile.content?.split('\n').length || 0} lines
          </span>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto">
        <div className="h-full">
          <pre className="h-full p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
            {selectedFile.content || '// File is empty'}
          </pre>
        </div>
      </div>
    </div>
  );
};