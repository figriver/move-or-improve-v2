import React, { useState, useEffect } from 'react';
import './App.css';
import Section1 from './sections/Section1';
import Section2 from './sections/Section2';
import Results from './components/Results';
import { calculateScore } from './utils/scoring';

function App() {
  const [currentSection, setCurrentSection] = useState(1);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('moveImproveAnswers');
    if (saved) {
      setAnswers(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever answers change
  useEffect(() => {
    localStorage.setItem('moveImproveAnswers', JSON.stringify(answers));
  }, [answers]);

  const handleAnswer = (questionKey, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const handleNext = () => {
    if (currentSection === 1) {
      setCurrentSection(2);
    } else if (currentSection === 2) {
      // Calculate results
      const result = calculateScore(answers);
      setResults(result);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleRestart = () => {
    localStorage.removeItem('moveImproveAnswers');
    setAnswers({});
    setCurrentSection(1);
    setResults(null);
  };

  if (results) {
    return (
      <div className="app">
        <Results result={results} onRestart={handleRestart} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Move or Improve?</h1>
        <p>Get clarity on your best path forward</p>
      </header>

      <div className="container">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(currentSection / 2) * 100}%` }}></div>
        </div>

        <div className="section-indicator">
          Section {currentSection} of 2
        </div>

        {currentSection === 1 && (
          <Section1 answers={answers} onAnswer={handleAnswer} />
        )}

        {currentSection === 2 && (
          <Section2 answers={answers} onAnswer={handleAnswer} />
        )}

        <div className="button-group">
          <button
            className="btn btn-secondary"
            onClick={handlePrevious}
            disabled={currentSection === 1}
          >
            ← Previous
          </button>

          <button
            className="btn btn-primary"
            onClick={handleNext}
          >
            {currentSection === 2 ? 'Get Results' : 'Next Section →'}
          </button>
        </div>

        <p className="progress-note">
          You can close this browser and come back later. Your answers are saved.
        </p>
      </div>
    </div>
  );
}

export default App;
