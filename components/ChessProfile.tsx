'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { KingMark } from './Navbar';

interface GameTypeStats {
  last: { rating: number; date: number; rd: number };
  best?: { rating: number; date: number; game: string };
  record: { win: number; loss: number; draw: number };
}

interface ChessStats {
  username: string;
  rapid?: GameTypeStats;
  blitz?: GameTypeStats;
  bullet?: GameTypeStats;
}

const USER = 'nk010';
const MODES = ['Rapid', 'Blitz', 'Bullet'] as const;
type Mode = (typeof MODES)[number];

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

export default function ChessProfile() {
  const [stats, setStats] = useState<ChessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('Bullet');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [player, record] = await Promise.all([
        fetch(`https://api.chess.com/pub/player/${USER}`),
        fetch(`https://api.chess.com/pub/player/${USER}/stats`),
      ]);
      if (!player.ok || !record.ok) throw new Error('Failed to fetch chess.com data');
      const playerData = await player.json();
      const statsData = await record.json();
      setStats({
        username: playerData.username,
        rapid: statsData.chess_rapid,
        blitz: statsData.chess_blitz,
        bullet: statsData.chess_bullet,
      });
    } catch (err) {
      console.error('Error fetching chess data:', err);
      setError('Could not load the Chess.com profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const of = (m: Mode) => stats?.[m.toLowerCase() as 'rapid' | 'blitz' | 'bullet'];
  const available = MODES.filter((m) => of(m));
  const current: Mode | undefined = of(mode) ? mode : available[0];
  const s = current ? of(current) : undefined;
  const total = s ? s.record.win + s.record.loss + s.record.draw : 0;

  return (
    <article className="lg-panel ae-live ae-live--chess" aria-labelledby="ae-chess-title">
      <header className="ae-live__head">
        <h3 id="ae-chess-title" className="lg-display lg-display--md">Chess</h3>
        <a className="lg-link" href={`https://www.chess.com/member/${stats?.username ?? USER}`} target="_blank" rel="noopener noreferrer">
          <KingMark className="ae-live__mark" />
          {stats?.username ?? USER} on Chess.com
        </a>
      </header>

      {loading && (
        <p className="ae-live__state" role="status" aria-busy="true">Fetching the live rating from Chess.com.</p>
      )}

      {!loading && (error || !s) && (
        <div className="ae-live__state" role="alert">
          <p>{error ?? 'No rated games on record yet.'}</p>
          {error && (
            <button type="button" className="ae-btn" onClick={load}>Try again</button>
          )}
        </div>
      )}

      {!loading && !error && s && current && (
        <div className="ae-live__body">
          <div className="ae-live__lead">
          <div className="ae-seg" role="group" aria-label="Time control">
            {available.map((m) => (
              <button key={m} type="button" aria-pressed={m === current} onClick={() => setMode(m)}>
                {m}
              </button>
            ))}
          </div>

          <dl className="ae-figs" aria-live="polite">
            <div className="ae-figs__main">
              <dt className="lg-note">{current} rating</dt>
              <dd>{s.last.rating}</dd>
            </div>
            {s.best && (
              <div>
                <dt className="lg-note">Peak</dt>
                <dd>{s.best.rating}</dd>
              </div>
            )}
            <div>
              <dt className="lg-note">Games</dt>
              <dd>{total.toLocaleString('en-CA')}</dd>
            </div>
          </dl>
          </div>

          <div className="ae-record">
            <div className="ae-record__bar" aria-hidden="true">
              <span className="is-win" style={{ flexGrow: s.record.win }} />
              <span className="is-draw" style={{ flexGrow: s.record.draw }} />
              <span className="is-loss" style={{ flexGrow: s.record.loss }} />
            </div>
            <dl className="ae-record__key">
              <div>
                <dt className="lg-note" style={{ '--k': 'var(--sc-accent)' } as CSSProperties}>Won</dt>
                <dd>{s.record.win.toLocaleString('en-CA')}<small>{pct(s.record.win, total)}%</small></dd>
              </div>
              <div>
                <dt className="lg-note" style={{ '--k': 'var(--sc-ink-soft)' } as CSSProperties}>Drawn</dt>
                <dd>{s.record.draw.toLocaleString('en-CA')}<small>{pct(s.record.draw, total)}%</small></dd>
              </div>
              <div>
                <dt className="lg-note">Lost</dt>
                <dd>{s.record.loss.toLocaleString('en-CA')}<small>{pct(s.record.loss, total)}%</small></dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </article>
  );
}
