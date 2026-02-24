'use client';

import React from 'react';
import { Question } from '@/types';
import './sidebar.css';

interface CategorySidebarProps {
  categories: Array<{
    id: string;
    name: string;
    label: string;
    description?: string;
    sortOrder: number;
    questions: Question[];
    totalCount: number;
    answeredCount: number;
  }>;
  currentCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
  currentRecommendation?: {
    decision: string;
    leanStrength: string;
    decisionIndex: number;
  } | null;
  recommendationConfidence: number;
  totalAnswered: number;
  totalQuestions: number;
}

export default function CategorySidebar({
  categories,
  currentCategoryId,
  onCategorySelect,
  currentRecommendation,
  recommendationConfidence,
  totalAnswered,
  totalQuestions,
}: CategorySidebarProps) {
  const getProgressColor = (confidence: number): string => {
    if (confidence < 33) return '#ef4444';
    if (confidence < 66) return '#eab308';
    return '#22c55e';
  };

  const getDecisionColor = (decision?: string): string => {
    if (!decision) return '#9ca3af';
    if (decision === 'IMPROVE') return '#2563eb';
    if (decision === 'MOVE') return '#ea580c';
    return '#9ca3af';
  };

  return (
    <aside className="sidebar-container">
      {/* Recommendation Display */}
      <div className="sidebar-recommendation-section">
        <h3 className="sidebar-section-title">Current Recommendation</h3>
        
        {currentRecommendation ? (
          <div className="recommendation-box active-recommendation">
            <div 
              className="recommendation-decision"
              style={{ color: getDecisionColor(currentRecommendation.decision) }}
            >
              {currentRecommendation.decision}
            </div>
            <div className="recommendation-detail">
              Lean: {currentRecommendation.leanStrength}
            </div>
            <div className="recommendation-detail">
              Confidence: {recommendationConfidence}%
            </div>
            <div className="recommendation-progress">
              <div
                className="recommendation-progress-bar"
                style={{
                  width: `${recommendationConfidence}%`,
                  backgroundColor: getProgressColor(recommendationConfidence)
                }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="recommendation-box empty-recommendation">
            <div className="recommendation-text">
              Complete questions to see recommendation
            </div>
            <div className="recommendation-detail">
              {totalAnswered} of {totalQuestions} answered ({recommendationConfidence}%)
            </div>
            <div className="recommendation-progress">
              <div
                className="recommendation-progress-bar"
                style={{
                  width: `${recommendationConfidence}%`,
                  backgroundColor: '#3b82f6'
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Categories List */}
      <div className="sidebar-categories-section">
        <h3 className="sidebar-section-title">Categories</h3>
        <div className="categories-list">
          {categories.map((category) => {
            const progress = (category.answeredCount / category.totalCount) * 100;
            const isActive = currentCategoryId === category.id;
            const isCompleted = category.answeredCount === category.totalCount;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`category-button ${isActive ? 'active' : ''}`}
              >
                {/* Category Header */}
                <div className="category-header">
                  <div className="category-info">
                    <div className="category-name">
                      {category.label}
                    </div>
                    <div className="category-progress-text">
                      {category.answeredCount}/{category.totalCount} answered
                    </div>
                  </div>
                  
                  {/* Completion Badge */}
                  {isCompleted && (
                    <div className="completion-badge">
                      <svg className="checkmark-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="category-progress-container">
                  <div
                    className="category-progress-bar"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="sidebar-footer-section">
        <div className="overall-progress-label">
          Overall Progress
        </div>
        <div className="overall-progress-text">
          {totalAnswered}/{totalQuestions} questions answered
        </div>
        <div className="overall-progress-container">
          <div
            className="overall-progress-bar"
            style={{
              width: `${(totalAnswered / totalQuestions) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </aside>
  );
}
