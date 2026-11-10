'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';

type LeetCodeStats = {
  username: string;
  profileUrl: string;
  solved: { total: number; easy: number; medium: number; hard: number };
  ranking: number;
  reputation?: number;
  starRating?: number;
};

const FALLBACK_URL = 'https://leetcode.com/nizarkadri/';

export default function LeetCodeProfile() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/leetcode');
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch LeetCode data');
      }
      setStats(await response.json());
    } catch (err) {
      console.error('Error fetching LeetCode stats:', err);
      setError('Could not load the LeetCode profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = stats?.solved.total ?? 0;
  const share = (n: number) => (total > 0 ? n / total : 0);
  const levels = stats
    ? ([['Easy', stats.solved.easy], ['Medium', stats.solved.medium], ['Hard', stats.solved.hard]] as const)
    : [];

  return (
    <article className="lg-panel ae-live" aria-labelledby="ae-leetcode-title">
      <header className="ae-live__head">
        <h3 id="ae-leetcode-title" className="lg-display lg-display--sm">LeetCode</h3>
        <a className="lg-link" href={stats?.profileUrl ?? FALLBACK_URL} target="_blank" rel="noopener noreferrer">
          Profile
        </a>
      </header>

      {loading && <p className="ae-live__state" role="status" aria-busy="true">Fetching solved problems.</p>}

      {!loading && (error || !stats) && (
        <div className="ae-live__state" role="alert">
          <p>{error ?? 'Could not load the LeetCode profile.'}</p>
          <button type="button" className="ae-btn" onClick={load}>Try again</button>
        </div>
      )}

      {!loading && !error && stats && (
        <div className="ae-live__body">
          <dl className="ae-figs ae-figs--sm">
            <div className="ae-figs__main">
              <dt className="lg-note">Problems solved</dt>
              <dd>{total.toLocaleString('en-CA')}</dd>
            </div>
          </dl>
          <dl className="ae-rows">
            {levels.map(([label, n]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{n} / {Math.round(share(n) * 100)}%</dd>
                <dd className={`ae-meter${label === 'Hard' ? ' ae-meter--accent' : ''}`} aria-hidden="true">
                  <span style={{ '--v': share(n).toFixed(3) } as CSSProperties} />
                </dd>
              </div>
            ))}
            <div>
              <dt>Global rank</dt>
              <dd>{stats.ranking ? `#${stats.ranking.toLocaleString('en-CA')}` : 'N/A'}</dd>
            </div>
            {stats.reputation !== undefined && stats.reputation > 0 && (
              <div>
                <dt>Reputation</dt>
                <dd>{stats.reputation}</dd>
              </div>
            )}
            {stats.starRating !== undefined && stats.starRating > 0 && (
              <div>
                <dt>Star rating</dt>
                <dd>{stats.starRating}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </article>
  );
}
