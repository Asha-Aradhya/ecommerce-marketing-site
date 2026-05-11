import { useMemo, useState } from 'react';

interface ChangelogEntryDto {
  id: string;
  title: string;
  excerpt: string;
  category: 'Release' | 'Update';
  topic: string;
  sourceUrl: string;
  publishedAt: string;
}

interface Props {
  entries: ChangelogEntryDto[];
  topics: readonly string[];
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function ChangelogFilter({ entries, topics }: Props) {
  const [searchInput, setSearchInput] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<string>('All');
  const [activeYear, setActiveYear] = useState<number | null>(null);

  const years = useMemo(() => {
    const yearSet = new Set(
      entries.map((entry) => new Date(entry.publishedAt).getFullYear()),
    );
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [entries]);

  const indexedEntries = useMemo(
    () =>
      entries.map((entry) => {
        const publishedDate = new Date(entry.publishedAt);
        const haystack = [
          entry.title,
          entry.excerpt,
          entry.topic,
          entry.category,
          publishedDate.getFullYear().toString(),
          dateFormatter.format(publishedDate),
        ]
          .join(' ')
          .toLowerCase();
        return { entry, year: publishedDate.getFullYear(), haystack };
      }),
    [entries],
  );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = committedQuery.trim().toLowerCase();
    return indexedEntries
      .filter(({ entry, year, haystack }) => {
        if (activeTopic !== 'All' && entry.topic !== activeTopic) return false;
        if (activeYear !== null && year !== activeYear) return false;
        if (normalizedQuery && !haystack.includes(normalizedQuery)) return false;
        return true;
      })
      .map(({ entry }) => entry);
  }, [indexedEntries, activeTopic, activeYear, committedQuery]);

  const yearMatchCounts = useMemo(() => {
    const normalizedQuery = committedQuery.trim().toLowerCase();
    const counts = new Map<number, number>();
    for (const { entry, year, haystack } of indexedEntries) {
      if (activeTopic !== 'All' && entry.topic !== activeTopic) continue;
      if (normalizedQuery && !haystack.includes(normalizedQuery)) continue;
      counts.set(year, (counts.get(year) ?? 0) + 1);
    }
    return counts;
  }, [indexedEntries, activeTopic, committedQuery]);

  const tabs = ['All', ...topics] as const;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-12">
        <aside>
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              setCommittedQuery(searchInput);
            }}
            className="relative mb-2"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search documentation"
              aria-label="Search documentation"
              className="w-full rounded-full border border-transparent bg-blue-pale px-5 py-3 pr-12 text-sm text-navy-dark placeholder:text-navy-dark/70 focus:outline-none focus:border-orange focus:bg-white"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-navy-dark hover:text-orange transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </form>

          <ul className="space-y-1.5">
            {years.map((year) => {
              const isActive = activeYear === year;
              const matchCount = yearMatchCounts.get(year) ?? 0;
              const hasMatches = matchCount > 0;
              return (
                <li key={year}>
                  <button
                    type="button"
                    disabled={!hasMatches && !isActive}
                    onClick={() => setActiveYear(isActive ? null : year)}
                    className={`w-full text-left rounded-md px-5 py-4 text-base font-bold transition-colors ${
                      isActive
                        ? 'bg-blue-pale text-orange'
                        : hasMatches
                          ? 'bg-blue-pale/60 text-navy-dark hover:bg-blue-pale'
                          : 'bg-blue-pale/20 text-navy-dark/40 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>{year}</span>
                      <span
                        className={`text-xs font-semibold ${
                          isActive
                            ? 'text-orange'
                            : hasMatches
                              ? 'text-navy-dark/60'
                              : 'text-navy-dark/30'
                        }`}
                      >
                        {matchCount}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div>
          <div className="mb-8 -mx-4 px-4 overflow-x-auto">
            <ul className="flex gap-1.5 min-w-max items-end">
              {tabs.map((tab) => {
                const isActive = activeTopic === tab;
                return (
                  <li key={tab}>
                    <button
                      type="button"
                      onClick={() => setActiveTopic(tab)}
                      className={`whitespace-nowrap px-6 md:px-8 rounded-t-2xl font-bold text-sm md:text-base text-navy-dark transition-all ${
                        isActive
                          ? 'bg-blue-pale py-5 md:py-6 shadow-[inset_0_-3px_0_0_var(--color-orange)]'
                          : 'bg-blue-pale/80 hover:bg-blue-pale py-4 md:py-5'
                      }`}
                    >
                      {tab}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="py-8">
              <h2 className="text-3xl md:text-5xl font-bold text-navy-dark mb-4">
                No results
              </h2>
              <p className="text-navy-dark text-base md:text-lg">
                We are unable to find any posts within this archive.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredEntries.map((entry) => {
                const publishedDate = new Date(entry.publishedAt);
                return (
                  <li key={entry.id} className="py-8 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-3 text-xs">
                      <span
                        className={`inline-block rounded-full px-3 py-1 font-semibold uppercase tracking-wide ${
                          entry.category === 'Release'
                            ? 'bg-blue-pale text-navy-dark'
                            : 'bg-orange-light text-navy-dark'
                        }`}
                      >
                        {entry.category}
                      </span>
                      <time
                        dateTime={publishedDate.toISOString()}
                        className="text-gray-500"
                      >
                        {dateFormatter.format(publishedDate)}
                      </time>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-navy-dark mb-3 leading-tight">
                      {entry.title}
                    </h2>
                    <p className="text-base text-navy-dark leading-relaxed mb-4">
                      {entry.excerpt}
                    </p>
                    <a
                      href={entry.sourceUrl}
                      className="inline-flex items-center text-sm font-semibold text-orange hover:text-orange-dark transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read more →
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
