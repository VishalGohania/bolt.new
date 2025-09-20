import { FileNode } from '../types';

export function convertToWebContainerFormat(files: FileNode[]): Record<string, any> {
  const result: Record<string, any> = {};

  function processNode(node: FileNode) {
    const fullPath = node.path.replace(/^\//, ''); // Remove leading slash

    if (node.type === 'file') {
      // Create nested object structure
      const pathParts = fullPath.split('/');
      let current = result;

      // Navigate to the correct nested location
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        current = current[part].directory;
      }

      // Add the file
      const fileName = pathParts[pathParts.length - 1];
      current[fileName] = {
        file: {
          contents: node.content || ''
        }
      };
    } else if (node.type === 'folder' && node.children) {
      // Process children recursively
      node.children.forEach(child => processNode(child));
    }
  }

  files.forEach(node => processNode(node));
  return result;
}
