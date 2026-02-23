'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ScoringConfig } from '@/types';

export default function ScoringPageClient() {
  const [config, setConfig] = useState<ScoringConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('/api/admin/scoring');
        setConfig(res.data.scoringConfig || null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load scoring config');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (field: keyof ScoringConfig, value: any) => {
    if (config) {
      setConfig({
        ...config,
        [field]: value,
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.put('/api/admin/scoring', config);
      setSuccess('Scoring configuration updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update scoring config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading scoring config...</div>;
  }

  if (!config) {
    return <div className="error">No scoring configuration found</div>;
  }

  return (
    <div className="admin-page">
      <h1>Scoring Configuration</h1>

      {error && <div className="error-alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}

      <div className="form-card">
        <div className="form-group">
          <label htmlFor="equalWeighting">
            <input
              id="equalWeighting"
              type="checkbox"
              checked={config.equalWeighting}
              onChange={(e) => handleChange('equalWeighting', e.target.checked)}
            />
            Equal Weighting for All Categories
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="naHandling">NA Handling</label>
          <select
            id="naHandling"
            value={config.naHandling}
            onChange={(e) => handleChange('naHandling', e.target.value)}
          >
            <option value="exclude_from_denominator">Exclude from denominator</option>
            <option value="treat_as_neutral">Treat as neutral (0)</option>
          </select>
        </div>

        <h3>Neutral Zone</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="neutralZoneMin">Minimum</label>
            <input
              id="neutralZoneMin"
              type="number"
              value={config.neutralZoneMin}
              onChange={(e) => handleChange('neutralZoneMin', parseFloat(e.target.value))}
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="neutralZoneMax">Maximum</label>
            <input
              id="neutralZoneMax"
              type="number"
              value={config.neutralZoneMax}
              onChange={(e) => handleChange('neutralZoneMax', parseFloat(e.target.value))}
              step="0.1"
            />
          </div>
        </div>

        <h3>Lean Strength Thresholds</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="strongLeanThreshold">Strong Lean</label>
            <input
              id="strongLeanThreshold"
              type="number"
              value={config.strongLeanThreshold}
              onChange={(e) => handleChange('strongLeanThreshold', parseFloat(e.target.value))}
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="moderateLeanThreshold">Moderate Lean</label>
            <input
              id="moderateLeanThreshold"
              type="number"
              value={config.moderateLeanThreshold}
              onChange={(e) => handleChange('moderateLeanThreshold', parseFloat(e.target.value))}
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="slightLeanThreshold">Slight Lean</label>
            <input
              id="slightLeanThreshold"
              type="number"
              value={config.slightLeanThreshold}
              onChange={(e) => handleChange('slightLeanThreshold', parseFloat(e.target.value))}
              step="0.1"
            />
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handleSave} disabled={saving} className="button button-primary">
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
