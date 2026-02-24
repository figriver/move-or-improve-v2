'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Question, Responses } from '@/types';
import CategorySidebar from './category-sidebar';

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
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [currentQuestionIndexInCategory, setCurrentQuestionIndexInCategory] = useState(0);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/quiz/${params.sessionId}`);
        const { categories } = res.data;
        setSessionData(res.data);
        
        // Set first category as current
        if (categories && categories.length > 0) {
          setCurrentCategoryId(categories[0].id);
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

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setCurrentCategoryId(categoryId);
    setCurrentQuestionIndexInCategory(0);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndexInCategory > 0) {
      setCurrentQuestionIndexInCategory(currentQuestionIndexInCategory - 1);
    }
  };

  const handleNextQuestion = () => {
    const currentCategory = sessionData?.categories.find(c => c.id === currentCategoryId);
    if (currentCategory && currentQuestionIndexInCategory < currentCategory.questions.length - 1) {
      setCurrentQuestionIndexInCategory(currentQuestionIndexInCategory + 1);
    }
  };

  const handlePreviousCategory = () => {
    if (!sessionData) return;
    const currentIndex = sessionData.categories.findIndex(c => c.id === currentCategoryId);
    if (currentIndex > 0) {
      setCurrentCategoryId(sessionData.categories[currentIndex - 1].id);
      setCurrentQuestionIndexInCategory(0);
    }
  };

  const handleNextCategory = () => {
    if (!sessionData) return;
    const currentIndex = sessionData.categories.findIndex(c => c.id === currentCategoryId);
    if (currentIndex < sessionData.categories.length - 1) {
      setCurrentCategoryId(sessionData.categories[currentIndex + 1].id);
      setCurrentQuestionIndexInCategory(0);
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
    return <div className="flex items-center justify-center h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div><p className="text-gray-600">Loading quiz...</p></div></div>;
  }

  if (error && !sessionData) {
    return <div className="flex items-center justify-center h-screen"><div className="text-center text-red-600"><p className="text-lg font-semibold mb-2">Error</p><p>{error}</p></div></div>;
  }

  if (!sessionData) {
    return <div className="flex items-center justify-center h-screen"><div className="text-center text-gray-600"><p className="text-lg font-semibold mb-2">No session found</p></div></div>;
  }

  const currentCategory = sessionData.categories.find(c => c.id === currentCategoryId);
  if (!currentCategory) {
    return <div className="flex items-center justify-center h-screen"><div className="text-center text-gray-600"><p>Loading category...</p></div></div>;
  }

  const currentQuestion = currentCategory.questions[currentQuestionIndexInCategory];
  const currentCategoryIndex = sessionData.categories.findIndex(c => c.id === currentCategoryId);
  const isLastQuestion = currentQuestionIndexInCategory === currentCategory.questions.length - 1;
  const isLastCategory = currentCategoryIndex === sessionData.categories.length - 1;
  const progress = ((currentQuestionIndexInCategory + 1) / currentCategory.totalCount) * 100;

  return (
    <div className="quiz-page-container">
      {/* Sidebar */}
      <div className="quiz-sidebar">
        <CategorySidebar
          categories={sessionData.categories}
          currentCategoryId={currentCategoryId}
          onCategorySelect={handleCategorySelect}
          currentRecommendation={sessionData.currentRecommendation}
          recommendationConfidence={sessionData.recommendationConfidence}
          totalAnswered={sessionData.answeredQuestions}
          totalQuestions={sessionData.totalQuestions}
        />
      </div>

      {/* Main Content */}
      <div className="quiz-main-content">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-header-max">
            <div>
              <h1>{currentCategory.label}</h1>
              {currentCategory.description && (
                <p>{currentCategory.description}</p>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="quiz-progress-section">
              <div className="quiz-progress-label">
                <span>
                  Question {currentQuestionIndexInCategory + 1} of {currentCategory.totalCount}
                </span>
                <span>
                  {currentCategory.answeredCount}/{currentCategory.totalCount} answered
                </span>
              </div>
              <div className="quiz-progress-bar-container">
                <div
                  className="quiz-progress-bar-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="quiz-content-area">
          <div className="quiz-content-wrapper">
            {error && (
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px'
              }}>
                <p style={{
                  color: '#991b1b',
                  fontSize: '14px'
                }}>{error}</p>
              </div>
            )}

            <div className="quiz-question-wrapper">
              <h2 className="quiz-question-text">
                {currentQuestion.text}
              </h2>

              <div className="quiz-question-input-area">
                {renderQuestionInput(currentQuestion, answers[currentQuestion.id] ?? "", (value) =>
                  handleAnswer(currentQuestion.id, value)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="quiz-footer">
          <div className="quiz-footer-max">
            <div className="quiz-nav-group">
              <button
                onClick={handlePreviousCategory}
                disabled={currentCategoryIndex === 0}
                className="quiz-nav-button"
              >
                ← Previous Category
              </button>
              
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndexInCategory === 0 && currentCategoryIndex === 0}
                className="quiz-nav-button"
              >
                ← Previous
              </button>
            </div>

            <div className="quiz-category-indicator">
              {currentCategoryIndex + 1} of {sessionData.categories.length} categories
            </div>

            <div className="quiz-nav-group">
              <button
                onClick={handleNextQuestion}
                disabled={isLastQuestion && isLastCategory}
                className="quiz-nav-button primary"
              >
                Next →
              </button>

              <button
                onClick={handleNextCategory}
                disabled={isLastCategory}
                className="quiz-nav-button primary"
              >
                Next Category →
              </button>

              {isLastQuestion && isLastCategory && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="quiz-nav-button success"
                >
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
              )}
            </div>
          </div>
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
                      ? selectedValues.filter(v => v !== opt.value)
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
