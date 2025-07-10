import { FileNode } from '../types';
import JSZip from 'jszip';

export const downloadProjectFiles = async (files: FileNode[], projectName: string) => {
  const zip = new JSZip();
  
  // Sanitize project name for filename
  const sanitizedName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50) || 'webcraft-project';

  // Recursively add files to zip
  const addFilesToZip = (nodes: FileNode[], currentPath: string = '') => {
    nodes.forEach(node => {
      const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
      
      if (node.type === 'file' && node.content) {
        zip.file(fullPath, node.content);
      } else if (node.type === 'folder' && node.children) {
        // Create folder and add its contents
        addFilesToZip(node.children, fullPath);
      }
    });
  };

  // Add README with instructions
  const readmeContent = `# ${projectName}

This project was generated using WebCraft AI.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open your browser and navigate to the URL shown in the terminal (usually http://localhost:5173)

## Project Structure

This is a modern React application built with:
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Modern ES6+ features

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build locally
- \`npm run lint\` - Run ESLint

## Deployment

You can deploy this project to any static hosting service like:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

For more information, check the Vite documentation: https://vitejs.dev/guide/static-deploy.html

---

Generated with ❤️ by WebCraft AI
`;

  zip.file('README.md', readmeContent);
  
  // Add all project files
  addFilesToZip(files);

  try {
    // Generate zip file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Create download link
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizedName}.zip`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Show success message (you could replace this with a toast notification)
    console.log('Project files downloaded successfully!');
  } catch (error) {
    console.error('Error creating zip file:', error);
    alert('Failed to download project files. Please try again.');
  }
};