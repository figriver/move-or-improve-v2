import React from 'react';
import './Question.css';

function MultiSelectQuestion({ questionKey, question, options, value, onChange }) {
  return (
    <div className="question">
      <label className="question-text">{question}</label>
      <div className="button-options multi">
        {options.map((option) => (
          <button
            key={option}
            className={`option-btn ${value === option ? 'active' : ''}`}
            onClick={() => onChange(questionKey, option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MultiSelectQuestion;
