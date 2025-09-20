import { FileNode, Step } from '../types';

export const mockFileStructure: FileNode[] = [
  {
    name: 'main.tsx',
    type: 'file',
    path: '/src/main.tsx',
    content: `import React from 'react'
  import ReactDOM from 'react-dom/client'
  import App from './App'
  import './index.css'
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )`
  },
  {
    name: 'index.css',
    type: 'file',
    path: '/src/index.css',
    content: `@tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }`
  },
  {
    name: 'tailwind.config.js',
    type: 'file',
    path: '/tailwind.config.js',
    content: `/** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }`
  },
  {
    name: 'vite.config.js',
    type: 'file',
    path: '/vite.config.js',
    content: `import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  
  export default defineConfig({
    plugins: [react()],
  })`
  },
  {
    name: 'src',
    type: 'folder',
    path: '/src',
    children: [
      {
        name: 'components',
        type: 'folder',
        path: '/src/components',
        children: [
          {
            name: 'Header.tsx',
            type: 'file',
            path: '/src/components/Header.tsx',
            content: `import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
};`
          },
          {
            name: 'Button.tsx',
            type: 'file',
            path: '/src/components/Button.tsx',
            content: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = variant === 'primary' 
    ? 'bg-blue-600 hover:bg-blue-700 text-white'
    : 'bg-gray-200 hover:bg-gray-300 text-gray-800';

  return (
    <button 
      className={\`\${baseClasses} \${variantClasses}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};`
          }
        ]
      },
      {
        name: 'App.tsx',
        type: 'file',
        path: '/src/App.tsx',
        content: `import React from 'react';
import { Header } from './components/Header';
import { Button } from './components/Button';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="My Awesome Website" />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Welcome to your new website!</h2>
        <p className="text-lg mb-6">
          This website was generated automatically based on your prompt.
        </p>
        <Button onClick={() => alert('Hello World!')}>
          Click me!
        </Button>
      </main>
    </div>
  );
}

export default App;`
      }
    ]
  },
  {
    name: 'public',
    type: 'folder',
    path: '/public',
    children: [
      {
        name: 'index.html',
        type: 'file',
        path: '/public/index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Awesome Website</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
      }
    ]
  },
  {
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    content: `{
  "name": "my-awesome-website",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.1",
    "vite": "^5.4.2"
  }
}`
  }
];

export const mockSteps: Step[] = [
  {
    id: '1',
    title: 'Analyze Prompt',
    description: 'Understanding your requirements and planning the website structure',
    status: 'completed'
  },
  {
    id: '2',
    title: 'Generate Structure',
    description: 'Creating the file structure and organizing components',
    status: 'completed'
  },
  {
    id: '3',
    title: 'Build Components',
    description: 'Writing React components and implementing functionality',
    status: 'active'
  },
  {
    id: '4',
    title: 'Style Interface',
    description: 'Applying styles and ensuring responsive design',
    status: 'pending'
  },
  {
    id: '5',
    title: 'Optimize & Deploy',
    description: 'Final optimizations and deployment preparation',
    status: 'pending'
  }
];