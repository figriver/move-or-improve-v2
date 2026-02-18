import React from 'react';
import './Question.css';

function ScaleQuestion({ questionKey, question, value, onChange }) {
  return (
    <div className="question">
      <label className="question-text">{question}</label>
      <div className="scale-inputs">
        <input
          type="range"
          min="1"
          max="10"
          value={value || 5}
          onChange={(e) => onChange(questionKey, parseInt(e.target.value))}
          className="slider"
        />
        <div className="scale-labels">
          <span>1</span>
          <span className="scale-value">{value || 5}</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}

export default ScaleQuestion;
