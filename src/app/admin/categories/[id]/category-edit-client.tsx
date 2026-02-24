'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Category } from '@/types';

interface CategoryEditClientProps {
  category: Category;
}

export default function CategoryEditClient({
  category: initialCategory,
}: CategoryEditClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: initialCategory.name || '',
    label: initialCategory.label || '',
    description: initialCategory.description || '',
    defaultWeight: initialCategory.defaultWeight || 1,
    sortOrder: initialCategory.sortOrder || 0,
    isActive: initialCategory.isActive !== false,
  });

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
      await axios.put(
        `/api/admin/categories/${initialCategory.id}`,
        formData
      );

      setSuccess('Category updated successfully');
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to update category'
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
      await axios.delete(`/api/admin/categories/${initialCategory.id}`);
      setSuccess('Category deleted successfully');
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to delete category'
      );
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <button
            onClick={() => router.back()}
            className="back-button"
            style={{ marginBottom: '16px', cursor: 'pointer', color: '#007bff', background: 'none', border: 'none', fontSize: '14px', textDecoration: 'underline' }}
          >
            ← Back to Categories
          </button>
          <h1>Edit Category</h1>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}

      <div className="form-card">
        <div className="form-group">
          <label htmlFor="name">Category Name *</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Enter category name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="label">Category Label *</label>
          <input
            id="label"
            type="text"
            value={formData.label}
            onChange={(e) => handleFieldChange('label', e.target.value)}
            placeholder="Enter category label"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Enter category description (optional)"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="defaultWeight">Default Weight</label>
          <input
            id="defaultWeight"
            type="number"
            value={formData.defaultWeight}
            onChange={(e) =>
              handleFieldChange('defaultWeight', parseFloat(e.target.value))
            }
            step="0.1"
          />
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
            {loading ? 'Saving...' : 'Save Category'}
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
