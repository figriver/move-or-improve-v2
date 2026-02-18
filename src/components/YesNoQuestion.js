import React from 'react';
import './Question.css';

function YesNoQuestion({ questionKey, question, value, onChange }) {
  return (
    <div className="question">
      <label className="question-text">{question}</label>
      <div className="button-options">
        <button
          className={`option-btn ${value === 'Yes' ? 'active' : ''}`}
          onClick={() => onChange(questionKey, 'Yes')}
        >
          Yes
        </button>
        <button
          className={`option-btn ${value === 'No' ? 'active' : ''}`}
          onClick={() => onChange(questionKey, 'No')}
        >
          No
        </button>
      </div>
    </div>
  );
}

export default YesNoQuestion;
