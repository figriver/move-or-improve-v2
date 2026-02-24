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
  activeCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
  totalAnswered: number;
  totalQuestions: number;
}

export default function CategorySidebar({
  categories,
  activeCategoryId,
  onCategorySelect,
  totalAnswered,
  totalQuestions,
}: CategorySidebarProps) {
  return (
    <aside className="sidebar-container">
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

      {/* Categories List */}
      <div className="sidebar-categories-section">
        <h3 className="sidebar-section-title">Categories</h3>
        <div className="categories-list">
          {categories.map((category) => {
            const progress = (category.answeredCount / category.totalCount) * 100;
            const isActive = activeCategoryId === category.id;
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
    </aside>
  );
}
