import {
  Activity,
  ArrowRight,
  CircleAlert,
  Clock3,
  Plus,
  ScanEye,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  DataState,
  EmptyState,
  ErrorState,
} from '../components/DataState';

import { MetricCard } from '../components/MetricCard';
import { PageIntro } from '../components/PageIntro';
import { StatusBadge } from '../components/StatusBadge';

import {
  getAnalyticsOverview,
  getScreeningHistory,
  type AnalyticsOverview,
} from '../services/api';

import type { ScreeningHistoryItem } from '../types';


export function DashboardPage() {
  const [analytics, setAnalytics] =
    useState<AnalyticsOverview | null>(null);

  const [history, setHistory] =
    useState<ScreeningHistoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  /* ============================================================
     LOAD REAL BACKEND DATA
     ============================================================ */

  function load() {
    setLoading(true);
    setError('');

    Promise.all([
      getAnalyticsOverview(),
      getScreeningHistory(),
    ])
      .then(([nextAnalytics, nextHistory]) => {
        setAnalytics(nextAnalytics);
        setHistory(nextHistory);
      })
      .catch((requestError) => {
        console.error(
          'Dashboard API error:',
          requestError
        );

        setAnalytics(null);
        setHistory([]);

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load the live workspace.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }


  /* ============================================================
     INITIAL LOAD
     ============================================================ */

  useEffect(() => {
    load();
  }, []);


  /* ============================================================
     LOADING STATE
     ============================================================ */

  if (loading) {
    return (
      <DataState
        label="Loading care workspace"
      />
    );
  }


  /* ============================================================
     ERROR STATE
     ============================================================ */

  if (!analytics) {
    return (
      <div className="space-y-6">

        <PageIntro
          eyebrow="Care workspace"
          title="Dashboard"
          description="A live view of screening operations, review demand, and system readiness."
        />

        <ErrorState
          message={
            error ||
            'Unable to load the live workspace.'
          }
          onRetry={load}
        />

      </div>
    );
  }


  /* ============================================================
     SYSTEM HEALTH
     ============================================================ */

  const systemHealthy =
    analytics.system_health.api === 'operational' &&
    analytics.system_health.database === 'connected' &&
    analytics.system_health.audit_logging === 'ready';


  /* ============================================================
     DASHBOARD
     ============================================================ */

  return (
    <div className="dashboard-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageIntro
        eyebrow="Care workspace"
        title="Dashboard"
        description="A calm operational view of screening throughput, review demand, and system readiness."
        action={
          <div className="dashboard-header-actions">

            <div className="dashboard-mode">
              <span className="dashboard-mode-dot" />
              Live system
            </div>

            <Link
              to="/screening/new"
              className="btn-primary"
            >
              <Plus size={16} />
              New screening
            </Link>

          </div>
        }
      />


      {/* =====================================================
          METRICS
      ===================================================== */}

      <div className="dashboard-metrics">

        <MetricCard
          label="Total screenings"
          value={String(
            analytics.total_screenings
          )}
          detail="all time"
          icon={ScanEye}
        />

        <MetricCard
          label="Today's screenings"
          value={String(
            analytics.today_screenings
          )}
          detail="local registry"
          icon={Clock3}
          iconClass="metric-icon-blue"
        />

        <MetricCard
          label="Referable cases"
          value={String(
            analytics.referable_cases
          )}
          detail="AI signal"
          icon={CircleAlert}
          iconClass="metric-icon-red"
        />

        <MetricCard
          label="Human review"
          value={String(
            analytics.human_review_cases
          )}
          detail="needs attention"
          icon={ShieldCheck}
          iconClass="metric-icon-amber"
        />

        <MetricCard
          label="Ungradable images"
          value={String(
            analytics.ungradable_images
          )}
          detail="recapture advised"
          icon={Activity}
          iconClass="metric-icon-neutral"
        />

      </div>


      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <div className="dashboard-main-grid">


        {/* =================================================
            ACTIVITY PANEL
        ================================================= */}

        <section className="dashboard-panel activity-panel">

          {/* Header */}

          <div className="dashboard-panel-header">

            <div>

              <div className="dashboard-section-label">
                <span className="section-live-dot" />
                Screening intelligence
              </div>

              <h2>
                Recent activity
              </h2>

              <p>
                Latest screening runs across the workspace.
              </p>

            </div>


            <Link
              to="/history"
              className="dashboard-view-link"
            >
              View history
              <ArrowRight size={14} />
            </Link>

          </div>


          {/* =================================================
              ANIMATED VISUALIZATION
          ================================================= */}

          <div className="activity-visual">

            <div className="activity-grid" />

            <div className="activity-orb activity-orb-one" />

            <div className="activity-orb activity-orb-two" />


            <svg
              className="activity-wave"
              viewBox="0 0 800 180"
              preserveAspectRatio="none"
            >

              <path
                d="
                  M0 112
                  C45 112 45 108 80 108
                  C115 108 120 72 155 72
                  C190 72 190 128 230 128
                  C270 128 275 95 310 95
                  C345 95 350 45 390 45
                  C430 45 425 118 465 118
                  C505 118 510 80 545 80
                  C580 80 585 132 625 132
                  C665 132 675 62 710 62
                  C745 62 750 105 800 105
                "
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />


              <path
                className="activity-wave-secondary"
                d="
                  M0 125
                  C80 125 100 120 150 120
                  C205 120 225 138 280 138
                  C335 138 350 110 405 110
                  C460 110 475 140 530 140
                  C585 140 610 115 665 115
                  C720 115 735 128 800 128
                "
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />

            </svg>


            {/* Center */}

            <div className="activity-center">

              <div className="activity-center-ring">
                <ScanEye size={22} />
              </div>

              <span>
                AI ANALYSIS
              </span>

              <strong>
                ACTIVE
              </strong>

            </div>


            {/* Today's screening */}

            <div className="activity-stat activity-stat-left">

              <span>
                SCREENINGS
              </span>

              <strong>
                {analytics.today_screenings}
              </strong>

              <small>
                today
              </small>

            </div>


            {/* Referable */}

            <div className="activity-stat activity-stat-right">

              <span>
                AI SIGNAL
              </span>

              <strong>
                {analytics.referable_cases}
              </strong>

              <small>
                referable
              </small>

            </div>

          </div>


          {/* =================================================
              RECENT SCREENING LIST
          ================================================= */}

          <div className="activity-list">

            {history.length === 0 ? (

              <EmptyState
                title="No screening activity yet"
                detail="Start a new screening to populate the workspace."
                action={
                  <Link
                    to="/screening/new"
                    className="btn-primary"
                  >
                    Start screening
                  </Link>
                }
              />

            ) : (

              history
                .slice(0, 6)
                .map((item, index) => (
                  <ActivityRow
                    item={item}
                    key={item.screening_id}
                    index={index}
                  />
                ))

            )}

          </div>

        </section>


        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <aside className="dashboard-side">


          {/* =================================================
              SYSTEM HEALTH
          ================================================= */}

          <div className="dashboard-panel health-panel">

            <div className="health-header">

              <div className="health-title">

                <div className="health-icon">
                  <ShieldCheck size={17} />
                </div>

                <div>

                  <span>
                    SYSTEM STATUS
                  </span>

                  <h3>
                    Clinical infrastructure
                  </h3>

                </div>

              </div>


              <StatusBadge
                tone={
                  systemHealthy
                    ? 'success'
                    : 'warning'
                }
                dot
              >
                {systemHealthy
                  ? 'Operational'
                  : 'Attention required'}
              </StatusBadge>

            </div>


            {/* Health rows */}

            <div className="health-list">

              {Object.entries(
                analytics.system_health
              ).map(([key, value], index) => (

                <div
                  className="health-row"
                  key={key}
                  style={{
                    animationDelay:
                      `${index * 100}ms`,
                  }}
                >

                  <div className="health-row-label">

                    <span className="health-check">
                      ✓
                    </span>

                    <span>
                      {key.replaceAll('_', ' ')}
                    </span>

                  </div>


                  <span className="health-value">
                    {String(value).replaceAll(
                      '_',
                      ' '
                    )}
                  </span>

                </div>

              ))}

            </div>


            {/* Footer */}

            <div className="health-footer">

              <span className="health-pulse" />

              {systemHealthy
                ? 'All monitored services responding'
                : 'One or more services require attention'}

            </div>

          </div>


          {/* =================================================
              MODEL INTELLIGENCE
          ================================================= */}

          <div className="dashboard-panel model-panel">

            <div className="model-top">

              <div className="model-icon">
                <Activity size={17} />
              </div>

              <span>
                MODEL PIPELINE
              </span>

            </div>


            <div className="model-status">

              <span className="model-status-dot" />

              <span>

                {analytics.system_health.model_pipeline ===
                'configured'
                  ? 'Registered artifact'
                  : 'Not configured'}

              </span>

            </div>


            <p>
              Only registered model artifacts may create
              a clinical AI output.
            </p>


            <Link
              to="/monitoring"
              className="model-link"
            >
              Open monitoring
              <ArrowRight size={14} />
            </Link>

          </div>


          {/* =================================================
              CARE INTELLIGENCE
          ================================================= */}

          <div className="dashboard-panel intelligence-panel">

            <div className="intelligence-decoration" />


            <div className="intelligence-content">

              <div className="intelligence-icon">
                <Users size={17} />
              </div>


              <div>

                <span>
                  CARE INTELLIGENCE
                </span>

                <h3>
                  Human + AI review
                </h3>

              </div>


              <p>

                {analytics.human_review_cases}

                {' '}

                {analytics.human_review_cases === 1
                  ? 'case is'
                  : 'cases are'}

                {' '}
                currently flagged for human review.

              </p>


              <Link
                to="/review"
                className="intelligence-link"
              >
                Review cases
                <ArrowRight size={14} />
              </Link>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}


/* ============================================================
   ACTIVITY ROW
   ============================================================ */

function ActivityRow({
  item,
  index,
}: {
  item: ScreeningHistoryItem;
  index: number;
}) {

  const tone =
    item.status === 'FAILED'
      ? 'danger'
      : item.trust_category === 'TRUSTED'
        ? 'success'
        : item.trust_category
          ? 'warning'
          : 'neutral';


  return (
    <Link
      to="/screening/results"
      state={{
        screeningId: item.screening_id,
        imageId: item.image_id,
      }}
      className="activity-row"
      style={{
        animationDelay:
          `${index * 80}ms`,
      }}
    >

      {/* Icon */}

      <div className="activity-row-icon">
        <ScanEye size={15} />
      </div>


      {/* Main information */}

      <div className="activity-row-main">

        <div className="activity-row-title">

          <span>
            {shortId(item.screening_id)}
          </span>

          <small>
            {item.eye.toUpperCase()}
          </small>


          {item.referable_dr && (
            <em>
              Referable signal
            </em>
          )}

        </div>


        <p>

          {item.predicted_grade_label ??
            'No prediction'}

          <span>
            {' · '}
          </span>

          {formatDate(item.created_at)}

        </p>

      </div>


      {/* Trust / status */}

      <StatusBadge tone={tone}>
        {item.trust_category ??
          item.status}
      </StatusBadge>


      {/* Arrow */}

      <ArrowRight
        size={15}
        className="activity-row-arrow"
      />

    </Link>
  );
}


/* ============================================================
   HELPERS
   ============================================================ */

function shortId(value: string) {

  return value.length > 12
    ? `…${value.slice(-8)}`
    : value;

}


function formatDate(
  value?: string | null
) {

  return value

    ? new Intl.DateTimeFormat(
        'en',
        {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }
      ).format(new Date(value))

    : 'Date unavailable';

}