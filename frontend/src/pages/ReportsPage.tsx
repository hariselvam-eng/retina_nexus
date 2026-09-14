import {
  ArrowUpRight,
  Download,
  FileCheck2,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataState, EmptyState, ErrorState } from '../components/DataState';
import {
  generateReport,
  getReports,
  reportPdfUrl,
  type Report,
} from '../services/api';
import "../styles/reports.css";
export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  function load() {
    setLoading(true);
    setError('');

    getReports()
      .then(setReports)
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load reports.',
        ),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();

    if (!sessionId.trim()) return;

    setGenerating(true);
    setMessage('');
    setError('');

    try {
      const report = await generateReport(sessionId.trim());

      setReports((current) => [report, ...current]);
      setMessage(`Report ${shortId(report.report_id)} is ready.`);
      setSessionId('');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to generate report.',
      );
    } finally {
      setGenerating(false);
    }
  }

  const readyReports = reports.filter(
    (report) => report.status === 'ready',
  ).length;

  const filteredReports = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return reports;

    return reports.filter((report) =>
      `${report.report_id} ${report.session_id} ${report.status}`
        .toLowerCase()
        .includes(value),
    );
  }, [reports, search]);

  return (
    <div className="space-y-8 pb-10">
      {/* -------------------------------------------------- */}
      {/* HERO */}
      {/* -------------------------------------------------- */}

      <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        {/* decorative glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/70 bg-teal-50/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-teal-700">
              <Sparkles size={13} />
              Clinical communication
            </div>

            <h1 className="max-w-3xl text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Reports that keep every
              <span className="text-teal-600"> decision traceable.</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Generate structured screening summaries while keeping AI
              recommendations clearly separated from the final clinician
              decision.
            </p>
          </div>

          <button
            onClick={load}
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-xs font-bold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 hover:shadow-lg"
          >
            <RefreshCw
              size={15}
              className="transition-transform duration-500 group-hover:rotate-180"
            />
            Refresh library
          </button>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* STATS */}
      {/* -------------------------------------------------- */}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={FileText}
          label="Total reports"
          value={reports.length}
          detail="Generated in workspace"
        />

        <StatCard
          icon={FileCheck2}
          label="Ready reports"
          value={readyReports}
          detail="Available for review"
          accent="green"
        />

        <StatCard
          icon={ShieldCheck}
          label="Clinical boundary"
          value="Protected"
          detail="AI output remains advisory"
          accent="blue"
        />
      </section>

      {/* -------------------------------------------------- */}
      {/* GENERATE */}
      {/* -------------------------------------------------- */}

      <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/65 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-teal-50/70 to-transparent lg:block" />

        <div className="relative grid lg:grid-cols-[1fr_340px]">
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-[0_10px_25px_rgba(20,184,166,0.25)]">
                <Plus size={21} />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-600">
                  Create report
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  Export a screening summary
                </h2>

                <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
                  Enter a completed screening session ID to generate its
                  clinical communication PDF.
                </p>
              </div>
            </div>

            <form
              onSubmit={create}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <input
                  required
                  value={sessionId}
                  onChange={(event) => setSessionId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3.5 pr-10 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100/60"
                  placeholder="Paste screening session UUID"
                />

                {sessionId && (
                  <button
                    type="button"
                    onClick={() => setSessionId('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                disabled={generating}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-xs font-black text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-[0_15px_35px_rgba(20,184,166,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <FileText
                    size={16}
                    className="transition-transform group-hover:scale-110"
                  />
                )}

                {generating ? 'Generating…' : 'Generate PDF'}
              </button>
            </form>

            {message && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs font-bold text-emerald-700">
                <FileCheck2 size={15} />
                {message}
              </div>
            )}

            {error && (
              <div className="mt-4">
                <ErrorState message={error} />
              </div>
            )}
          </div>

          {/* boundary panel */}

          <div className="relative border-t border-slate-200/70 bg-slate-950/[0.025] p-6 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Clinical boundary
                </p>
                <p className="text-[10px] font-semibold text-slate-400">
                  AI output ≠ final decision
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs leading-6 text-slate-500">
              Reports identify the AI screening recommendation separately from
              clinician review, preserving reviewer accountability and audit
              traceability.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Workflow
                </span>

                <span className="text-[10px] font-black text-teal-600">
                  TRACEABLE
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <span>AI screening</span>
                <ArrowUpRight size={12} />
                <span>Review</span>
                <ArrowUpRight size={12} />
                <span>Report</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* REPORT LIBRARY */}
      {/* -------------------------------------------------- */}

      <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/65 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 border-b border-slate-200/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-600">
              Report library
            </p>

            <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950">
              Generated reports
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {reports.length} report{reports.length === 1 ? '' : 's'} in
              workspace
            </p>
          </div>

          {reports.length > 0 && (
            <div className="relative">
              <SearchIcon
                value={search}
                onChange={setSearch}
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-6">
            <DataState label="Loading report library" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={
                search ? 'No matching reports' : 'No reports generated'
              }
              detail={
                search
                  ? 'Try searching with another report or screening ID.'
                  : 'Generate a report from a completed screening run when your care team is ready to share the result.'
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70">
            {filteredReports.map((report, index) => (
              <ReportRow
                key={report.report_id}
                report={report}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------- */
/* STAT CARD */
/* -------------------------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  accent = 'teal',
}: {
  icon: typeof FileText;
  label: string;
  value: string | number;
  detail: string;
  accent?: 'teal' | 'green' | 'blue';
}) {
  const styles = {
    teal: 'bg-teal-50 text-teal-600',
    green: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="group rounded-[24px] border border-white/70 bg-white/65 p-5 shadow-[0_15px_45px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,0.1)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">{detail}</p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* SEARCH */
/* -------------------------------------------------- */

function SearchIcon({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <SearchSymbol />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search reports..."
        className="w-full rounded-xl border border-slate-200 bg-white/70 py-2.5 pl-9 pr-3 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-50 sm:w-[230px]"
      />
    </div>
  );
}

function SearchSymbol() {
  return (
    <svg
      className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/* -------------------------------------------------- */
/* REPORT ROW */
/* -------------------------------------------------- */

function ReportRow({
  report,
  index,
}: {
  report: Report;
  index: number;
}) {
  return (
    <div
      className="group flex flex-col gap-5 p-5 transition-all duration-300 hover:bg-teal-50/30 sm:flex-row sm:items-center sm:p-6"
      style={{
        animation: `reportEnter 420ms ease ${index * 60}ms both`,
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-700 ring-1 ring-teal-100 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
          <FileText size={19} />

          {report.status === 'ready' && (
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-black text-slate-900">
              {shortId(report.report_id)}
            </p>

            <StatusBadge
              tone={report.status === 'ready' ? 'success' : 'warning'}
            >
              {report.status}
            </StatusBadge>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
            <span>PDF clinical summary</span>
            <span>•</span>
            <span>{formatDate(report.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:flex sm:items-center sm:gap-10">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Screening
          </p>

          <Link
            to="/screening/results"
            state={{ screeningId: report.session_id }}
            className="mt-1 block text-xs font-bold text-teal-700 transition-colors hover:text-teal-500"
          >
            {shortId(report.session_id)}
          </Link>
        </div>

        <a
          href={reportPdfUrl(report.report_id)}
          target="_blank"
          rel="noreferrer"
          className="group/download inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
        >
          <Download
            size={14}
            className="transition-transform group-hover/download:translate-y-0.5"
          />
          PDF
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* HELPERS */
/* -------------------------------------------------- */

function shortId(value: string) {
  return value.length > 12 ? `…${value.slice(-8)}` : value;
}

function formatDate(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(value))
    : '—';
}