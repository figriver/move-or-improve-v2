'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Question } from '@/types';

export default function QuestionsPageClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('/api/admin/questions');
        setQuestions(res.data.questions || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await axios.delete(`/api/admin/questions/${id}`);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading questions...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Questions</h1>
        <Link href="/admin/questions/new" className="button button-primary">
          + New Question
        </Link>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {questions.length === 0 ? (
        <div className="empty-state">
          <p>No questions yet</p>
          <Link href="/admin/questions/new" className="button">
            Create First Question
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Text</th>
                <th>Type</th>
                <th>Category</th>
                <th>Allow NA</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td className="cell-text">{q.text}</td>
                  <td>{q.type}</td>
                  <td>{q.categoryId}</td>
                  <td>{q.allowNA ? 'Yes' : 'No'}</td>
                  <td>{q.isActive ? '✓' : '✗'}</td>
                  <td className="cell-actions">
                    <Link href={`/admin/questions/${q.id}`} className="link-button">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(q.id)}
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
