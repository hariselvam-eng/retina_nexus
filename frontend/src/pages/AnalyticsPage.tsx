import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataState, ErrorState } from '../components/DataState';
import { PageIntro } from '../components/PageIntro';
import {
  getAnalyticsOverview,
  type AnalyticsOverview,
} from '../services/api';
import '../styles/analytics.css';

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  function load() {
    setError('');
    setRefreshing(true);

    getAnalyticsOverview()
      .then(setData)
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load analytics.'
        )
      )
      .finally(() => setRefreshing(false));
  }

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <div className="analytics-page space-y-6">
        <PageIntro
          eyebrow="Operations"
          title="Care intelligence"
          description="Operational metrics from the screening registry."
        />

        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!data) {
    return <DataState label="Loading operational analytics" />;
  }

  const completed = Math.max(1, data.completed_screenings);

  const referableRate =
    data.total_screenings > 0
      ? Math.round((data.referable_cases / data.total_screenings) * 100)
      : 0;

  const reviewRate =
    data.total_screenings > 0
      ? Math.round((data.human_review_cases / data.total_screenings) * 100)
      : 0;

  const ungradableRate =
    data.total_screenings > 0
      ? Math.round((data.ungradable_images / data.total_screenings) * 100)
      : 0;

  return (
    <div className="analytics-page space-y-7">

      {/* HEADER */}
      <div className="analytics-header">
        <PageIntro
          eyebrow="Operations"
          title="Care intelligence"
          description="A real-time operational view of screening throughput, AI signals, review demand, and system readiness."
          action={
            <button
              onClick={load}
              disabled={refreshing}
              className="analytics-refresh"
            >
              <RefreshCw
                size={15}
                className={refreshing ? 'animate-spin' : ''}
              />
              {refreshing ? 'Refreshing' : 'Refresh data'}
            </button>
          }
        />
      </div>

      {/* LIVE STATUS */}
      <div className="analytics-live">
        <span className="live-dot" />
        <span>LIVE REGISTRY</span>
        <span className="live-divider" />
        <span>Operational analytics</span>
      </div>

      {/* METRICS */}
      <div className="analytics-metrics">

        <Metric
          label="Total screenings"
          value={data.total_screenings}
          icon={BarChart3}
          tone="teal"
          index={0}
        />

        <Metric
          label="Today's screenings"
          value={data.today_screenings}
          icon={Activity}
          tone="blue"
          index={1}
        />

        <Metric
          label="Referable cases"
          value={data.referable_cases}
          icon={AlertTriangle}
          tone="rose"
          percentage={referableRate}
          index={2}
        />

        <Metric
          label="Human review"
          value={data.human_review_cases}
          icon={ShieldCheck}
          tone="amber"
          percentage={reviewRate}
          index={3}
        />

        <Metric
          label="Ungradable images"
          value={data.ungradable_images}
          icon={CircleAlert}
          tone="slate"
          percentage={ungradableRate}
          index={4}
        />

      </div>

      {/* MAIN ANALYTICS */}
      <div className="analytics-grid">

        {/* DISTRIBUTION */}
        <section className="analytics-card distribution-card">

          <div className="analytics-card-header">
            <div className="analytics-title-group">
              <div className="analytics-icon teal">
                <BarChart3 size={18} />
              </div>

              <div>
                <p className="analytics-eyebrow">MODEL OUTPUT</p>
                <h2>DR grade distribution</h2>
                <p>
                  Observed predictions across completed screening runs
                </p>
              </div>
            </div>

            <div className="analytics-count">
              {data.completed_screenings.toLocaleString()}
              <span>completed</span>
            </div>
          </div>

          <div className="distribution-list">

            {Object.entries(data.severity_distribution).length === 0 ? (
              <div className="analytics-empty">
                <BarChart3 size={24} />
                <p>No completed model predictions yet.</p>
              </div>
            ) : (
              Object.entries(data.severity_distribution).map(
                ([label, value], index) => (
                  <DistributionBar
                    key={label}
                    label={label}
                    value={value}
                    total={completed}
                    index={index}
                  />
                )
              )
            )}

          </div>
        </section>

        {/* SYSTEM HEALTH */}
        <section className="analytics-card health-card">

          <div className="analytics-card-header">
            <div className="analytics-title-group">
              <div className="analytics-icon green">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="analytics-eyebrow">INFRASTRUCTURE</p>
                <h2>System health</h2>
                <p>Current workspace readiness</p>
              </div>
            </div>
          </div>

          <div className="health-list">

            {Object.entries(data.system_health).map(
              ([label, value], index) => (
                <div
                  className="health-row"
                  key={label}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="health-label">
                    <span className="health-status-dot" />
                    <span>
                      {label.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="health-value">
                    <CheckCircle2 size={14} />
                    {String(value).replaceAll('_', ' ')}
                  </div>
                </div>
              )
            )}

          </div>

          <div className="operational-note">
            <Activity size={15} />
            <span>
              These are operational signals and do not establish
              clinical performance or safety.
            </span>
          </div>

        </section>
      </div>

      {/* INSIGHT STRIP */}
      <section className="insight-panel">

        <div className="insight-icon">
          <TrendingUp size={20} />
        </div>

        <div className="insight-content">
          <p className="analytics-eyebrow">REGISTRY SNAPSHOT</p>
          <h3>Screening workload overview</h3>
          <p>
            {data.total_screenings.toLocaleString()} total screenings
            are registered, with {data.human_review_cases.toLocaleString()}{' '}
            currently associated with human review and{' '}
            {data.referable_cases.toLocaleString()} carrying a
            referable signal.
          </p>
        </div>

        <div className="insight-stat">
          <strong>{referableRate}%</strong>
          <span>referable signal rate</span>
        </div>

      </section>

      {/* RECENT ACTIVITY */}
      <section className="analytics-card activity-card">

        <div className="analytics-card-header">
          <div className="analytics-title-group">
            <div className="analytics-icon blue">
              <Activity size={18} />
            </div>

            <div>
              <p className="analytics-eyebrow">REGISTRY EVENTS</p>
              <h2>Recent activity</h2>
              <p>Latest screening events recorded by the registry</p>
            </div>
          </div>

          <span className="activity-total">
            {data.recent_activity.length} events
          </span>
        </div>

        {data.recent_activity.length === 0 ? (
          <div className="analytics-empty">
            <Activity size={24} />
            <p>No activity yet.</p>
          </div>
        ) : (
          <div className="activity-list">

            {data.recent_activity.map((item, index) => (
              <div
                className="activity-row"
                key={String(item.screening_id)}
                style={{
                  animationDelay: `${index * 60}ms`,
                }}
              >

                <div className="activity-number">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="activity-main">
                  <div className="activity-id">
                    {shortId(String(item.screening_id))}
                  </div>

                  <div className="activity-description">
                    {item.grade ?? 'No grade'}
                    <span>•</span>
                    {item.referable_dr
                      ? 'Referable signal'
                      : 'Non-referable signal'}
                  </div>
                </div>

                <div className="activity-right">

                  {item.referable_dr && (
                    <span className="referable-pill">
                      REFERABLE
                    </span>
                  )}

                  <span className="trust-pill">
                    {item.trust_category ?? item.status}
                  </span>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}


/* ================================
   METRIC
================================ */

function Metric({
  label,
  value,
  icon: Icon,
  tone,
  percentage,
  index,
}: {
  label: string;
  value: number;
  icon: typeof Activity;
  tone: 'teal' | 'blue' | 'rose' | 'amber' | 'slate';
  percentage?: number;
  index: number;
}) {
  const styles = {
    teal: 'teal',
    blue: 'blue',
    rose: 'rose',
    amber: 'amber',
    slate: 'slate',
  };

  return (
    <div
      className="analytics-metric"
      style={{
        animationDelay: `${index * 70}ms`,
      }}
    >

      <div className="metric-top">
        <div className={`metric-icon ${styles[tone]}`}>
          <Icon size={18} />
        </div>

        {percentage !== undefined && (
          <span className={`metric-percentage ${styles[tone]}`}>
            {percentage}%
          </span>
        )}
      </div>

      <div className="metric-label">
        {label}
      </div>

      <div className="metric-value">
        {value.toLocaleString()}
      </div>

      <div className="metric-footer">
        <span />
        Registry count
      </div>

    </div>
  );
}


/* ================================
   DISTRIBUTION BAR
================================ */

function DistributionBar({
  label,
  value,
  total,
  index,
}: {
  label: string;
  value: number;
  total: number;
  index: number;
}) {
  const width = Math.max(4, (value / total) * 100);

  return (
    <div
      className="distribution-row"
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >

      <div className="distribution-info">
        <span>{label}</span>

        <strong>
          {value.toLocaleString()}
        </strong>
      </div>

      <div className="distribution-track">
        <div
          className="distribution-fill"
          style={{
            width: `${width}%`,
            animationDelay: `${index * 120 + 300}ms`,
          }}
        />
      </div>

      <span className="distribution-percent">
        {Math.round((value / total) * 100)}%
      </span>

    </div>
  );
}


function shortId(value: string) {
  return value.length > 12
    ? `…${value.slice(-8)}`
    : value;
}