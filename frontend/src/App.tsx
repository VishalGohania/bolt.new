import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Builder } from './components/Builder';
import { mockFileStructure } from './data/mockData';

type AppState = 'landing' | 'builder';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');

  const handlePromptSubmit = (prompt: string) => {
    setCurrentPrompt(prompt);
    setCurrentState('builder');
  };

  const handleBack = () => {
    setCurrentState('landing');
    setCurrentPrompt('');
  };

  return (
    <div className="h-screen">
      {currentState === 'landing' ? (
        <LandingPage onSubmit={handlePromptSubmit} />
      ) : (
        <Builder
          prompt={currentPrompt}
          files={mockFileStructure}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;