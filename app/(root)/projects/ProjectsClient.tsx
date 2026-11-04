'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ProjectSummary } from '../../lib/project-shared';
import ProjectCard from '../../../components/ProjectCard';

interface ProjectsClientProps {
  projects: ProjectSummary[];
}

type SortKey = 'featured' | 'year-desc' | 'year-asc' | 'title';
type ViewKey = 'grid' | 'bento';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured first' },
  { value: 'year-desc', label: 'Newest year' },
  { value: 'year-asc', label: 'Oldest year' },
  { value: 'title', label: 'Title A–Z' },
];

const yearOf = (p: ProjectSummary) => parseInt(p.year || '', 10) || 0;

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [query, setQuery] = useState('');
  const [tech, setTech] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('featured');
  const [view, setView] = useState<ViewKey>('grid');

  const allTechs = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => p.technologies.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = projects.filter((p) => {
      if (tech && !p.technologies.includes(tech)) return false;
      if (!q) return true;
      const haystack = [p.title, p.description, p.summary, ...p.technologies, p.status || '', p.impact || ''].join(' ').toLowerCase();
      return q.split(/\s+/).every((w) => haystack.includes(w));
    });
    const sorted = [...list];
    switch (sort) {
      case 'year-desc':
        sorted.sort((a, b) => yearOf(b) - yearOf(a) || a.title.localeCompare(b.title));
        break;
      case 'year-asc':
        sorted.sort((a, b) => yearOf(a) - yearOf(b) || a.title.localeCompare(b.title));
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        sorted.sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            a.order - b.order ||
            yearOf(b) - yearOf(a) ||
            a.title.localeCompare(b.title),
        );
    }
    return sorted;
  }, [projects, query, tech, sort]);

  const featured = filtered.filter((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);
  const hasFilters = Boolean(query.trim() || tech);
  const clearFilters = () => { setQuery(''); setTech(null); };

  return (
    <div className="min-h-screen py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-[#B8E62D]/20 bg-[#B8E62D]/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#D9FF4B]">
            Project archive
          </p>
          <h1 className="huge-text font-bold leading-none text-[#B8E62D]/80 opacity-90">PROJECTS</h1>
          <p className="mt-4 max-w-2xl leading-7 text-soft-white/70">
            Search and filter shipped work. Featured projects are highlighted first; open any card for the full case study.
          </p>
        </div>

        {/* Toolbar */}
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:flex-row md:flex-wrap md:items-center"
        >
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 focus-within:border-[#B8E62D]/50">
            <span className="sr-only">Search projects by title, description, or technology</span>
            <svg className="h-4 w-4 shrink-0 text-soft-white/40" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, tech, or keywords…"
              className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-soft-white/40 focus:outline-none"
            />
            {query ? (
              <button type="button" onClick={() => setQuery('')} className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-xs text-soft-white/70 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]" aria-label="Clear search">
                ✕
              </button>
            ) : null}
          </label>

          <label className="flex items-center gap-2 text-sm text-soft-white/70">
            <span>Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>)}
            </select>
          </label>

          <div role="group" aria-label="Layout view" className="flex overflow-hidden rounded-xl border border-white/10">
            {(['grid', 'bento'] as ViewKey[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`px-4 py-2.5 text-sm capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8E62D] ${view === v ? 'bg-[#B8E62D]/15 text-[#D9FF4B]' : 'bg-black/30 text-soft-white/60 hover:bg-white/5'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </form>

        {/* Tech filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by technology">
          <button
            type="button"
            aria-pressed={!tech}
            onClick={() => setTech(null)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D] ${!tech ? 'border-[#B8E62D]/60 bg-[#B8E62D]/15 text-[#D9FF4B]' : 'border-white/10 text-soft-white/65 hover:border-white/25'}`}
          >
            All ({projects.length})
          </button>
          {allTechs.map(([t, n]) => (
            <button
              key={t}
              type="button"
              aria-pressed={tech === t}
              onClick={() => setTech(tech === t ? null : t)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D] ${tech === t ? 'border-[#B8E62D]/60 bg-[#B8E62D]/15 text-[#D9FF4B]' : 'border-white/10 text-soft-white/65 hover:border-white/25'}`}
            >
              {t} ({n})
            </button>
          ))}
        </div>

        <p className="mb-8 text-sm text-soft-white/50" role="status" aria-live="polite">
          {filtered.length} of {projects.length} projects
          {hasFilters ? (
            <>
              {' '}· <button type="button" onClick={clearFilters} className="text-[#D9FF4B] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D] rounded">Clear filters</button>
            </>
          ) : null}
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
            <p className="text-lg font-medium text-white">No projects match your filters</p>
            <p className="mt-2 text-sm text-soft-white/60">Try a different search term or clear the technology filter.</p>
            <button type="button" onClick={clearFilters} className="mt-6 rounded-full border border-[#B8E62D]/50 bg-[#B8E62D]/10 px-5 py-2.5 text-sm font-medium text-[#D9FF4B] hover:bg-[#B8E62D]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D]">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured highlight */}
            {featured.length > 0 ? (
              <section aria-label="Featured projects" className="mb-10">
                <h2 className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#D9FF4B]">
                  Featured
                  <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-[#B8E62D]/40 to-transparent" />
                </h2>
                <div className={view === 'bento' ? 'grid gap-6 md:grid-cols-2' : 'space-y-6'}>
                  {featured.map((p, i) => (
                    <ProjectCard key={p.slug} {...p} index={i} priority={i === 0} variant={view === 'bento' ? 'grid' : 'showcase'} featured />
                  ))}
                </div>
              </section>
            ) : null}

            {rest.length > 0 ? (
              <section aria-label="All projects" className={view === 'bento' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-6 md:grid-cols-2'}>
                {rest.map((p, i) => (
                  <ProjectCard key={p.slug} {...p} index={i} variant={view === 'bento' ? 'compact' : 'grid'} />
                ))}
              </section>
            ) : null}
          </>
        )}

        <p className="mt-12 text-center text-sm text-soft-white/40">
          Back to <Link href="/" className="text-[#D9FF4B] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E62D] rounded">home</Link>
        </p>
      </div>
    </div>
  );
}
