'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Question, Responses } from '@/types';

interface SessionData {
  sessionId: string;
  questions: Question[];
  totalQuestions: number;
}

export default function QuizPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [answers, setAnswers] = useState<Responses>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/quiz/${params.sessionId}`);
        const { questions } = res.data;
        setSessionData({
          sessionId: params.sessionId,
          questions,
          totalQuestions: questions.length,
        });
        // Initialize answers object
        setAnswers(Object.fromEntries(questions.map((q: Question) => [q.id, ''])));
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [params.sessionId]);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await axios.post('/api/quiz/submit', {
        sessionId: params.sessionId,
        answers,
      });
      router.push(`/results/${params.sessionId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (error && !sessionData) {
    return <div className="error">{error}</div>;
  }

  if (!sessionData) {
    return <div className="error">No session data found</div>;
  }

  const current = sessionData.questions[currentIndex];
  const progress = ((currentIndex + 1) / sessionData.totalQuestions) * 100;

  return (
    <div className="quiz-session-container">
      <div className="quiz-progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        <span className="progress-text">
          Question {currentIndex + 1} of {sessionData.totalQuestions}
        </span>
      </div>

      <div className="quiz-question-card">
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <h2 className="question-text">{current.text}</h2>

        <div className="question-input">
          {renderQuestionInput(current, answers[current.id] ?? "", (value) =>
            handleAnswer(current.id, value)
          )}
        </div>

        <div className="quiz-navigation">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="nav-button"
          >
            ← Previous
          </button>

          {currentIndex < sessionData.totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="nav-button primary"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="nav-button primary submit"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function renderQuestionInput(
  question: Question,
  value: string,
  onChange: (value: string) => void
) {
  const containerClass = 'question-input-field';

  switch (question.type) {
    case 'scale': {
      const min = question.scaleMin || 1;
      const max = question.scaleMax || 5;
      const labels = question.scaleLabels || {};

      return (
        <div className={containerClass}>
          <div className="scale-options">
            {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
              <label key={num} className="scale-option">
                <input
                  type="radio"
                  name={question.id}
                  value={String(num)}
                  checked={value === String(num)}
                  onChange={(e) => onChange(e.target.value)}
                />
                <span>{num}</span>
                {labels[String(num)] && <span className="label">{labels[String(num)]}</span>}
              </label>
            ))}
          </div>
          {question.allowNA && (
            <label className="na-option">
              <input
                type="radio"
                name={question.id}
                value="NA"
                checked={value === 'NA'}
                onChange={(e) => onChange(e.target.value)}
              />
              <span>N/A</span>
            </label>
          )}
        </div>
      );
    }

    case 'dropdown': {
      return (
        <div className={containerClass}>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="form-select"
          >
            <option value="">Select an option...</option>
            {question.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {question.allowNA && (
              <option value="NA">N/A</option>
            )}
          </select>
        </div>
      );
    }

    case 'yesno': {
      return (
        <div className={containerClass}>
          <div className="yesno-options">
            <label>
              <input
                type="radio"
                name={question.id}
                value="yes"
                checked={value === 'yes'}
                onChange={(e) => onChange(e.target.value)}
              />
              <span>Yes</span>
            </label>
            <label>
              <input
                type="radio"
                name={question.id}
                value="no"
                checked={value === 'no'}
                onChange={(e) => onChange(e.target.value)}
              />
              <span>No</span>
            </label>
            {question.allowNA && (
              <label>
                <input
                  type="radio"
                  name={question.id}
                  value="NA"
                  checked={value === 'NA'}
                  onChange={(e) => onChange(e.target.value)}
                />
                <span>N/A</span>
              </label>
            )}
          </div>
        </div>
      );
    }

    case 'numeric': {
      return (
        <div className={containerClass}>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="form-input"
            placeholder="Enter a number..."
          />
          {question.allowNA && (
            <label className="na-option">
              <input
                type="checkbox"
                checked={value === 'NA'}
                onChange={(e) => onChange(e.target.checked ? 'NA' : '')}
              />
              <span>N/A</span>
            </label>
          )}
        </div>
      );
    }

    default:
      return <div>Unknown question type</div>;
  }
}
