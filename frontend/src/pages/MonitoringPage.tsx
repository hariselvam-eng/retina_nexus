import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  GitBranch,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataState, EmptyState, ErrorState } from '../components/DataState';
import { PageIntro } from '../components/PageIntro';
import { StatusBadge } from '../components/StatusBadge';
import { getModels, getMonitoringSummary } from '../services/api';
import '../styles/model-monitoring.css';

export function MonitoringPage() {
  const [models, setModels] = useState<Array<Record<string, any>>>([]);
  const [summary, setSummary] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState('');

  function load() {
    setError('');

    Promise.all([getModels(), getMonitoringSummary()])
      .then(([nextModels, nextSummary]) => {
        setModels(nextModels);
        setSummary(nextSummary);
      })
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load operations telemetry.'
        )
      );
  }

  useEffect(load, []);

  if (!summary) {
    return error ? (
      <div className="space-y-6">
        <PageIntro
          eyebrow="Operations"
          title="Model intelligence"
          description="Monitor inference health, review demand and model distribution signals."
        />
        <ErrorState message={error} onRetry={load} />
      </div>
    ) : (
      <DataState label="Loading operations telemetry" />
    );
  }

  const rates = summary.rates ?? {};
  const inference = summary.inference ?? {};
  const drift = summary.drift ?? {};
  const bottlenecks = summary.pipeline?.bottlenecks ?? [];

  return (
    <div className="monitor-page space-y-7">

      {/* HERO */}
      <section className="monitor-hero">
        <div className="monitor-hero-glow glow-one" />
        <div className="monitor-hero-glow glow-two" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">
                Live model telemetry
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Model intelligence
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Monitor inference health, operational throughput, distribution
              signals and model readiness from one clinical operations view.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="success" dot>
              API operational
            </StatusBadge>

            <div className="glass-chip">
              <Clock3 size={13} />
              Last {summary.window_days ?? 30} days
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
          <HeroSignal
            icon={Server}
            label="Inference service"
            value={inference.mean_ms == null ? 'No data' : `${Math.round(inference.mean_ms)} ms`}
            detail="Mean latency"
          />

          <HeroSignal
            icon={Database}
            label="Registry"
            value={`${models.length}`}
            detail="Registered models"
          />

          <HeroSignal
            icon={ShieldCheck}
            label="Automation"
            value="Disabled"
            detail="Manual validation required"
          />
        </div>
      </section>

      {/* WARNING */}
      <section className="monitor-warning">
        <div className="warning-icon">
          <AlertTriangle size={18} />
        </div>

        <div>
          <p className="text-sm font-extrabold text-amber-950">
            Drift flags require validation
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-900/70">
            No automatic retraining or model promotion is performed by this
            dashboard.
          </p>
        </div>
      </section>

      {/* METRICS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Screening volume"
          value={summary.sample_count ?? 0}
          detail={`${summary.completed_count ?? 0} completed`}
          icon={BarChart3}
        />

        <Metric
          label="Inference time"
          value={
            inference.mean_ms == null
              ? '—'
              : `${Math.round(inference.mean_ms)} ms`
          }
          detail={
            inference.p95_ms == null
              ? 'No timing data'
              : `p95 ${Math.round(inference.p95_ms)} ms`
          }
          icon={Clock3}
          tone="blue"
        />

        <Metric
          label="Ungradable rate"
          value={formatRate(rates.ungradable)}
          detail="Quality gate"
          icon={Gauge}
          tone="amber"
        />

        <Metric
          label="Review rate"
          value={formatRate(rates.review)}
          detail="Reviewed sessions"
          icon={Users}
          tone="rose"
        />

        <Metric
          label="Disagreement"
          value={formatRate(rates.disagreement)}
          detail="Model signal"
          icon={ShieldCheck}
          tone="slate"
        />
      </section>

      {/* PIPELINE + QUEUE */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">

        <section className="glass-panel p-6">
          <SectionHeader
            eyebrow="Pipeline performance"
            title="Where time is spent"
            icon={Zap}
            meta="Mean stage duration"
          />

          {bottlenecks.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Timing data is not available"
                detail="Run the master pipeline to populate stage-level latency telemetry."
              />
            </div>
          ) : (
            <div className="mt-7 space-y-5">
              {bottlenecks.map((item: any, index: number) => {
                const max = Math.max(
                  1,
                  bottlenecks[0]?.mean_ms ?? 1
                );

                const width = Math.max(
                  6,
                  Math.min(100, (item.mean_ms / max) * 100)
                );

                return (
                  <div
                    key={item.stage}
                    className="monitor-row"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="stage-number">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="text-xs font-bold capitalize text-slate-600">
                          {String(item.stage).replaceAll('_', ' ')}
                        </span>
                      </div>

                      <span className="text-xs font-black text-ink">
                        {Math.round(item.mean_ms)} ms
                      </span>
                    </div>

                    <div className="monitor-progress">
                      <div
                        className="monitor-progress-fill"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="queue-card">
          <div className="queue-orbit orbit-one" />
          <div className="queue-orbit orbit-two" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="queue-icon">
                  <Activity size={18} />
                </div>

                <div>
                  <p className="eyebrow text-teal-300">Review demand</p>
                  <h2 className="mt-1 text-base font-extrabold text-white">
                    Queue pressure
                  </h2>
                </div>
              </div>

              <span className="live-pulse-label">LIVE</span>
            </div>

            <div className="mt-8">
              <p className="queue-number">
                {summary.review_queue?.open_signal_count ?? 0}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                completed runs with review signals
              </p>
            </div>

            <div className="mt-7 space-y-4">
              <QueueStat
                label="Reviewed sessions"
                value={summary.review_queue?.reviewed_session_count ?? 0}
              />

              <QueueStat
                label="Model versions seen"
                value={Object.keys(summary.model_versions ?? {}).length}
              />

              <QueueStat
                label="Auto-retraining"
                value="Disabled"
                success
              />
            </div>
          </div>
        </section>
      </div>

      {/* DISTRIBUTIONS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionCard
          title="Prediction distribution"
          description="Observed model predictions"
          values={summary.prediction_distribution}
          icon={GitBranch}
        />

        <DistributionCard
          title="Quality distribution"
          description="Observed image-quality outcomes"
          values={summary.quality_distribution}
          icon={Gauge}
        />
      </div>

      {/* DRIFT */}
      <section className="glass-panel p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <SectionHeader
            eyebrow="Drift monitoring"
            title="Validation signals"
            icon={Activity}
          />

          <StatusBadge tone="neutral">
            Prototype monitoring
          </StatusBadge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [
              'input_distribution',
              'Input distribution',
              drift.input_distribution,
            ],
            ['prediction', 'Prediction drift', drift.prediction],
            ['quality', 'Quality drift', drift.quality],
          ].map(([key, label, item]: any, index) => (
            <DriftCard
              key={key}
              label={label}
              value={item}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* MODEL REGISTRY */}
      <section className="glass-panel overflow-hidden">
        <div className="border-b border-white/60 px-6 py-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <SectionHeader
              eyebrow="Model registry"
              title="Registered versions"
              icon={Sparkles}
            />

            <StatusBadge tone={models.length ? 'success' : 'warning'}>
              {models.length} registered
            </StatusBadge>
          </div>
        </div>

        {models.length === 0 ? (
          <EmptyState
            title="No active model version"
            detail="Register a validated artifact before enabling model-backed screening."
          />
        ) : (
          <div className="divide-y divide-white/70">
            {models.map((model, index) => (
              <div
                key={String(model.id)}
                className="model-row"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="model-avatar">
                    <GitBranch size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-ink">
                      {model.model_name}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {model.model_type} · version {model.version}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {model.training_dataset ?? 'Dataset not recorded'}
                  </span>

                  <StatusBadge
                    tone={model.is_active ? 'success' : 'neutral'}
                  >
                    {model.is_active ? 'Active' : 'Standby'}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DEPLOYMENT */}
      <div className="deployment-card">
        <div className="deployment-icon">
          <Database size={16} />
        </div>

        <div>
          <p className="text-xs font-extrabold text-teal-950">
            Deployment status
          </p>

          <p className="mt-1 text-[11px] leading-5 text-teal-900/70">
            {summary.system_health?.worker_mode?.replaceAll('_', ' ') ??
              'queue-ready'}
            {' · '}
            Secure synchronization and offline-first behavior remain
            deployment configuration concerns.
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------- COMPONENTS -------------------- */

function HeroSignal({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="hero-signal">
      <div className="hero-signal-icon">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-black text-white">
          {value}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  icon: Icon,
  meta,
}: {
  eyebrow: string;
  title: string;
  icon: typeof Activity;
  meta?: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="section-icon">
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="eyebrow text-teal-700">{eyebrow}</p>
          <h2 className="mt-1 truncate text-base font-extrabold text-ink">
            {title}
          </h2>
        </div>
      </div>

      {meta && (
        <span className="hidden text-xs text-slate-400 sm:block">
          {meta}
        </span>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'teal',
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Activity;
  tone?: 'teal' | 'blue' | 'amber' | 'rose' | 'slate';
}) {
  const styles = {
    teal: 'bg-teal-50 text-teal-700',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="metric-glass">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>

        <div className={`metric-icon ${styles[tone]}`}>
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-5 text-2xl font-black tracking-tight text-ink">
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span className="metric-dot" />
        <p className="text-xs text-slate-400">{detail}</p>
      </div>
    </div>
  );
}

function QueueStat({
  label,
  value,
  success,
}: {
  label: string;
  value: string | number;
  success?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-slate-400">{label}</span>

      <span
        className={`text-xs font-black ${
          success ? 'text-emerald-300' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function DistributionCard({
  title,
  description,
  values,
  icon: Icon,
}: {
  title: string;
  description: string;
  values?: Record<string, number>;
  icon: typeof Activity;
}) {
  const entries = Object.entries(values ?? {});
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return (
    <section className="glass-panel p-6">
      <SectionHeader
        eyebrow="Distribution"
        title={title}
        icon={Icon}
      />

      <p className="ml-[48px] mt-1 text-xs text-slate-400">
        {description}
      </p>

      {entries.length === 0 ? (
        <p className="mt-7 text-sm text-slate-500">
          No observations in this window.
        </p>
      ) : (
        <div className="mt-7 space-y-5">
          {entries.map(([label, value], index) => {
            const percentage = total
              ? Math.round((value / total) * 100)
              : 0;

            return (
              <div key={label} className="distribution-row">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="distribution-index">
                      {index + 1}
                    </span>

                    <span className="text-xs font-bold capitalize text-slate-600">
                      {label.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <span className="text-xs font-black text-ink">
                    {value} · {percentage}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="distribution-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DriftCard({
  label,
  value,
  index,
}: {
  label: string;
  value?: Record<string, any>;
  index: number;
}) {
  const flagged = value?.flagged;
  const insufficient = value?.status === 'INSUFFICIENT_DATA';

  const tone = flagged
    ? 'danger'
    : insufficient
      ? 'warning'
      : 'success';

  return (
    <div
      className={`drift-card drift-${tone}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="drift-pulse" />
          <p className="text-xs font-extrabold text-ink">{label}</p>
        </div>

        {flagged ? (
          <AlertTriangle size={16} className="text-rose-600" />
        ) : insufficient ? (
          <Clock3 size={16} className="text-amber-600" />
        ) : (
          <CheckCircle2 size={16} className="text-emerald-600" />
        )}
      </div>

      <p className="mt-5 text-sm font-black capitalize text-ink">
        {String(value?.status ?? 'NOT RUN').replaceAll('_', ' ')}
      </p>

      <p className="mt-2 text-[11px] leading-5 text-slate-600">
        {value?.action ?? 'No validation action recorded.'}
      </p>
    </div>
  );
}

function formatRate(value?: number) {
  return value == null ? '—' : `${Math.round(value * 100)}%`;
}