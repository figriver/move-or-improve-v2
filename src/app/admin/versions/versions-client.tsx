'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Version {
  id: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  description?: string;
}

export default function VersionsPageClient() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await axios.get('/api/admin/versions');
        setVersions(res.data.versions || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load versions');
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, []);

  const handleActivate = async (versionId: string) => {
    if (!confirm('Activate this version? This will replace the current active version.')) return;

    setActivating(versionId);
    try {
      await axios.post(`/api/admin/versions/${versionId}/activate`);
      setVersions(
        versions.map(v => ({
          ...v,
          isActive: v.id === versionId,
        }))
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to activate version');
    } finally {
      setActivating(null);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading versions...</div>;
  }

  const activeVersion = versions.find(v => v.isActive);

  return (
    <div className="admin-page">
      <h1>Version History</h1>

      {error && <div className="error-alert">{error}</div>}

      {activeVersion && (
        <div className="info-card">
          <h3>Currently Active Version</h3>
          <p>
            <strong>Version {activeVersion.version}</strong> (ID: {activeVersion.id.slice(0, 8)}...)
          </p>
          <p className="metadata">
            Created by {activeVersion.createdBy} on{' '}
            {new Date(activeVersion.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {versions.length === 0 ? (
        <div className="empty-state">
          <p>No versions found</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Created By</th>
                <th>Created At</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.id} className={v.isActive ? 'active-row' : ''}>
                  <td>
                    <strong>v{v.version}</strong>
                  </td>
                  <td>{v.createdBy}</td>
                  <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td className="cell-text">{v.description || '—'}</td>
                  <td>
                    {v.isActive ? (
                      <span className="badge active">Active</span>
                    ) : (
                      <span className="badge">Inactive</span>
                    )}
                  </td>
                  <td className="cell-actions">
                    {!v.isActive && (
                      <button
                        onClick={() => handleActivate(v.id)}
                        disabled={activating === v.id}
                        className="link-button"
                      >
                        {activating === v.id ? 'Activating...' : 'Activate'}
                      </button>
                    )}
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
