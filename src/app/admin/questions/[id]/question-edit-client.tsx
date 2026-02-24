'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Question, QuestionType, DropdownOption, ScaleLabels } from '@/types';

interface QuestionEditClientProps {
  question: Question & { scoring?: any };
}

export default function QuestionEditClient({
  question: initialQuestion,
}: QuestionEditClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    text: initialQuestion.text || '',
    type: initialQuestion.type as QuestionType,
    scaleMin: initialQuestion.scaleMin || 1,
    scaleMax: initialQuestion.scaleMax || 5,
    scaleLabels: initialQuestion.scaleLabels || {},
    options: initialQuestion.options || [],
    allowNA: initialQuestion.allowNA || false,
    sortOrder: initialQuestion.sortOrder || 0,
    isActive: initialQuestion.isActive !== false,
  });

  const [optionsText, setOptionsText] = useState(
    (formData.options as DropdownOption[])
      .map((o) => (typeof o === 'string' ? o : o.value))
      .join(',') || ''
  );

  const [scaleLabelsText, setScaleLabelsText] = useState(
    JSON.stringify(formData.scaleLabels || {}, null, 2)
  );

  const handleFieldChange = (
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse scale labels and options if needed
      const data: any = {
        ...formData,
      };

      if (formData.type === 'scale' && scaleLabelsText) {
        try {
          data.scaleLabels = JSON.parse(scaleLabelsText);
        } catch (e) {
          setError('Invalid JSON for scale labels');
          setLoading(false);
          return;
        }
      }

      if (
        (formData.type === 'dropdown' || formData.type === 'multiple_choice') &&
        optionsText
      ) {
        data.options = optionsText
          .split(',')
          .map((opt) => opt.trim())
          .filter((opt) => opt)
          .map((value) => ({ value, label: value }));
      }

      const response = await axios.put(
        `/api/admin/questions/${initialQuestion.id}`,
        data
      );

      setSuccess('Question updated successfully');
      setTimeout(() => {
        router.push('/admin/questions');
      }, 1000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to update question'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.delete(`/api/admin/questions/${initialQuestion.id}`);
      setSuccess('Question deleted successfully');
      setTimeout(() => {
        router.push('/admin/questions');
      }, 1000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to delete question'
      );
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Edit Question</h1>
      </div>

      {error && <div className="error-alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}

      <div className="form-card">
        <div className="form-group">
          <label htmlFor="text">Question Text *</label>
          <textarea
            id="text"
            value={formData.text}
            onChange={(e) => handleFieldChange('text', e.target.value)}
            placeholder="Enter question text"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Question Type *</label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) =>
              handleFieldChange('type', e.target.value as QuestionType)
            }
          >
            <option value="scale">Scale (1-5, etc.)</option>
            <option value="yes_no">Yes/No</option>
            <option value="numeric_input">Numeric Input</option>
            <option value="dropdown">Dropdown</option>
            <option value="text_input">Text Input</option>
            <option value="multiple_choice">Multiple Choice</option>
          </select>
        </div>

        {formData.type === 'scale' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="scaleMin">Scale Min</label>
                <input
                  id="scaleMin"
                  type="number"
                  value={formData.scaleMin}
                  onChange={(e) =>
                    handleFieldChange('scaleMin', parseInt(e.target.value))
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="scaleMax">Scale Max</label>
                <input
                  id="scaleMax"
                  type="number"
                  value={formData.scaleMax}
                  onChange={(e) =>
                    handleFieldChange('scaleMax', parseInt(e.target.value))
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="scaleLabels">Scale Labels (JSON)</label>
              <textarea
                id="scaleLabels"
                value={scaleLabelsText}
                onChange={(e) => setScaleLabelsText(e.target.value)}
                placeholder='{"1": "Not at all", "5": "Very much"}'
                rows={3}
              />
              <small>
                Map scale values to labels, e.g.:
                {' {'}
                "1": "Disagree", "5": "Agree"
                {'}'}
              </small>
            </div>
          </>
        )}

        {(formData.type === 'dropdown' ||
          formData.type === 'multiple_choice') && (
          <div className="form-group">
            <label htmlFor="options">
              Options (comma-separated)
            </label>
            <textarea
              id="options"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              placeholder="Option 1, Option 2, Option 3"
              rows={3}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="allowNA">
            <input
              id="allowNA"
              type="checkbox"
              checked={formData.allowNA}
              onChange={(e) =>
                handleFieldChange('allowNA', e.target.checked)
              }
            />
            Allow N/A Responses
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="sortOrder">Sort Order</label>
          <input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) =>
              handleFieldChange('sortOrder', parseInt(e.target.value))
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="isActive">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                handleFieldChange('isActive', e.target.checked)
              }
            />
            Active
          </label>
        </div>

        <div className="form-actions">
          <button
            onClick={handleSave}
            disabled={loading}
            className="button button-primary"
          >
            {loading ? 'Saving...' : 'Save Question'}
          </button>
          <button
            onClick={() => router.back()}
            disabled={loading}
            className="button"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="button button-danger"
          >
            {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
          </button>
          {showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
              className="button"
            >
              Keep
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
