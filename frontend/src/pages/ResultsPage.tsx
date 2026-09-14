import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Download,
  Eye,
  FileText,
  Info,
  Layers3,
  ScanEye,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DataState, ErrorState } from '../components/DataState';
import { StatusBadge } from '../components/StatusBadge';
import { TrustPanel } from '../components/TrustPanel';
import { generateReport, getScreeningRun, imageContentUrl, type ScreeningRun } from '../services/api';
import '../styles/result-page.css';

type NavigationState = { imageId?: string; screeningId?: string; run?: ScreeningRun };

export function ResultsPage() {
  const location = useLocation();
  const navigation = (location.state as NavigationState | null) ?? null;
  const screeningId = navigation?.screeningId ?? navigation?.run?.screening_id;
  const [imageId, setImageId] = useState(navigation?.imageId ?? navigation?.run?.image_id);
  const [run, setRun] = useState<ScreeningRun | null>(navigation?.run ?? null);
  const [loading, setLoading] = useState(!navigation?.run && Boolean(screeningId));
  const [error, setError] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    let active = true;
    if (!screeningId || navigation?.run) return () => { active = false; };
    setLoading(true);
    setError('');
    getScreeningRun(screeningId)
      .then((next) => {
        if (active) {
          setRun(next);
          setImageId(next.image_id);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load this screening run.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [screeningId, navigation?.run]);

  useEffect(() => {
    if (!screeningId || !run || run.primary_status !== 'COMPLETED' || run.evidence_status !== 'PROCESSING') return;
    let active = true;
    const refresh = () =>
      getScreeningRun(screeningId)
        .then((next) => { if (active) setRun(next); })
        .catch(() => {});
    const timer = window.setInterval(refresh, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [screeningId, run?.primary_status, run?.evidence_status]);

  async function exportReport() {
    if (!screeningId) return;
    setReporting(true);
    try {
      const report = await generateReport(screeningId);
      window.open(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'}${report.download_url ?? `/reports/${report.report_id}/pdf`}`,
        '_blank',
        'noopener,noreferrer',
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to generate the report.');
    } finally {
      setReporting(false);
    }
  }

  const quality = run?.quality?.final as {
    quality_decision?: string;
    quality_score?: number;
    component_scores?: Record<string, number>;
    issues?: Array<{ type: string; message: string }>;
  } | undefined;
  const classification = run?.classification;
  const trust = run?.retinaguard;
  const completed = run?.status === 'COMPLETED';
  const referable = classification?.referable_dr === true;

  return (
    <div className="result-page">
      <div className="result-toolbar">
        <Link to="/screening/new" className="result-back">
          <ArrowLeft size={15} /> New screening
        </Link>
        <div className="toolbar-actions">
          {run && (
            <StatusBadge tone={run.status === 'FAILED' ? 'danger' : completed ? 'success' : 'teal'}>
              {run.status}
            </StatusBadge>
          )}
          <button
            onClick={exportReport}
            disabled={!screeningId || reporting || !completed}
            className="glass-action disabled:opacity-40"
          >
            <Download size={15} /> {reporting ? 'Preparing…' : 'Export PDF'}
          </button>
        </div>
      </div>

      <header className="result-hero">
        <div>
          <div className="result-kicker"><span className="live-dot" /> SCREENING INTELLIGENCE</div>
          <h1>{classification?.predicted_grade_label ?? (run?.status === 'FAILED' ? 'Run failed safely' : 'Analysis in progress')}</h1>
          <p>
            AI-assisted retinal screening with quality gating, model self-checks and evidence-aware review.
          </p>
        </div>
        {screeningId && (
          <Link to="/review" state={{ screeningId, imageId }} className="premium-cta">
            <Stethoscope size={17} /> Clinical review <span>→</span>
          </Link>
        )}
      </header>

      {loading && <DataState label="Loading the integrated screening result" />}
      {error && <ErrorState message={error} />}

      {run?.status === 'FAILED' && (
        <div className="result-alert">
          <AlertTriangle size={20} />
          <div>
            <strong>No clinical result was created</strong>
            <p>{run.error?.message ?? run.message}</p>
            <small>Failed stage: {run.error?.stage ?? 'unknown'}. Resolve the configuration issue and start a new run.</small>
          </div>
        </div>
      )}

      {run && run.status !== 'FAILED' && (
        <>
          <ResultScoreboard run={run} quality={quality} />

          <div className="result-layout">
            <main className="result-main">
              <FundusViewer imageId={imageId} run={run} />

              <div className="result-grid-two">
                <ClassificationPanel classification={classification} />
                <QualityPanel quality={quality} />
              </div>

              <PipelineStatusPanel run={run} />

              <div className="evidence-card">
                <div className="section-heading">
                  <div className="heading-icon purple"><Sparkles size={17} /></div>
                  <div>
                    <span>Evidence layer</span>
                    <h2>Model evidence, not just a score</h2>
                  </div>
                  <StatusBadge tone={run.evidence_status === 'AVAILABLE' ? 'success' : 'warning'}>
                    {run.evidence_status ?? 'Not run'}
                  </StatusBadge>
                </div>
                <div className="evidence-grid">
                  <EvidenceTile icon={Layers3} label="Lesion evidence" value={evidenceStageState(run, ['lesion_detection'])} />
                  <EvidenceTile icon={ScanEye} label="Retinal structure" value={evidenceStageState(run, ['retinal_structure_analysis'])} />
                  <EvidenceTile icon={Activity} label="Grad-CAM" value={evidenceStageState(run, ['grad_cam'])} />
                  <EvidenceTile icon={Eye} label="Attention agreement" value={evidenceStageState(run, ['attention_lesion_agreement'])} />
                </div>
                {run.evidence_message && run.evidence_status !== 'AVAILABLE' && (
                  <p className="muted-note">{run.evidence_message}</p>
                )}
              </div>
            </main>

            <aside className="result-side">
              <SignalPanel run={run} />
              <div className="trust-wrap">
                <TrustPanel result={trust ?? null} />
              </div>

              <div className="explain-card">
                <div className="explain-orb"><Sparkles size={19} /></div>
                <span>EXPLAINABILITY</span>
                <h3>See why the model looked where it did.</h3>
                <p>Review Grad-CAM, lesion evidence, agreement and stability signals together.</p>
                <Link
                  to="/screening/explain"
                  state={{ imageId, screeningSessionId: run.screening_session_id, run }}
                  className="explain-button"
                >
                  Open explainability <span>→</span>
                </Link>
              </div>

              <div className="safety-note">
                <ShieldCheck size={17} />
                <div>
                  <strong>Clinical safety boundary</strong>
                  <p>AI output supports screening workflow and does not replace clinical judgement.</p>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function ResultScoreboard({
  run,
  quality,
}: {
  run: ScreeningRun;
  quality?: { quality_decision?: string; quality_score?: number };
}) {
  const classification = run.classification;
  const cards = [
    {
      icon: ScanEye,
      label: 'DR severity',
      value: classification?.predicted_grade_label ?? 'Not available',
      detail: classification ? `Level ${classification.predicted_grade} of 4` : 'No model output',
      tone: 'teal',
    },
    {
      icon: CircleAlert,
      label: 'Referable DR',
      value: classification ? (classification.referable_dr ? 'Yes' : 'No') : 'Not available',
      detail: classification ? `${Math.round(classification.referable_probability * 100)}% mapped probability` : 'No model output',
      tone: classification?.referable_dr ? 'rose' : 'green',
    },
    {
      icon: ShieldCheck,
      label: 'Trust score',
      value: run.retinaguard ? `${Math.round(run.retinaguard.trust_score * 100)}/100` : 'Not available',
      detail: run.retinaguard?.trust_category ?? 'Self-check not run',
      tone: 'violet',
    },
    {
      icon: Stethoscope,
      label: 'Recommended action',
      value: actionLabel(run.triage?.recommendation),
      detail: quality?.quality_decision === 'UNGRADABLE' ? 'Quality gate stopped the run' : 'Workflow recommendation',
      tone: 'amber',
    },
  ];

  return (
    <section className="scoreboard">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div className={`score-card ${card.tone}`} key={card.label} style={{ animationDelay: `${index * 70}ms` }}>
            <div className="score-top">
              <span>{card.label}</span>
              <div className="score-icon"><Icon size={17} /></div>
            </div>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </div>
        );
      })}
    </section>
  );
}

function FundusViewer({ imageId, run }: { imageId?: string; run: ScreeningRun }) {
  const [visible, setVisible] = useState({ gradCam: true, lesions: true, evidence: false });
  const [opacity, setOpacity] = useState(0.72);
  const heatmap = run.explainability?.grad_cam.overlay_data_uri;
  const lesionMap = run.explainability?.lesion_evidence_map_data_uri;
  const evidenceMap = run.lesions?.evidence_map_data_uri;

  return (
    <section className="viewer-card">
      <div className="viewer-head">
        <div>
          <div className="mini-label">RETINAL VIEWER</div>
          <h2>Fundus image <span>·</span> model-linked evidence</h2>
        </div>
        <div className="viewer-meta"><Eye size={14} /> Source image</div>
      </div>

      <div className="fundus-stage">
        <div className="fundus-glow" />
        {imageId ? (
          <img src={imageContentUrl(imageId)} alt="Original fundus image" className="fundus-image" />
        ) : (
          <div className="image-empty">Original image preview is not available.</div>
        )}
        {visible.gradCam && heatmap && <img src={heatmap} alt="Grad-CAM overlay" className="overlay-image" style={{ opacity }} />}
        {visible.lesions && lesionMap && <img src={lesionMap} alt="Lesion evidence overlay" className="overlay-image" style={{ opacity: opacity * 0.8 }} />}
        {visible.evidence && evidenceMap && <img src={evidenceMap} alt="Combined evidence overlay" className="overlay-image" style={{ opacity: opacity * 0.55 }} />}
        <div className="viewer-chip"><span /> LIVE EVIDENCE VIEW</div>
        <div className="viewer-corner">OD / OS</div>
      </div>

      <div className="viewer-controls">
        <Toggle active={visible.gradCam} onClick={() => setVisible((v) => ({ ...v, gradCam: !v.gradCam }))} colour="pink">Grad-CAM</Toggle>
        <Toggle active={visible.lesions} onClick={() => setVisible((v) => ({ ...v, lesions: !v.lesions }))} colour="amber">Lesion evidence</Toggle>
        <Toggle active={visible.evidence} onClick={() => setVisible((v) => ({ ...v, evidence: !v.evidence }))} colour="cyan">Other evidence</Toggle>
        <label className="opacity-control">
          <span>Overlay</span>
          <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
          <b>{Math.round(opacity * 100)}%</b>
        </label>
      </div>

      <div className="viewer-disclaimer"><Info size={14} /> Overlays support review; they do not prove causality or replace clinical judgement.</div>
    </section>
  );
}

function ClassificationPanel({ classification }: { classification: ScreeningRun['classification'] }) {
  if (!classification) {
    return (
      <section className="panel-card">
        <div className="mini-label">AI ASSESSMENT</div>
        <h2>No classification output</h2>
        <p>The configured model did not return a prediction. This is an intentional safe state.</p>
      </section>
    );
  }

  return (
    <section className="panel-card">
      <div className="panel-title-row">
        <div>
          <div className="mini-label">AI ASSESSMENT</div>
          <h2>{classification.predicted_grade_label}</h2>
          <p>Level {classification.predicted_grade} · {classification.model_name} · {classification.model_version}</p>
        </div>
        <StatusBadge tone={classification.referable_dr ? 'danger' : 'success'}>
          {classification.referable_dr ? 'Referable DR' : 'Non-referable'}
        </StatusBadge>
      </div>

      <div className="probabilities">
        {Object.entries(classification.probabilities).map(([label, value]) => (
          <div className="probability" key={label}>
            <div><span>{label}</span><b>{Math.round(value * 100)}%</b></div>
            <div className="bar"><i className={label === classification.predicted_grade_label ? 'active' : ''} style={{ width: `${value * 100}%` }} /></div>
          </div>
        ))}
      </div>
      <p className="panel-foot">Raw confidence: {Math.round(classification.raw_confidence * 100)}%. Confidence is not a clinical trust guarantee.</p>
    </section>
  );
}

function QualityPanel({ quality }: { quality?: { quality_decision?: string; quality_score?: number; component_scores?: Record<string, number>; issues?: Array<{ type: string; message: string }> } }) {
  return (
    <section className="panel-card">
      <div className="mini-label">IMAGE TRUST GATE</div>
      <div className="quality-score-row">
        <div><strong>{quality?.quality_score == null ? '—' : `${Math.round(quality.quality_score * 100)}%`}</strong><span>quality score</span></div>
        <StatusBadge tone={quality?.quality_decision === 'GRADABLE' ? 'success' : quality?.quality_decision === 'UNGRADABLE' ? 'danger' : 'warning'}>
          {quality?.quality_decision ?? 'Unavailable'}
        </StatusBadge>
      </div>
      <div className="quality-list">
        {Object.entries(quality?.component_scores ?? {}).map(([name, value]) => (
          <div key={name}>
            <div><span>{name.replaceAll('_', ' ')}</span><b>{Math.round(value * 100)}%</b></div>
            <div className="bar"><i style={{ width: `${value * 100}%` }} /></div>
          </div>
        ))}
      </div>
      {quality?.issues?.length ? <p className="issue-note">{quality.issues.length} quality issue(s) recorded.</p> : null}
    </section>
  );
}

function SignalPanel({ run }: { run: ScreeningRun }) {
  const factors = run.retinaguard?.contributing_factors ?? [];
  return (
    <section className="panel-card signal-card">
      <div className="panel-title-row">
        <div><div className="mini-label">SELF-CHECK</div><h2>RetinaGuard signals</h2></div>
        <StatusBadge tone={run.retinaguard ? 'teal' : 'neutral'}>{run.retinaguard ? 'Complete' : 'Unavailable'}</StatusBadge>
      </div>
      <div className="signal-list">
        {factors.slice(0, 8).map((factor) => (
          <div key={factor.factor}>
            <span>{factor.factor.replaceAll('_', ' ')}</span>
            <b>{factor.raw_value == null ? 'Not run' : `${Math.round(factor.score * 100)}%`}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function PipelineStatusPanel({ run }: { run: ScreeningRun }) {
  const rows = [
    { label: 'Primary screening', state: run.primary_status ?? (run.classification ? 'COMPLETED' : run.status), detail: 'Quality, classification, RetinaGuard and triage' },
    { label: 'DR classification', state: run.classification ? 'COMPLETED' : run.quality?.final?.quality_decision === 'UNGRADABLE' ? 'NOT_RUN' : 'PENDING', detail: run.classification?.model_version ?? 'No model output' },
    { label: 'RetinaGuard', state: run.retinaguard ? 'COMPLETED' : 'NOT_RUN', detail: run.retinaguard?.trust_category ?? 'No self-check output' },
    { label: 'Triage', state: run.triage ? 'COMPLETED' : 'PENDING', detail: run.triage?.recommendation ?? 'Pending' },
    { label: 'Lesion / vessel evidence', state: evidenceStageState(run, ['retinal_structure_analysis', 'lesion_detection']), detail: 'Optional supporting evidence' },
    { label: 'Grad-CAM / agreement', state: evidenceStageState(run, ['grad_cam', 'attention_lesion_agreement']), detail: 'Optional explainability evidence' },
  ];
  return (
    <section className="pipeline-card">
      <div className="section-heading">
        <div className="heading-icon teal"><Activity size={17} /></div>
        <div><span>PIPELINE</span><h2>Every stage, visible</h2></div>
        <StatusBadge tone={run.evidence_status === 'AVAILABLE' ? 'success' : run.evidence_status === 'PROCESSING' ? 'teal' : 'warning'}>
          {run.evidence_status === 'AVAILABLE' ? 'Evidence available' : run.evidence_status ?? 'Not run'}
        </StatusBadge>
      </div>
      <div className="pipeline-grid">
        {rows.map((row) => (
          <div className="pipeline-item" key={row.label}>
            <StageIcon state={row.state} />
            <div><b>{row.label}</b><span>{stageLabel(row.state)} · {row.detail}</span></div>
          </div>
        ))}
      </div>
      {run.evidence_status && run.evidence_status !== 'AVAILABLE' && run.classification && (
        <p className="muted-note">Optional evidence does not block the primary screening result and is never treated as negative evidence when unavailable.</p>
      )}
    </section>
  );
}

function EvidenceTile({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="evidence-tile">
      <div><Icon size={16} /><span>{label}</span></div>
      <b>{stageLabel(value)}</b>
    </div>
  );
}

function Toggle({ active, onClick, colour, children }: { active: boolean; onClick: () => void; colour: string; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`viewer-toggle ${active ? 'active' : ''}`}>
      <span className={`toggle-dot ${colour}`} /> {children}
    </button>
  );
}

function StageIcon({ state }: { state: string }) {
  if (state === 'COMPLETED') return <CheckCircle2 size={17} className="stage-ok" />;
  if (state === 'PROCESSING' || state === 'QUEUED') return <Clock3 size={17} className="stage-warn" />;
  if (state === 'TIMED_OUT' || state === 'UNAVAILABLE' || state === 'FAILED') return <XCircle size={17} className="stage-bad" />;
  return <AlertTriangle size={17} className="stage-muted" />;
}

function evidenceStageState(run: ScreeningRun, stages: string[]) {
  const values = stages.map((stage) => run.stage_status?.[stage] ?? 'PENDING');
  if (values.some((value) => value === 'PROCESSING' || value === 'QUEUED' || value === 'PENDING')) return 'PROCESSING';
  if (values.some((value) => value === 'TIMED_OUT')) return 'TIMED_OUT';
  if (values.some((value) => value === 'UNAVAILABLE' || value === 'FAILED')) return 'UNAVAILABLE';
  return 'COMPLETED';
}

function stageLabel(state: string) {
  return ({
    COMPLETED: 'Available',
    PROCESSING: 'Processing',
    QUEUED: 'Queued',
    PENDING: 'Pending',
    TIMED_OUT: 'Timed out',
    UNAVAILABLE: 'Unavailable',
    NOT_RUN: 'Not run',
    QUALITY_BLOCKED: 'Blocked by quality gate',
    FAILED: 'Failed safely',
  } as Record<string, string>)[state] ?? state;
}

function actionLabel(value?: string) {
  return ({
    AI_TRIAGE_MAY_PROCEED: 'AI triage may proceed',
    SPECIALIST_REVIEW_RECOMMENDED: 'Specialist review',
    HUMAN_REVIEW_REQUIRED: 'Human review',
    RECAPTURE_OR_SPECIALIST_REVIEW: 'Recapture / review',
    RECAPTURE_IMAGE: 'Recapture image',
  } as Record<string, string>)[value ?? ''] ?? 'Pending';
}

