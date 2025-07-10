import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Search } from 'lucide-react';
import { FileNode } from '../types';

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFile?: FileNode | null;
}

interface FileTreeItemProps {
  node: FileNode;
  onFileSelect: (file: FileNode) => void;
  selectedFile?: FileNode | null;
  level: number;
  searchTerm: string;
}

// Sort function: folders first (with src at top), then files
const sortNodes = (nodes: FileNode[]): FileNode[] => {
  return nodes.sort((a, b) => {
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

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, onFileSelect, selectedFile, level, searchTerm }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const isSelected = selectedFile?.path === node.path;

  const matchesSearch = (node: FileNode, term: string): boolean => {
    if (!term) return true;
    if (node.name.toLowerCase().includes(term.toLowerCase())) return true;
    if (node.children) {
      return node.children.some(child => matchesSearch(child, term));
    }
    return false;
  };

  if (searchTerm && !matchesSearch(node, searchTerm)) {
    return null;
  }

  const shouldExpand = searchTerm ? true : isExpanded;

  const handleToggle = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node);
    }
  };

  const getIcon = () => {
    if (node.type === 'folder') {
      return shouldExpand ? (
        <FolderOpen className="w-4 h-4 text-blue-400" />
      ) : (
        <Folder className="w-4 h-4 text-blue-400" />
      );
    }
    return <File className="w-4 h-4 text-gray-400" />;
  };

  const getFileColor = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const colors = {
      tsx: 'text-blue-400', jsx: 'text-blue-400',
      ts: 'text-yellow-400', js: 'text-yellow-400',
      css: 'text-pink-400', html: 'text-orange-400',
      json: 'text-green-400'
    };
    return colors[ext as keyof typeof colors] || 'text-gray-400';
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-400/30 text-yellow-300">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Sort children before rendering
  const sortedChildren = node.children ? sortNodes(node.children) : [];

  return (
    <div>
      <div
        className={`flex items-center space-x-2 py-2 px-3 hover:bg-gray-700/50 cursor-pointer rounded text-sm transition-colors ${isSelected ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-500' : 'text-gray-300'
          }`}
        onClick={handleToggle}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {node.type === 'folder' && (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            {shouldExpand ?
              <ChevronDown className="w-3 h-3 text-gray-500" /> :
              <ChevronRight className="w-3 h-3 text-gray-500" />
            }
          </span>
        )}
        {node.type === 'file' && <span className="w-4 h-4 flex-shrink-0" />}
        <span className="flex-shrink-0">{getIcon()}</span>
        <span className={`flex-1 truncate min-w-0 ${node.type === 'file' ? getFileColor(node.name) : 'text-gray-300'}`}>
          {highlightText(node.name, searchTerm)}
        </span>
      </div>
      {node.type === 'folder' && shouldExpand && sortedChildren.length > 0 && (
        <div>
          {sortedChildren.map((child, index) => (
            <FileTreeItem
              key={`${child.path}-${index}`}
              node={child}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              level={level + 1}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect, selectedFile }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sort files at the root level
  const sortedFiles = sortNodes(files);

  return (
    <div className="h-full bg-[#0d1117] flex flex-col">
      <div className="p-4 border-b border-gray-800/50 bg-[#111111] flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-200 mb-3">Files</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-gray-800/50 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-2 overflow-y-auto min-h-0">
        {sortedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files yet</p>
            <p className="text-xs mt-1 text-gray-600">Files will appear here as they're created</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedFiles.map((file, index) => (
              <FileTreeItem
                key={`${file.path}-${index}`}
                node={file}
                onFileSelect={onFileSelect}
                selectedFile={selectedFile}
                level={0}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        )}

        {searchTerm && sortedFiles.length > 0 && sortedFiles.every(file => {
          const matchesSearch = (node: FileNode, term: string): boolean => {
            if (node.name.toLowerCase().includes(term.toLowerCase())) return true;
            if (node.children) {
              return node.children.some(child => matchesSearch(child, term));
            }
            return false;
          };
          return !matchesSearch(file, searchTerm);
        }) && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files found matching "{searchTerm}"</p>
            </div>
          )}
      </div>
    </div>
  );
};