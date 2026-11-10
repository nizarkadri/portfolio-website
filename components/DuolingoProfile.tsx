'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';

interface DuolingoStats {
  username: string;
  name?: string;
  streak: number;
  totalXp: number;
  languages: Array<{ language: string; level: number; xp: number; progress?: number }>;
}

const USER = 'nizarkadri';

export default function DuolingoProfile() {
  const [stats, setStats] = useState<DuolingoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/duolingo?username=${USER}`);
      if (!response.ok) throw new Error('Failed to fetch Duolingo data');
      setStats(await response.json());
    } catch (err) {
      console.error('Error fetching Duolingo data:', err);
      setError('Could not load the Duolingo profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const languages = stats?.languages ? [...stats.languages].sort((a, b) => b.xp - a.xp) : [];

  return (
    <article className="lg-panel ae-live" aria-labelledby="ae-duolingo-title">
      <header className="ae-live__head">
        <h3 id="ae-duolingo-title" className="lg-display lg-display--sm">Duolingo</h3>
        <a className="lg-link" href={`https://www.duolingo.com/profile/${stats?.username ?? USER}`} target="_blank" rel="noopener noreferrer">
          Profile
        </a>
      </header>

      {loading && <p className="ae-live__state" role="status" aria-busy="true">Fetching the current streak.</p>}

      {!loading && (error || !stats) && (
        <div className="ae-live__state" role="alert">
          <p>{error ?? 'Could not load the Duolingo profile.'}</p>
          <button type="button" className="ae-btn" onClick={load}>Try again</button>
        </div>
      )}

      {!loading && !error && stats && (
        <div className="ae-live__body">
          <dl className="ae-figs ae-figs--sm">
            <div className="ae-figs__main">
              <dt className="lg-note">Day streak</dt>
              <dd>{(stats.streak ?? 0).toLocaleString('en-CA')}</dd>
            </div>
            <div>
              <dt className="lg-note">Total XP</dt>
              <dd>{(stats.totalXp ?? 0).toLocaleString('en-CA')}</dd>
            </div>
          </dl>
          {languages.length > 0 && (
            <dl className="ae-rows">
              {languages.map((lang, i) => (
                <div key={lang.language}>
                  <dt>{lang.language}<small>Level {lang.level}</small></dt>
                  <dd>{lang.xp.toLocaleString('en-CA')} XP</dd>
                  <dd className={`ae-meter${i === 0 ? ' ae-meter--accent' : ''}`} aria-hidden="true">
                    <span style={{ '--v': (Math.min(100, Math.max(0, lang.progress ?? 0)) / 100).toFixed(3) } as CSSProperties} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </article>
  );
}
