import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  FileCheck2,
  GitBranch,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { DataState, EmptyState, ErrorState } from '../components/DataState';
import { StatusBadge } from '../components/StatusBadge';
import { getDatasetStatistics, getDatasets } from '../services/api';
import type {
  DatasetRecord,
  DatasetStatisticsRecord,
  StatusTone,
} from '../types';
import '../styles/data-governance.css';
const statusCopy: Record<
  DatasetRecord['status'],
  { label: string; tone: StatusTone }
> = {
  not_acquired: { label: 'Not acquired', tone: 'neutral' },
  available: { label: 'Available', tone: 'teal' },
  validating: { label: 'Validating', tone: 'warning' },
  ready: { label: 'Ready', tone: 'success' },
  blocked: { label: 'Blocked', tone: 'danger' },
};

const availabilityCopy: Record<
  string,
  { label: string; tone: StatusTone }
> = {
  AVAILABLE: { label: 'Available', tone: 'success' },
  'PARTIALLY AVAILABLE': {
    label: 'Partially available',
    tone: 'warning',
  },
  MISSING: { label: 'Missing', tone: 'neutral' },
  INVALID: { label: 'Invalid', tone: 'danger' },
};

export function DatasetManagementPage() {
  const [datasets, setDatasets] = useState<DatasetRecord[]>([]);
  const [statistics, setStatistics] = useState<
    Record<string, DatasetStatisticsRecord>
  >({});
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await getDatasets();

      const nextStatistics: Record<
        string,
        DatasetStatisticsRecord
      > = {};

      await Promise.all(
        items.map(async (item) => {
          if (!item.id) return;

          try {
            nextStatistics[item.id] =
              await getDatasetStatistics(item.id);
          } catch {
            // Dataset remains visible even if optional statistics fail.
          }
        }),
      );

      setDatasets(items);
      setStatistics(nextStatistics);
      setLive(true);
    } catch (reason: unknown) {
      setLive(false);

      setError(
        reason instanceof Error
          ? reason.message
          : 'Dataset registry could not be loaded.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const statRows = Object.values(statistics);

  const totalFiles = statRows.reduce(
    (sum, item) => sum + item.total_files,
    0,
  );

  const readableFiles = statRows.reduce(
    (sum, item) => sum + item.readable_files,
    0,
  );

  const corruptedFiles = statRows.reduce(
    (sum, item) => sum + item.corrupted_files,
    0,
  );

  const duplicateFiles = statRows.reduce(
    (sum, item) =>
      sum +
      item.duplicate_exact_count +
      item.duplicate_perceptual_count,
    0,
  );

  const hasStatistics = statRows.length > 0;

  const readyDatasets = useMemo(
    () =>
      datasets.filter(
        (dataset) =>
          dataset.status === 'ready' ||
          dataset.availability_status === 'AVAILABLE',
      ).length,
    [datasets],
  );

  const blockedDatasets = useMemo(
    () =>
      datasets.filter(
        (dataset) =>
          dataset.status === 'blocked' ||
          dataset.availability_status === 'INVALID',
      ).length,
    [datasets],
  );

  const averageReadiness = useMemo(() => {
    const values = datasets
      .map((dataset) => dataset.readiness_score)
      .filter((value): value is number => value != null);

    if (!values.length) return null;

    return Math.round(
      values.reduce((sum, value) => sum + value, 0) /
        values.length,
    );
  }, [datasets]);

  return (
    <div className="relative space-y-7 pb-10">
      {/* Ambient glass background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[15%] top-20 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl animate-pulse" />
        <div className="absolute right-[10%] top-[35%] h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl animate-pulse [animation-delay:1.5s]" />
        <div className="absolute bottom-10 left-[40%] h-64 w-64 rounded-full bg-indigo-300/5 blur-3xl animate-pulse [animation-delay:3s]" />
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/60 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200/70 bg-teal-50/70 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal-700 backdrop-blur">
                <Database size={12} />
                Data governance
              </span>

              <StatusBadge
                tone={live ? 'success' : 'neutral'}
                dot
              >
                {live
                  ? 'Registry connected'
                  : 'Registry unavailable'}
              </StatusBadge>
            </div>

            <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Dataset command center
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor dataset readiness, integrity, duplicates and
              validation signals before data enters the ML pipeline.
            </p>
          </div>

          <button
            onClick={() => void load()}
            disabled={loading}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-xs font-extrabold text-slate-700 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? 'animate-spin'
                  : 'transition-transform group-hover:rotate-180'
              }
            />
            Refresh registry
          </button>
        </div>
      </section>

      {/* TOP METRICS */}
      {!loading && !error && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <GovernanceMetric
            icon={Database}
            label="Registered datasets"
            value={datasets.length}
            detail="In workspace registry"
            tone="teal"
          />

          <GovernanceMetric
            icon={CheckCircle2}
            label="Ready datasets"
            value={readyDatasets}
            detail="Available for pipeline use"
            tone="green"
          />

          <GovernanceMetric
            icon={TriangleAlert}
            label="Blocked"
            value={blockedDatasets}
            detail="Require intervention"
            tone="rose"
          />

          <GovernanceMetric
            icon={ShieldCheck}
            label="Avg readiness"
            value={
              averageReadiness == null
                ? '—'
                : `${averageReadiness}%`
            }
            detail="Registry readiness signal"
            tone="purple"
          />
        </section>
      )}

      {/* GOVERNANCE NOTICE */}
      <section className="relative overflow-hidden rounded-[24px] border border-teal-200/50 bg-gradient-to-br from-teal-50/80 via-white/60 to-cyan-50/50 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-teal-600 shadow-sm">
            <ShieldCheck size={20} />
          </div>

          <div>
            <p className="text-sm font-black text-slate-900">
              Engineering readiness boundary
            </p>

            <p className="mt-1 max-w-4xl text-xs leading-5 text-slate-500">
              Readiness combines file, label, duplicate and split
              validation signals. It does not represent clinical
              validation, diagnostic accuracy or safety approval.
            </p>
          </div>
        </div>
      </section>

      {/* STATES */}
      {loading && (
        <DataState label="Loading dataset registry" />
      )}

      {error && (
        <ErrorState
          message={error}
          onRetry={() => void load()}
        />
      )}

      {!loading &&
        !error &&
        datasets.length === 0 && (
          <EmptyState
            title="No datasets are registered"
            detail="Dataset registry entries will appear after the API database is initialized."
          />
        )}

      {/* DATASETS */}
      {!loading &&
        !error &&
        datasets.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-600">
                  Registry
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  Dataset library
                </h2>
              </div>

              <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-[10px] font-bold text-slate-500 backdrop-blur">
                {datasets.length} registered
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {datasets.map((dataset) => (
                <DatasetCard
                  key={dataset.slug}
                  dataset={dataset}
                  statistics={
                    dataset.id
                      ? statistics[dataset.id]
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        )}

      {/* LOWER SECTION */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
        {/* Governance indicators */}
        <section className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/65 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <BarChart3 size={18} />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-teal-600">
                Validation telemetry
              </p>

              <h2 className="mt-1 text-base font-black text-slate-950">
                Governance indicators
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Latest statistics returned by the registry
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Indicator
              icon={FileCheck2}
              label="Readable files"
              value={
                hasStatistics
                  ? `${readableFiles.toLocaleString()} / ${totalFiles.toLocaleString()}`
                  : 'Not run'
              }
            />

            <Indicator
              icon={GitBranch}
              label="Split integrity"
              value="See validation"
            />

            <Indicator
              icon={AlertTriangle}
              label="Duplicates"
              value={
                hasStatistics
                  ? duplicateFiles.toLocaleString()
                  : 'Not run'
              }
            />

            <Indicator
              icon={Database}
              label="Corrupted files"
              value={
                hasStatistics
                  ? corruptedFiles.toLocaleString()
                  : 'Not run'
              }
            />
          </div>
        </section>

        {/* Validation action */}
        <section className="relative overflow-hidden rounded-[26px] bg-slate-950 p-6 text-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-teal-300">
                <Sparkles size={18} />
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                CLI
              </span>
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-teal-300">
              Next action
            </p>

            <h2 className="mt-2 text-lg font-black">
              Run a validation pass
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Place an authorized dataset in its raw folder and run
              the governance validator to populate the indicators.
            </p>

            <code className="mt-5 block overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-[10px] leading-5 text-teal-100">
              python scripts/validate_dataset.py
              <br />
              --dataset aptos2019
            </code>
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* METRIC CARD */
/* -------------------------------------------------------------------------- */

function GovernanceMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Database;
  label: string;
  value: number | string;
  detail: string;
  tone: 'teal' | 'green' | 'rose' | 'purple';
}) {
  const tones = {
    teal: 'bg-teal-50 text-teal-600',
    green: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    purple: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-white/80 bg-white/65 p-5 shadow-[0_15px_45px_rgba(15,23,42,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_22px_55px_rgba(15,23,42,0.09)]">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal-300/5 blur-2xl transition group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {typeof value === 'number'
              ? value.toLocaleString()
              : value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {detail}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]} transition duration-300 group-hover:scale-110`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DATASET CARD */
/* -------------------------------------------------------------------------- */

function DatasetCard({
  dataset,
  statistics,
}: {
  dataset: DatasetRecord;
  statistics?: DatasetStatisticsRecord;
}) {
  const status =
    availabilityCopy[
      dataset.availability_status ?? ''
    ] ?? statusCopy[dataset.status];

  const duplicateCount = statistics
    ? statistics.duplicate_exact_count +
      statistics.duplicate_perceptual_count
    : null;

  const classCount = statistics?.class_distribution
    ? Object.keys(statistics.class_distribution).length
    : null;

  const readiness =
    dataset.readiness_score == null
      ? null
      : Math.max(
          0,
          Math.min(100, dataset.readiness_score),
        );

  return (
    <article className="group relative overflow-hidden rounded-[25px] border border-white/80 bg-white/65 p-5 shadow-[0_15px_50px_rgba(15,23,42,0.055)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_25px_65px_rgba(15,23,42,0.1)]">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-teal-300/10 blur-3xl transition duration-500 group-hover:scale-150" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition duration-300 group-hover:rotate-3 group-hover:scale-105">
            <Database size={19} />
          </div>

          <StatusBadge tone={status.tone}>
            {status.label}
          </StatusBadge>
        </div>

        <h2 className="mt-5 text-base font-black leading-5 text-slate-950">
          {dataset.name}
        </h2>

        <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">
          {dataset.purpose}
        </p>

        {/* Readiness */}
        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400">
              Readiness
            </span>

            <span className="text-xs font-black text-slate-800">
              {readiness == null
                ? '—'
                : `${readiness}/100`}
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 transition-all duration-1000"
              style={{
                width: `${readiness ?? 0}%`,
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <Stat
            label="Images"
            value={
              dataset.image_count == null
                ? '—'
                : dataset.image_count.toLocaleString()
            }
          />

          <Stat
            label="Duplicates"
            value={
              duplicateCount == null
                ? 'Not run'
                : duplicateCount.toLocaleString()
            }
          />

          <Stat
            label="Corrupted"
            value={
              statistics == null
                ? 'Not run'
                : statistics.corrupted_files.toLocaleString()
            }
          />

          <Stat
            label="Classes"
            value={
              classCount == null
                ? 'Not analyzed'
                : classCount.toString()
            }
          />
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* SMALL COMPONENTS */
/* -------------------------------------------------------------------------- */

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

function Indicator({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Database;
  label: string;
  value: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/70 bg-slate-50/70 p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-teal-600 shadow-sm">
        <Icon size={15} />
      </div>

      <p className="mt-3 text-[10px] font-bold text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}