import React from 'react';
import './Results.css';

function Results({ result, onRestart }) {
  const getResultColor = (type) => {
    switch (type) {
      case 'renovate':
        return '#27ae60';
      case 'move':
        return '#e74c3c';
      case 'uncertain':
        return '#f39c12';
      default:
        return '#3498db';
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'renovate':
        return '🏠';
      case 'move':
        return '🏘️';
      case 'uncertain':
        return '🤔';
      default:
        return '?';
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <div className="results-icon" style={{ fontSize: '64px' }}>
          {getResultIcon(result.type)}
        </div>
        <h1 className="results-title">{result.headline}</h1>
      </div>

      <div className="results-card" style={{ borderTopColor: getResultColor(result.type) }}>
        <p className="results-message">{result.message}</p>

        <div className="results-details">
          <h3>Why This Recommendation</h3>
          <ul>
            {result.reasoning.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>

        <div className="results-scores">
          <h3>Your Assessment Scores</h3>
          <div className="score-grid">
            <div className="score-item">
              <label>Location Issues</label>
              <div className="score-value">{result.locationScore}/10</div>
            </div>
            <div className="score-item">
              <label>Attachment to Home</label>
              <div className="score-value">{result.attachmentScore}/10</div>
            </div>
            <div className="score-item">
              <label>Openness to Moving</label>
              <div className="score-value">{result.opennessScore}/10</div>
            </div>
            <div className="score-item">
              <label>Renovation Fixable</label>
              <div className="score-value">{result.fixableScore}/10</div>
            </div>
          </div>
        </div>

        <div className="next-steps">
          <h3>Next Steps</h3>
          <p>{result.nextSteps}</p>
        </div>
      </div>

      <div className="results-footer">
        <button className="btn btn-primary" onClick={onRestart}>
          Start Over
        </button>
        <p className="results-note">
          This assessment is a starting point, not a final decision. Your gut instinct is senior to this tool.
        </p>
      </div>
    </div>
  );
}

export default Results;
