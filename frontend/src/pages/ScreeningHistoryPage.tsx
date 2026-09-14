import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Eye,
  Filter,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { DataState, EmptyState, ErrorState } from '../components/DataState';
import { PageIntro } from '../components/PageIntro';
import { getScreeningHistory } from '../services/api';
import type { ScreeningHistoryItem } from '../types';

import '../styles/screening-history.css';

type FilterType = 'ALL' | 'TRUSTED' | 'REVIEW' | 'UNRELIABLE' | 'REFERABLE';

export function ScreeningHistoryPage() {
  const [items, setItems] = useState<ScreeningHistoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  function load() {
    setLoading(true);
    setError('');

    getScreeningHistory()
      .then(setItems)
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load screening history.'
        );
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items
      .filter((item) => {
        const searchable = [
          item.screening_id,
          item.patient_id,
          item.image_id,
          item.predicted_grade_label,
          item.eye,
          item.trust_category,
          item.triage_recommendation,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (normalizedQuery && !searchable.includes(normalizedQuery)) {
          return false;
        }

        if (filter === 'TRUSTED') {
          return item.trust_category === 'TRUSTED';
        }

        if (filter === 'REVIEW') {
          return (
            item.trust_category === 'REVIEW' ||
            item.trust_category === 'UNCERTAIN' ||
            item.triage_recommendation === 'HUMAN_REVIEW_REQUIRED'
          );
        }

        if (filter === 'UNRELIABLE') {
          return item.trust_category === 'UNRELIABLE';
        }

        if (filter === 'REFERABLE') {
          return item.referable_dr;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
      );
  }, [items, query, filter]);

  const stats = useMemo(
    () => ({
      total: items.length,
      trusted: items.filter((item) => item.trust_category === 'TRUSTED').length,
      review: items.filter(
        (item) =>
          item.trust_category === 'REVIEW' ||
          item.trust_category === 'UNCERTAIN' ||
          item.triage_recommendation === 'HUMAN_REVIEW_REQUIRED'
      ).length,
      referable: items.filter((item) => item.referable_dr).length,
    }),
    [items]
  );

  const activeFilterCount = filter !== 'ALL' ? 1 : 0;

  return (
    <div className="history-page">
      <div className="history-orb history-orb-one" />
      <div className="history-orb history-orb-two" />

      <PageIntro
        eyebrow="Clinical records"
        title="Screening history"
        description="A unified view of retinal screening runs, AI trust decisions, and recommended clinical actions."
        action={
          <Link to="/screening/new" className="history-primary-button">
            <Sparkles size={16} />
            New screening
            <ArrowRight size={15} />
          </Link>
        }
      />

      <section className="history-stat-grid">
        <StatCard
          label="Total screenings"
          value={stats.total}
          detail="All recorded runs"
          icon={ClipboardList}
          className="history-stat-teal"
        />

        <StatCard
          label="Trusted outputs"
          value={stats.trusted}
          detail="AI confidence accepted"
          icon={CheckCircle2}
          className="history-stat-green"
        />

        <StatCard
          label="Needs review"
          value={stats.review}
          detail="Human verification"
          icon={ShieldAlert}
          className="history-stat-amber"
        />

        <StatCard
          label="Referable signals"
          value={stats.referable}
          detail="Clinical attention"
          icon={Activity}
          className="history-stat-rose"
        />
      </section>

      <section className="history-toolbar">
        <div className="history-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search patient, screening, image or AI grade..."
            aria-label="Search screening history"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="history-clear"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="history-filter-desktop">
          <Filter size={15} />

          <FilterButton
            active={filter === 'ALL'}
            onClick={() => setFilter('ALL')}
          >
            All
          </FilterButton>

          <FilterButton
            active={filter === 'TRUSTED'}
            onClick={() => setFilter('TRUSTED')}
          >
            Trusted
          </FilterButton>

          <FilterButton
            active={filter === 'REVIEW'}
            onClick={() => setFilter('REVIEW')}
          >
            Review
          </FilterButton>

          <FilterButton
            active={filter === 'REFERABLE'}
            onClick={() => setFilter('REFERABLE')}
          >
            Referable
          </FilterButton>
        </div>

        <button
          type="button"
          className="history-mobile-filter"
          onClick={() => setFiltersOpen((value) => !value)}
        >
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="history-filter-count">{activeFilterCount}</span>
          )}
          <ChevronDown
            size={15}
            className={filtersOpen ? 'rotate-180' : ''}
          />
        </button>
      </section>

      {filtersOpen && (
        <div className="history-mobile-filter-panel">
          {(
            ['ALL', 'TRUSTED', 'REVIEW', 'UNRELIABLE', 'REFERABLE'] as FilterType[]
          ).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => {
                setFilter(item);
                setFiltersOpen(false);
              }}
              className={filter === item ? 'active' : ''}
            >
              {filterLabel(item)}
            </button>
          ))}
        </div>
      )}

      <div className="history-results-bar">
        <div>
          <span className="history-results-title">
            {filtered.length === 1 ? '1 screening' : `${filtered.length} screenings`}
          </span>
          <span className="history-results-subtitle">
            {query || filter !== 'ALL'
              ? 'matching current filters'
              : 'newest activity first'}
          </span>
        </div>

        <div className="history-live-indicator">
          <span />
          Live registry
        </div>
      </div>

      {loading ? (
        <HistorySkeleton />
      ) : error ? (
        <div className="history-error">
          <ErrorState message={error} onRetry={load} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="history-empty">
          <EmptyState
            title={query || filter !== 'ALL' ? 'No matching screenings' : 'No screenings yet'}
            detail={
              query || filter !== 'ALL'
                ? 'Try a different search term or remove one of the filters.'
                : 'Start a new screening to create the first care record.'
            }
            action={
              !query &&
              filter === 'ALL' && (
                <Link to="/screening/new" className="history-primary-button">
                  Start screening
                  <ArrowRight size={15} />
                </Link>
              )
            }
          />
        </div>
      ) : (
        <section className="history-list">
          {filtered.map((item, index) => (
            <HistoryCard key={item.screening_id} item={item} index={index} />
          ))}
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Activity;
  className: string;
}) {
  return (
    <div className={`history-stat-card ${className}`}>
      <div className="history-stat-top">
        <div className="history-stat-icon">
          <Icon size={19} />
        </div>

        <div className="history-stat-pulse">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="history-stat-value">{value}</div>
      <div className="history-stat-label">{label}</div>
      <div className="history-stat-detail">{detail}</div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`history-filter-button ${active ? 'active' : ''}`}
    >
      {children}
    </button>
  );
}

function HistoryCard({
  item,
  index,
}: {
  item: ScreeningHistoryItem;
  index: number;
}) {
  const trustTone =
    item.trust_category === 'TRUSTED'
      ? 'trusted'
      : item.trust_category === 'UNRELIABLE'
        ? 'unreliable'
        : item.trust_category
          ? 'review'
          : 'neutral';

  const actionTone =
    item.referable_dr ||
    item.triage_recommendation === 'HUMAN_REVIEW_REQUIRED' ||
    item.triage_recommendation === 'SPECIALIST_REVIEW_RECOMMENDED'
      ? 'attention'
      : 'safe';

  return (
    <article
      className="history-card"
      style={{ animationDelay: `${Math.min(index * 55, 500)}ms` }}
    >
      <div className="history-card-glow" />

      <div className="history-card-main">
        <div className="history-card-icon">
          <Eye size={21} />
        </div>

        <div className="history-card-identity">
          <div className="history-card-id-row">
            <Link
              to="/screening/results"
              state={{
                screeningId: item.screening_id,
                imageId: item.image_id,
              }}
              className="history-screening-id"
            >
              {shortId(item.screening_id)}
            </Link>

            {item.referable_dr && (
              <span className="history-referable-pill">
                <Activity size={11} />
                Referable signal
              </span>
            )}
          </div>

          <div className="history-meta-row">
            <span>
              Patient <strong>{shortId(item.patient_id)}</strong>
            </span>

            <span className="history-meta-dot" />

            <span className="history-eye">
              {item.eye.toUpperCase()} EYE
            </span>

            <span className="history-meta-dot" />

            <span>
              <Clock3 size={12} />
              {formatDate(item.created_at)}
            </span>
          </div>
        </div>

        <div className={`history-trust ${trustTone}`}>
          <div className="history-trust-dot" />
          <div>
            <span className="history-trust-label">AI trust</span>
            <strong>
              {item.trust_category
                ? `${item.trust_category} · ${Math.round(
                    (item.trust_score ?? 0) * 100
                  )}%`
                : 'Unavailable'}
            </strong>
          </div>
        </div>
      </div>

      <div className="history-card-divider" />

      <div className="history-card-bottom">
        <div className="history-grade">
          <span className="history-section-label">AI assessment</span>
          <strong>{item.predicted_grade_label ?? 'No output'}</strong>
        </div>

        <div className={`history-action ${actionTone}`}>
          <span className="history-section-label">Recommended action</span>
          <strong>{actionLabel(item.triage_recommendation)}</strong>
        </div>

        <Link
          to="/screening/results"
          state={{
            screeningId: item.screening_id,
            imageId: item.image_id,
          }}
          className="history-open-button"
        >
          View result
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

function HistorySkeleton() {
  return (
    <div className="history-list">
      {[1, 2, 3, 4].map((item) => (
        <div className="history-skeleton" key={item}>
          <div className="skeleton-circle" />
          <div className="skeleton-content">
            <div className="skeleton-line skeleton-line-wide" />
            <div className="skeleton-line skeleton-line-small" />
          </div>
          <div className="skeleton-badge" />
        </div>
      ))}
    </div>
  );
}

function shortId(value?: string | null) {
  if (!value) return 'Unavailable';
  return value.length > 16 ? `…${value.slice(-10)}` : value;
}

function formatDate(value?: string | null) {
  if (!value) return 'Date unavailable';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function filterLabel(value: FilterType) {
  return {
    ALL: 'All screenings',
    TRUSTED: 'Trusted',
    REVIEW: 'Needs review',
    UNRELIABLE: 'Unreliable',
    REFERABLE: 'Referable',
  }[value];
}

function actionLabel(value?: string | null) {
  return (
    {
      AI_TRIAGE_MAY_PROCEED: 'AI triage may proceed',
      SPECIALIST_REVIEW_RECOMMENDED: 'Specialist review',
      HUMAN_REVIEW_REQUIRED: 'Human review required',
      RECAPTURE_OR_SPECIALIST_REVIEW: 'Recapture / specialist review',
      RECAPTURE_IMAGE: 'Recapture image',
    } as Record<string, string>
  )[value ?? ''] ?? 'Pending';
}