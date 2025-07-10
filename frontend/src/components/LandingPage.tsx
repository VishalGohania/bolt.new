import React, { useState } from 'react';
import { Zap, Sparkles, Code2, Palette, Rocket, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onSubmit: (prompt: string) => void;
}


export const LandingPage: React.FC<LandingPageProps> = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const examplePrompts = [
    "Create a modern SaaS landing page with pricing tiers and testimonials",
    "Build a personal portfolio with project showcase and contact form",
    "Design a blog platform with article listings and dark theme",
    "Make an e-commerce product page with image gallery and reviews"
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Zap className="w-8 h-8 text-blue-400" />
                <div className="absolute inset-0 w-8 h-8 bg-blue-400/20 rounded-full blur-md"></div>
              </div>
              <span className="text-xl font-semibold">WebCraft AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                Examples
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                Docs
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">AI-Powered Website Generation</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Build websites
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              with prompts
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Describe your vision and watch as we create production-ready websites with modern React components,
            beautiful styling, and clean code architecture.
          </p>
        </div>

        {/* Main Prompt Input */}
        <div className="relative mb-12">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the website you want to create..."
                className="w-full h-32 px-6 py-4 bg-gray-900/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none backdrop-blur-sm transition-all duration-200 group-hover:border-gray-600/50"
                required
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
            </div>

            <button
              type="submit"
              disabled={!prompt.trim()}
              className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed group"
            >
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </div>

        {/* Example Prompts */}
        <div className="mb-16">
          <p className="text-sm text-gray-500 mb-4 text-center">Try an example:</p>
          <div className="grid md:grid-cols-2 gap-3">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-left p-4 bg-gray-900/30 hover:bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 rounded-xl transition-all duration-200 group"
              >
                <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                  {example}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/15">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Code2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Modern Code</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Clean React components with TypeScript, modern hooks, and industry best practices
              </p>
            </div>
          </div>

          <div className="group">
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/30 hover:bg-purple-500/15">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Palette className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Beautiful Design</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Responsive layouts with Tailwind CSS, smooth animations, and pixel-perfect styling
              </p>
            </div>
          </div>

          <div className="group">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-6 transition-all duration-300 hover:border-green-500/30 hover:bg-green-500/15">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Rocket className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Production Ready</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Optimized, scalable code with proper architecture ready for immediate deployment
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};