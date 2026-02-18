import React from 'react';
import ScaleQuestion from '../components/ScaleQuestion';
import YesNoQuestion from '../components/YesNoQuestion';
import MultiSelectQuestion from '../components/MultiSelectQuestion';
import './Section.css';

function Section1({ answers, onAnswer }) {
  return (
    <div className="section">
      <h2>Location & Lifestyle Fit</h2>
      <p className="section-intro">
        Some problems cannot be solved through renovation alone. Let's identify whether your core issue is the location or the home itself.
      </p>

      <ScaleQuestion
        key="s1_q1"
        questionKey="s1_q1"
        question="On a scale of 1–10, how safe do you feel in your current location due to crime, traffic, or other factors?"
        value={answers.s1_q1 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q2"
        questionKey="s1_q2"
        question="On a scale of 1–10, how realistically could safety concerns be improved without moving?"
        value={answers.s1_q2 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q3"
        questionKey="s1_q3"
        question="On a scale of 1–10, are there environmental or situational factors that make living here unbearable (noise, flooding, difficult neighbors, health concerns, etc.)?"
        value={answers.s1_q3 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q4"
        questionKey="s1_q4"
        question="On a scale of 1–10, how realistically could those factors be mitigated without moving?"
        value={answers.s1_q4 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q5"
        questionKey="s1_q5"
        question="On a scale of 1–10, how negatively does your location impact your daily life due to commute, proximity to family, access to medical care, or kids' school?"
        value={answers.s1_q5 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q6"
        questionKey="s1_q6"
        question="On a scale of 1–10, how realistically could that be improved without moving?"
        value={answers.s1_q6 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q7"
        questionKey="s1_q7"
        question="On a scale of 1–10, how well does your current school district meet your family's needs?"
        value={answers.s1_q7 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q8"
        questionKey="s1_q8"
        question="On a scale of 1–10, how realistically could educational needs be met without moving?"
        value={answers.s1_q8 || 5}
        onChange={onAnswer}
      />

      <YesNoQuestion
        key="s1_q9"
        questionKey="s1_q9"
        question="Does your home have underutilized or unfinished space (basement, attic, garage, unused rooms, yard space) that could be reimagined?"
        value={answers.s1_q9}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q10"
        questionKey="s1_q10"
        question="On a scale of 1–10, does your current property type match what you actually need?"
        value={answers.s1_q10 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q11"
        questionKey="s1_q11"
        question="On a scale of 1–10, how realistic is it to modify your current property type to fit that need?"
        value={answers.s1_q11 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q12"
        questionKey="s1_q12"
        question="On a scale of 1–10, is your home's fundamental floor plan a problem?"
        value={answers.s1_q12 || 5}
        onChange={onAnswer}
      />

      <MultiSelectQuestion
        key="s1_q13"
        questionKey="s1_q13"
        question="Is this floor plan issue fixable with renovation?"
        options={['Easily fixable', 'Moderately fixable', 'Very difficult', 'Not fixable']}
        value={answers.s1_q13}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q14"
        questionKey="s1_q14"
        question="On a scale of 1–10, are you satisfied with your current yard/outdoor space in terms of size, usability, and potential?"
        value={answers.s1_q14 || 5}
        onChange={onAnswer}
      />

      <MultiSelectQuestion
        key="s1_q15"
        questionKey="s1_q15"
        question="If you need a different yard, is that fixable on your current lot?"
        options={['Yes, easily', 'Yes, with effort', 'No, would need different property']}
        value={answers.s1_q15}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q16"
        questionKey="s1_q16"
        question="On a scale of 1–10, do you believe your neighborhood is appreciating in value, stable, or declining?"
        value={answers.s1_q16 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q17"
        questionKey="s1_q17"
        question="On a scale of 1–10, do the improvements you're considering fit the character and value range of your neighborhood?"
        value={answers.s1_q17 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s1_q18"
        questionKey="s1_q18"
        question="On a scale of 1–10, how concerned are you about over-improving your home relative to the neighborhood?"
        value={answers.s1_q18 || 5}
        onChange={onAnswer}
      />
    </div>
  );
}

export default Section1;
