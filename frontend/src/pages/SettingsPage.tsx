import {
  Bell,
  ChevronRight,
  Database,
  LockKeyhole,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Sparkles,
  Activity,
  Server,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataState } from '../components/DataState';
import { PageIntro } from '../components/PageIntro';
import { StatusBadge } from '../components/StatusBadge';
import { getHealth, getModels } from '../services/api';
import '../styles/settings.css';
const settings = [
  {
    icon: UserRound,
    title: 'Profile & workspace',
    detail: 'Manage identity and care team details',
    tag: 'Workspace',
  },
  {
    icon: ShieldCheck,
    title: 'Roles & permissions',
    detail: 'Control access for clinicians and healthcare workers',
    tag: 'Access',
  },
  {
    icon: Bell,
    title: 'Notifications',
    detail: 'Choose when review alerts are surfaced',
    tag: 'Alerts',
  },
  {
    icon: Database,
    title: 'Storage & retention',
    detail: 'Configure local or S3-compatible image storage',
    tag: 'Data',
  },
  {
    icon: LockKeyhole,
    title: 'Security & audit',
    detail: 'Session, authentication, and audit preferences',
    tag: 'Security',
  },
  {
    icon: Palette,
    title: 'Appearance',
    detail: 'Customize the workspace display',
    tag: 'Interface',
  },
];

export function SettingsPage() {
  const [health, setHealth] = useState<{
    status: string;
    database: string;
  } | null>(null);

  const [modelCount, setModelCount] = useState<number | null>(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() =>
        setHealth({
          status: 'unavailable',
          database: 'unavailable',
        }),
      );

    getModels()
      .then((items) => setModelCount(items.length))
      .catch(() => setModelCount(null));
  }, []);

  const apiHealthy =
    health?.status === 'ok' ||
    health?.status === 'healthy' ||
    health?.status === 'operational';

  const databaseHealthy =
    health?.database === 'connected' ||
    health?.database === 'ok';

  return (
    <div className="settings-page space-y-8">

      {/* HEADER */}
      <div className="settings-hero">
        <div className="settings-hero-glow" />

        <div className="relative z-10">
          <PageIntro
            eyebrow="Workspace"
            title="Settings"
            description="Configure the care workspace and understand its current technical posture."
          />
        </div>

        <div className="settings-status-pill">
          <span className="settings-status-dot" />
          Workspace active
        </div>
      </div>

      {/* SETTINGS GRID */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow text-teal-700">Configuration</p>
            <h2 className="section-title mt-1 text-lg font-extrabold text-ink">
              Workspace preferences
            </h2>
          </div>

          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
            <Sparkles size={14} />
            Personalize your workspace
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {settings.map(
            ({ icon: Icon, title, detail, tag }, index) => (
              <button
                key={title}
                className="settings-card group"
                style={
                  {
                    '--delay': `${index * 70}ms`,
                  } as React.CSSProperties
                }
              >
                <div className="settings-card-shine" />

                <div className="relative z-10 flex items-start gap-4">
                  <div className="settings-icon">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-ink">
                        {title}
                      </p>

                      <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:block">
                        {tag}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs leading-5 text-slate-400">
                      {detail}
                    </p>
                  </div>

                  <div className="settings-arrow">
                    <ChevronRight size={16} />
                  </div>
                </div>

                <div className="settings-card-line" />
              </button>
            ),
          )}
        </div>
      </section>

      {/* SYSTEM STATUS */}
      <section>
        <div className="mb-4">
          <p className="eyebrow text-teal-700">Infrastructure</p>
          <h2 className="section-title mt-1 text-lg font-extrabold text-ink">
            System environment
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Live signals from the connected Retina-Nexus API.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* ENVIRONMENT CARD */}
          <div className="environment-card">
            <div className="environment-top">
              <div className="flex items-center gap-3">
                <div className="environment-main-icon">
                  <SlidersHorizontal size={19} />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-ink">
                    Connected services
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Current backend and model availability
                  </p>
                </div>
              </div>

              <div className="live-indicator">
                <span />
                Live
              </div>
            </div>

            {!health ? (
              <div className="mt-6">
                <DataState label="Checking workspace health" />
              </div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Environment
                  label="API"
                  value={health.status}
                  icon={Server}
                  tone={apiHealthy ? 'success' : 'warning'}
                />

                <Environment
                  label="Database"
                  value={health.database}
                  icon={Database}
                  tone={databaseHealthy ? 'success' : 'warning'}
                />

                <Environment
                  label="ML artifacts"
                  value={
                    modelCount == null
                      ? 'Unavailable'
                      : modelCount
                        ? `${modelCount} registered`
                        : 'Not configured'
                  }
                  icon={Cpu}
                  tone={modelCount ? 'success' : 'warning'}
                />
              </div>
            )}
          </div>

          {/* READINESS CARD */}
          <div className="readiness-card">
            <div className="readiness-orb">
              <Activity size={21} />
            </div>

            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">
              Workspace readiness
            </p>

            <h3 className="mt-2 text-xl font-extrabold text-white">
              {health
                ? apiHealthy && databaseHealthy
                  ? 'Ready to operate'
                  : 'Attention required'
                : 'Checking status'}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Operational signals help confirm that the workspace is
              connected to its supporting services.
            </p>

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  API connection
                </span>

                <span
                  className={`text-[11px] font-bold ${
                    apiHealthy
                      ? 'text-teal-300'
                      : 'text-amber-300'
                  }`}
                >
                  {apiHealthy ? 'Connected' : 'Check'}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Database
                </span>

                <span
                  className={`text-[11px] font-bold ${
                    databaseHealthy
                      ? 'text-teal-300'
                      : 'text-amber-300'
                  }`}
                >
                  {databaseHealthy ? 'Connected' : 'Check'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROTOTYPE BOUNDARY */}
      <div className="settings-boundary">
        <div className="boundary-icon">
          <ShieldCheck size={18} />
        </div>

        <div>
          <p className="text-xs font-extrabold text-teal-900">
            Environment-managed configuration
          </p>

          <p className="mt-1 text-xs leading-5 text-teal-800/70">
            Workspace settings are visualized here, while deployment
            credentials, model calibration, and retention policy remain
            environment-managed configuration.
          </p>
        </div>
      </div>
    </div>
  );
}

function Environment({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
  tone: 'success' | 'warning';
}) {
  const connected = tone === 'success';

  return (
    <div className="environment-item group">
      <div className="flex items-start justify-between">
        <div className="environment-item-icon">
          <Icon size={16} />
        </div>

        <div
          className={`environment-check ${
            connected
              ? 'text-emerald-500'
              : 'text-amber-500'
          }`}
        >
          <CheckCircle2 size={15} />
        </div>
      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-extrabold capitalize text-ink">
        {value}
      </p>

      <div className="mt-3">
        <StatusBadge tone={tone} dot>
          {connected ? 'Connected' : 'Setup required'}
        </StatusBadge>
      </div>
    </div>
  );
}