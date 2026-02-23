'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardData {
  activeVersion?: {
    version: number;
    createdAt: string;
    createdBy: string;
  };
  totalQuestions: number;
  totalCategories: number;
  totalSessions: number;
  completedSessions: number;
}

export default function AdminDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [versionRes, questionsRes, categoriesRes, sessionsRes] = await Promise.all([
          axios.get('/api/admin/versions?limit=1'),
          axios.get('/api/admin/questions?limit=1'),
          axios.get('/api/admin/categories'),
          axios.get('/api/admin/sessions'),
        ]);

        setData({
          activeVersion: versionRes.data.versions?.[0],
          totalQuestions: questionsRes.data.total || 0,
          totalCategories: categoriesRes.data.total || 0,
          totalSessions: sessionsRes.data.total || 0,
          completedSessions: sessionsRes.data.completed || 0,
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>

      {error && (
        <div className="error-alert">{error}</div>
      )}

      {data && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Active Version</h3>
            {data.activeVersion ? (
              <>
                <p className="card-value">v{data.activeVersion.version}</p>
                <p className="card-detail">
                  Created by {data.activeVersion.createdBy}
                </p>
                <p className="card-detail">
                  {new Date(data.activeVersion.createdAt).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="card-empty">No active version</p>
            )}
          </div>

          <div className="dashboard-card">
            <h3>Total Questions</h3>
            <p className="card-value">{data.totalQuestions}</p>
            <a href="/admin/questions" className="card-link">Manage →</a>
          </div>

          <div className="dashboard-card">
            <h3>Total Categories</h3>
            <p className="card-value">{data.totalCategories}</p>
            <a href="/admin/categories" className="card-link">Manage →</a>
          </div>

          <div className="dashboard-card">
            <h3>Assessment Sessions</h3>
            <p className="card-value">{data.totalSessions}</p>
            <p className="card-detail">
              {data.completedSessions} completed
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Completion Rate</h3>
            <p className="card-value">
              {data.totalSessions > 0
                ? ((data.completedSessions / data.totalSessions) * 100).toFixed(1)
                : 0}%
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <div className="card-links">
              <a href="/admin/questions/new">+ New Question</a>
              <a href="/admin/categories/new">+ New Category</a>
              <a href="/admin/versions">View History</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
