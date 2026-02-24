'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Question, Responses } from '@/types';
import CategorySidebar from './category-sidebar';
import RecommendationPanel from './recommendation-panel';

interface CategoryData {
  id: string;
  name: string;
  label: string;
  description?: string;
  sortOrder: number;
  questions: Question[];
  totalCount: number;
  answeredCount: number;
}

interface SessionData {
  sessionId: string;
  categories: CategoryData[];
  totalQuestions: number;
  answeredQuestions: number;
  currentRecommendation: {
    decision: string;
    leanStrength: string;
    decisionIndex: number;
  } | null;
  recommendationConfidence: number;
}

export default function QuizPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [answers, setAnswers] = useState<Responses>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/quiz/${params.sessionId}`);
        const { categories } = res.data;
        setSessionData(res.data);

        // Set first category as active
        if (categories && categories.length > 0) {
          setActiveCategoryId(categories[0].id);
        }

        // Initialize answers object with empty strings
        const allQuestions = categories.flatMap((c: CategoryData) => c.questions);
        setAnswers(Object.fromEntries(allQuestions.map((q: Question) => [q.id, ''])));
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [params.sessionId]);

  // Set up intersection observer for active category tracking
  useEffect(() => {
    if (!sessionData) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.getAttribute('data-category-id');
            if (categoryId) {
              setActiveCategoryId(categoryId);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe all category sections
    sessionData.categories.forEach((category) => {
      const element = categoryRefs.current[category.id];
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sessionData]);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleScrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !sessionData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-gray-600">
          <p className="text-lg font-semibold mb-2">No session found</p>
        </div>
      </div>
    );
  }

  const allQuestions = sessionData.categories.flatMap((c) => c.questions);

  return (
    <div className="quiz-page-container-grouped">
      {/* Left Sidebar */}
      <div className="quiz-sidebar-grouped">
        <CategorySidebar
          categories={sessionData.categories}
          activeCategoryId={activeCategoryId}
          onCategorySelect={handleScrollToCategory}
          totalAnswered={sessionData.answeredQuestions}
          totalQuestions={sessionData.totalQuestions}
        />
      </div>

      {/* Main Content */}
      <div className="quiz-main-content-grouped">
        {error && (
          <div
            style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              margin: '32px 32px 0',
            }}
          >
            <p
              style={{
                color: '#991b1b',
                fontSize: '14px',
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Grouped Questions */}
        <div className="quiz-grouped-content">
          {sessionData.categories.map((category, categoryIndex) => (
            <div
              key={category.id}
              ref={(el) => {
                if (el) categoryRefs.current[category.id] = el;
              }}
              data-category-id={category.id}
              id={`category-${category.id}`}
              className="category-section"
            >
              <div className="category-section-header">
                <h2 className="category-section-title">{category.label}</h2>
                {category.description && (
                  <p className="category-section-description">{category.description}</p>
                )}
                <div className="category-section-progress">
                  <span>{category.answeredCount}/{category.totalCount} answered</span>
                </div>
              </div>

              <div className="category-questions">
                {category.questions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    className="question-card"
                  >
                    <div className="question-number">
                      Question {categoryIndex > 0 ? categoryIndex * 10 + questionIndex + 1 : questionIndex + 1}
                    </div>
                    <h3 className="question-card-text">{question.text}</h3>
                    <div className="question-card-input">
                      {renderQuestionInput(
                        question,
                        answers[question.id] ?? '',
                        (value) => handleAnswer(question.id, value)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="quiz-submit-section">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="quiz-submit-button"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </div>

      {/* Right Panel - Recommendation */}
      <div className="quiz-recommendation-grouped">
        <RecommendationPanel questions={allQuestions} answers={answers} />
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
            {question.allowNA && <option value="NA">N/A</option>}
          </select>
        </div>
      );
    }

    case 'yes_no': {
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

    case 'numeric_input': {
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

    case 'text_input': {
      return (
        <div className={containerClass}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="form-input"
            placeholder="Enter your response..."
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

    case 'multiple_choice': {
      const selectedValues = value ? value.split(',') : [];
      return (
        <div className={containerClass}>
          <div className="multiple-choice-options">
            {question.options?.map((opt) => (
              <label key={opt.value} className="multiple-choice-option">
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={selectedValues.includes(opt.value)}
                  onChange={(e) => {
                    const newValues = selectedValues.includes(opt.value)
                      ? selectedValues.filter((v) => v !== opt.value)
                      : [...selectedValues, opt.value];
                    onChange(newValues.join(','));
                  }}
                />
                <span>{opt.label}</span>
              </label>
            ))}
            {question.allowNA && (
              <label className="multiple-choice-option">
                <input
                  type="checkbox"
                  value="NA"
                  checked={value === 'NA'}
                  onChange={(e) => onChange(e.target.checked ? 'NA' : '')}
                />
                <span>N/A</span>
              </label>
            )}
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="error-message">
          Unknown question type: {question.type}. Please contact support.
        </div>
      );
  }
}
