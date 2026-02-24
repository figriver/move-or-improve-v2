'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Category } from '@/types';

export default function CategoriesPageClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/admin/categories');
        setCategories(res.data.categories || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`/api/admin/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading categories...</div>;
  }

  return (
    <div className="admin-page">
      <Link 
        href="/admin"
        style={{ display: 'inline-block', marginBottom: '16px', cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
      >
        ← Back to Dashboard
      </Link>
      <div className="page-header">
        <h1>Categories</h1>
        <Link href="/admin/categories/new" className="button button-primary">
          + New Category
        </Link>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {categories.length === 0 ? (
        <div className="empty-state">
          <p>No categories yet</p>
          <Link href="/admin/categories/new" className="button">
            Create First Category
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Label</th>
                <th>Weight</th>
                <th>Description</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.label}</td>
                  <td>{c.defaultWeight}</td>
                  <td className="cell-text">{c.description || '—'}</td>
                  <td>{c.isActive ? '✓' : '✗'}</td>
                  <td className="cell-actions">
                    <Link href={`/admin/categories/${c.id}`} className="link-button">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="link-button danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
