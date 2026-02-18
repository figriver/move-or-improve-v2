import React from 'react';
import ScaleQuestion from '../components/ScaleQuestion';
import YesNoQuestion from '../components/YesNoQuestion';
import MultiSelectQuestion from '../components/MultiSelectQuestion';
import './Section.css';

function Section2({ answers, onAnswer }) {
  return (
    <div className="section">
      <h2>Attachment & Openness to Moving</h2>
      <p className="section-intro">
        Let's understand your emotional relationship with your current home and neighborhood, and whether moving is a realistic option for you.
      </p>

      <YesNoQuestion
        key="s2_q1"
        questionKey="s2_q1"
        question="Are you open to both moving and remodeling as potential options to resolve what's not working with your home?"
        value={answers.s2_q1}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s2_q2"
        questionKey="s2_q2"
        question="On a scale of 1–10, how much do you like your current neighborhood?"
        value={answers.s2_q2 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s2_q3"
        questionKey="s2_q3"
        question="On a scale of 1–10, how emotionally attached are you to your neighborhood?"
        value={answers.s2_q3 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s2_q4"
        questionKey="s2_q4"
        question="On a scale of 1–10, could nearby neighborhoods also work for your lifestyle?"
        value={answers.s2_q4 || 5}
        onChange={onAnswer}
      />

      <MultiSelectQuestion
        key="s2_q5"
        questionKey="s2_q5"
        question="If you moved, how important would it be to stay in the same neighborhood?"
        options={['Not important', 'Nice but not critical', 'Must stay']}
        value={answers.s2_q5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s2_q6"
        questionKey="s2_q6"
        question="On a scale of 1–10, how emotionally attached are you to your current home itself?"
        value={answers.s2_q6 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s2_q7"
        questionKey="s2_q7"
        question="On a scale of 1–10, if money, time, and hassle were not factors, how strong is your preference to stay in your current home rather than move?"
        value={answers.s2_q7 || 5}
        onChange={onAnswer}
      />

      <YesNoQuestion
        key="s2_q8"
        questionKey="s2_q8"
        question="If cost, time, and stress were truly non-issues, would you still choose to stay and renovate where you are?"
        value={answers.s2_q8}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s2_q9"
        questionKey="s2_q9"
        question="Beyond stress and timeline, on a scale of 1–10, do you fundamentally enjoy the idea of designing and building something new through renovation? Or does it feel unappealing?"
        value={answers.s2_q9 || 5}
        onChange={onAnswer}
      />

      <ScaleQuestion
        key="s2_q10"
        questionKey="s2_q10"
        question="On a scale of 1–10, how confident are you that you could buy a new home and be satisfied with it long-term?"
        value={answers.s2_q10 || 5}
        onChange={onAnswer}
      />

      <YesNoQuestion
        key="s2_q11"
        questionKey="s2_q11"
        question="Have you ever made a major purchase and regretted it later?"
        value={answers.s2_q11}
        onChange={onAnswer}
      />
    </div>
  );
}

export default Section2;
