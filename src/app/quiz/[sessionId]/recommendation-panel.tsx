'use client';

import React, { useMemo } from 'react';
import { Question, Responses } from '@/types';

interface RecommendationPanelProps {
  questions: Question[];
  answers: Responses;
}

export default function RecommendationPanel({
  questions,
  answers,
}: RecommendationPanelProps) {
  const { recommendation, confidence, confidenceLevel } = useMemo(() => {
    // Get all scale questions
    const scaleQuestions = questions.filter(q => q.type === 'scale');
    
    // Get answered scale questions with numeric values
    const answeredScaleQuestions = scaleQuestions.filter(q => {
      const value = answers[q.id];
      return value && value !== 'NA' && !isNaN(Number(value));
    });

    // Calculate average of answered scale questions
    let average = 0;
    if (answeredScaleQuestions.length > 0) {
      const sum = answeredScaleQuestions.reduce((acc, q) => {
        const value = Number(answers[q.id]);
        return acc + value;
      }, 0);
      average = sum / answeredScaleQuestions.length;
    }

    // Determine recommendation based on average
    let recommendation = 'Mixed signals - more info needed';
    if (average > 6.5) {
      recommendation = 'Strong Move signal';
    } else if (average < 3.5) {
      recommendation = 'Strong Renovate signal';
    }

    // Calculate confidence level
    const totalQuestions = questions.length;
    const answeredCount = Object.values(answers).filter(v => v && v !== '').length;
    const confidencePercent = Math.round((answeredCount / totalQuestions) * 100);

    let confidenceLevel = 'Early signal';
    if (confidencePercent >= 50) {
      confidenceLevel = 'Strong signal';
    } else if (confidencePercent >= 20) {
      confidenceLevel = 'Developing signal';
    }

    return {
      recommendation,
      confidence: confidencePercent,
      confidenceLevel,
    };
  }, [questions, answers]);

  return (
    <div className="recommendation-panel-container">
      <h3 className="recommendation-panel-title">Current Recommendation</h3>
      <div className="recommendation-panel-box">
        <div className="recommendation-panel-label">
          {recommendation}
        </div>
        <div className="recommendation-panel-confidence">
          {confidenceLevel}
        </div>
        <div className="recommendation-panel-percent">
          {confidence}% complete
        </div>
        <div className="recommendation-panel-progress">
          <div
            className="recommendation-panel-progress-bar"
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
