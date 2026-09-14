import {
  AlertTriangle,
  ArrowRight,
  Check,
  FileCheck2,
  Info,
  LoaderCircle,
  RefreshCw,
  ScanEye,
  ShieldCheck,
  UploadCloud,
  UserRound,
  Activity,
} from 'lucide-react';
import { useState, type DragEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import {
  ApiRequestError,
  createPatient,
  getPatients,
  runScreening,
  uploadFundusImage,
  type ApiErrorCategory,
  type ScreeningRun,
} from '../services/api';
import "../styles/new-screening.css";

type FlowState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

const stages = [
  { key: 'validation', label: 'Validate image', short: 'IMAGE' },
  { key: 'quality', label: 'Assess quality', short: 'QUALITY' },
  { key: 'classification', label: 'Classify DR', short: 'DR AI' },
  { key: 'evidence', label: 'Analyze evidence', short: 'EVIDENCE' },
  { key: 'retinaguard', label: 'Run RetinaGuard', short: 'TRUST' },
  { key: 'triage', label: 'Prepare triage', short: 'TRIAGE' },
];

export function NewScreeningPage() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState<File | null>(null);
  const [patientId, setPatientId] = useState('');
  const [eye, setEye] = useState<'left' | 'right'>('right');
  const [state, setState] = useState<FlowState>('idle');
  const [imageId, setImageId] = useState<string | null>(null);
  const [run, setRun] = useState<ScreeningRun | null>(null);
  const [error, setError] = useState('');
  const [errorCategory, setErrorCategory] = useState<ApiErrorCategory | null>(null);
  const [dragging, setDragging] = useState(false);

  async function startScreening() {
    const identifier = patientId.trim();

    if (!selected || !identifier) return;

    if (identifier.length < 3) {
      setState('error');
      setErrorCategory('REQUEST_VALIDATION_FAILURE');
      setError('Patient identifier must be at least 3 characters.');
      return;
    }

    setError('');
    setErrorCategory(null);
    setRun(null);
    setImageId(null);
    setState('uploading');

    try {
      let patient: { id: string };

      try {
        patient = await createPatient({
          anonymized_identifier: identifier,
        });
      } catch (createError) {
        if (
          !(createError instanceof ApiRequestError) ||
          createError.status !== 409
        ) {
          throw createError;
        }

        const existing = await getPatients();
        const match = existing.find(
          (item) => item.anonymized_identifier === identifier,
        );

        if (!match) throw createError;
        patient = match;
      }

      const uploaded = await uploadFundusImage(patient.id, eye, selected);

      setImageId(uploaded.image_id);
      setState('processing');

      const result = await runScreening(uploaded.image_id);

      setRun(result);
      setState('complete');
    } catch (requestError) {
      setState('error');

      if (requestError instanceof ApiRequestError) {
        setErrorCategory(requestError.category);

        const details = requestError.validationErrors
          .map((item) => `${item.loc.join('.')} — ${item.msg}`)
          .join(' ');

        setError(
          details
            ? `${requestError.message} ${details}`
            : requestError.message,
        );
      } else {
        setErrorCategory('INTERNAL_SERVER_ERROR');
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'The screening pipeline could not process this image.',
        );
      }
    }
  }

  function chooseFile(file?: File) {
    if (!file) return;

    const isImage =
      file.type === 'image/jpeg' ||
      file.type === 'image/png';

    if (!isImage) {
      setState('error');
      setErrorCategory('REQUEST_VALIDATION_FAILURE');
      setError('Please select a JPEG or PNG retinal image.');
      return;
    }

    setSelected(file);
    setRun(null);
    setImageId(null);
    setError('');
    setErrorCategory(null);
    setState('idle');
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  const quality = run?.quality?.final as
    | {
        quality_decision?: string;
        quality_score?: number;
        recommended_action?: string;
        issues?: Array<{
          type: string;
          message: string;
          recommendation: string;
        }>;
      }
    | undefined;

  const blocked = quality?.quality_decision === 'UNGRADABLE';
  const progress = run
    ? runProgress(run)
    : state === 'processing'
      ? 2
      : state === 'uploading'
        ? 1
        : 0;

  const busy = state === 'uploading' || state === 'processing';
  const canRun = Boolean(selected && patientId.trim()) && !busy;

  return (
    <div className="screening-page">
      <div className="screening-orb screening-orb-one" />
      <div className="screening-orb screening-orb-two" />

      <header className="screening-topbar">
        <div>
          <div className="screening-kicker">
            <span className="live-dot" />
            CLINICAL AI WORKSPACE
          </div>
          <h1>
            New <span>Screening</span>
          </h1>
          <p>
            A controlled retinal assessment workflow built around
            image quality, explainability and clinical review.
          </p>
        </div>

        <div className="screening-top-actions">
          <div className="secure-badge">
            <ShieldCheck size={15} />
            Secure session
            <span />
          </div>
          <Link to="/history" className="glass-button">
            Screening history
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <section className="workflow-card">
        <div className="workflow-progress">
          <span
            style={{
              width: `${(progress / (stages.length - 1)) * 100}%`,
            }}
          />
        </div>

        {stages.map((stage, index) => {
          const completed = progress > index;
          const active = progress === index;

          return (
            <div
              className={`workflow-step ${active ? 'active' : ''} ${
                completed ? 'complete' : ''
              }`}
              key={stage.key}
            >
              <div className="workflow-number">
                {completed ? <Check size={13} /> : index + 1}
              </div>
              <div>
                <strong>{stage.short}</strong>
                <small>{stage.label}</small>
              </div>
            </div>
          );
        })}
      </section>

      <main className="screening-content">
        <section className="glass-card patient-card">
          <PanelHeading
            number="01"
            icon={<UserRound size={18} />}
            label="PATIENT CONTEXT"
            title="Anonymous patient record"
          />

          <p className="card-description">
            Use the identifier already assigned by the care team.
            No direct patient identifiers are required.
          </p>

          <div className="form-grid">
            <label className="floating-field">
              <span>Patient identifier</span>
              <input
                value={patientId}
                disabled={busy}
                onChange={(event) => setPatientId(event.target.value)}
                placeholder="RNX-2026-00129"
              />
              <small>Anonymized identifier · minimum 3 characters</small>
            </label>

            <div className="eye-field">
              <span>Eye being screened</span>
              <div className="eye-toggle">
                <button
                  type="button"
                  disabled={busy}
                  className={eye === 'right' ? 'selected' : ''}
                  onClick={() => setEye('right')}
                >
                  <b>OD</b>
                  Right eye
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className={eye === 'left' ? 'selected' : ''}
                  onClick={() => setEye('left')}
                >
                  <b>OS</b>
                  Left eye
                </button>
              </div>
            </div>
          </div>

          <div className="privacy-note">
            <ShieldCheck size={15} />
            <span>
              Identity remains outside the retinal image processing
              workflow.
            </span>
          </div>
        </section>

        <section className="glass-card upload-card">
          <PanelHeading
            number="02"
            icon={<ScanEye size={18} />}
            label="RETINAL IMAGE"
            title="Fundus image intake"
          />

          <p className="card-description">
            JPEG or PNG · the Image Trust Gate checks integrity,
            dimensions, channels and gradability before clinical AI.
          </p>

          <label
            className={`retina-dropzone ${selected ? 'selected' : ''} ${
              dragging ? 'dragging' : ''
            } ${state === 'processing' ? 'scanning' : ''}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input
              type="file"
              accept="image/jpeg,image/png"
              disabled={busy}
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />

            <div className="retina-visual">
              <div className="retina-ring ring-a" />
              <div className="retina-ring ring-b" />
              <div className="retina-ring ring-c" />
              <div className="retina-center">
                <ScanEye size={30} />
              </div>
              {state === 'processing' && <div className="scan-line" />}
            </div>

            <div className="upload-copy">
              <strong>
                {state === 'processing'
                  ? 'Analyzing retinal image'
                  : selected
                    ? selected.name
                    : 'Drop retinal image here'}
              </strong>

              <span>
                {state === 'processing'
                  ? 'The AI pipeline is evaluating the image'
                  : selected
                    ? `${formatBytes(selected.size)} · ${selected.type || 'image'}`
                    : 'or click anywhere to browse from this device'}
              </span>

              {!selected && (
                <em>
                  <UploadCloud size={14} />
                  JPEG / PNG · secure intake
                </em>
              )}
            </div>

            {selected && !busy && (
              <span className="change-image">
                Change image
              </span>
            )}
          </label>

          <div className="upload-trust-row">
            <span>
              <FileCheck2 size={14} />
              Integrity
            </span>
            <span>
              <ShieldCheck size={14} />
              Quality gate
            </span>
            <span>
              <Activity size={14} />
              AI ready
            </span>
          </div>
        </section>

        <section className="glass-card pipeline-card">
          <div className="pipeline-header">
            <div>
              <span className="section-label">03 · INTELLIGENCE ENGINE</span>
              <h2>AI screening pipeline</h2>
            </div>

            <div className="pipeline-status">
              <span />
              {state === 'processing'
                ? 'ANALYSIS ACTIVE'
                : state === 'complete'
                  ? 'ANALYSIS COMPLETE'
                  : 'STANDBY'}
            </div>
          </div>

          <div className="pipeline-visual">
            <div
              className="pipeline-fill"
              style={{
                width: `${(progress / (stages.length - 1)) * 100}%`,
              }}
            />

            {stages.map((stage, index) => {
              const completed = progress > index;
              const active = progress === index;

              return (
                <div
                  className={`pipeline-node ${completed ? 'complete' : ''} ${
                    active ? 'active' : ''
                  }`}
                  key={stage.key}
                >
                  <div className="pipeline-node-dot">
                    {completed ? (
                      <Check size={12} />
                    ) : active && busy ? (
                      <LoaderCircle
                        size={13}
                        className="spin"
                      />
                    ) : (
                      <span />
                    )}
                  </div>
                  <strong>{stage.short}</strong>
                  <small>{stage.label}</small>
                </div>
              );
            })}
          </div>

          <div className="pipeline-metrics">
            <PipelineMetric
              label="INPUT"
              value={selected ? 'Candidate ready' : 'Awaiting image'}
            />
            <PipelineMetric
              label="MODEL"
              value="Registered artifact"
            />
            <PipelineMetric
              label="OUTPUT"
              value={
                run
                  ? blocked
                    ? 'Recapture'
                    : 'Clinical recommendation'
                  : 'Pending analysis'
              }
            />
          </div>

          <div className="run-area">
            {run && imageId ? (
              <button
                type="button"
                className="run-button result-button"
                onClick={() =>
                  navigate('/screening/results', {
                    state: {
                      screeningId: run.screening_id,
                      imageId,
                      run,
                    },
                  })
                }
              >
                Open screening result
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                type="button"
                className="run-button"
                disabled={!canRun}
                onClick={startScreening}
              >
                {busy ? (
                  <>
                    <LoaderCircle size={17} className="spin" />
                    {state === 'uploading'
                      ? 'Securing image...'
                      : 'Running AI screening...'}
                  </>
                ) : (
                  <>
                    Run secure screening
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            )}

            <span>
              AI output is a screening recommendation. Clinical
              review remains authoritative.
            </span>
          </div>
        </section>

        {state === 'error' && (
          <section className="glass-card error-card" role="alert">
            <div className="error-icon">
              <AlertTriangle size={19} />
            </div>

            <div className="error-content">
              <span>PIPELINE INTERRUPTION</span>
              <h2>Screening could not be completed</h2>
              <p>{error}</p>
              <small>{failureGuidance(errorCategory)}</small>
            </div>

            <button
              type="button"
              className="retry-button"
              onClick={() => {
                setState('idle');
                setError('');
                setErrorCategory(null);
              }}
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </section>
        )}

        {run && <RunSummary run={run} imageId={imageId} />}

        <section className="safety-grid">
          <SafetyCard
            number="01"
            title="Quality before AI"
            detail="The Image Trust Gate blocks ungradable inputs before clinical AI output."
            icon={<FileCheck2 size={17} />}
          />
          <SafetyCard
            number="02"
            title="Evidence alongside grade"
            detail="Structures and lesions remain separate supporting evidence for verification."
            icon={<ScanEye size={17} />}
          />
          <SafetyCard
            number="03"
            title="Human review when needed"
            detail="RetinaGuard makes uncertainty visible to the care team."
            icon={<ShieldCheck size={17} />}
          />
        </section>

        <div className="screening-disclaimer">
          <Info size={14} />
          Ungradable images stop before clinical AI and receive
          recapture guidance.
        </div>
      </main>
    </div>
  );
}

function PanelHeading({
  number,
  icon,
  label,
  title,
}: {
  number: string;
  icon: ReactNode;
  label: string;
  title: string;
}) {
  return (
    <div className="panel-heading">
      <div className="panel-number">{number}</div>
      <div className="panel-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function PipelineMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SafetyCard({
  number,
  title,
  detail,
  icon,
}: {
  number: string;
  title: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="safety-card">
      <div className="safety-top">
        <span>{number}</span>
        <div>{icon}</div>
      </div>
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  );
}

function RunSummary({
  run,
  imageId,
}: {
  run: ScreeningRun;
  imageId: string | null;
}) {
  const quality = run.quality?.final as
    | {
        quality_decision?: string;
        quality_score?: number;
        recommended_action?: string;
        issues?: Array<{
          type: string;
          message: string;
          recommendation: string;
        }>;
      }
    | undefined;

  const blocked = quality?.quality_decision === 'UNGRADABLE';
  const primaryComplete =
    run.primary_status === 'COMPLETED' ||
    Boolean(run.classification && run.triage);

  return (
    <section
      className={`glass-card result-card ${
        run.status === 'FAILED'
          ? 'danger'
          : blocked
            ? 'warning'
            : 'success'
      }`}
    >
      <div className="result-heading">
        <div>
          <span>04 · PIPELINE RESULT</span>
          <h2>
            {run.status === 'FAILED'
              ? 'Run failed safely'
              : blocked
                ? 'Recapture recommended'
                : primaryComplete
                  ? 'Primary screening complete'
                  : 'Screening pipeline in progress'}
          </h2>
          <p>{run.message}</p>
        </div>

        <StatusBadge
          tone={
            run.status === 'FAILED'
              ? 'danger'
              : blocked
                ? 'warning'
                : 'success'
          }
        >
          {run.status}
        </StatusBadge>
      </div>

      {run.error && (
        <div className="result-error">
          Stage <strong>{run.error.stage}</strong>:{' '}
          {run.error.message}
        </div>
      )}

      {quality && (
        <div className="result-metrics">
          <ResultMetric
            label="Quality"
            value={`${quality.quality_decision ?? '—'} · ${Math.round(
              (quality.quality_score ?? 0) * 100,
            )}%`}
          />
          <ResultMetric
            label="Image"
            value={imageId ? 'Stored securely' : 'Unavailable'}
          />
          <ResultMetric
            label="Evidence"
            value={
              run.evidence_status === 'AVAILABLE'
                ? 'Available'
                : run.evidence_status === 'PROCESSING'
                  ? 'Processing'
                  : run.evidence_status ?? 'Not run'
            }
          />
          <ResultMetric
            label="Next action"
            value={
              blocked
                ? 'Recapture image'
                : run.triage?.recommendation ?? 'Review result'
            }
          />
        </div>
      )}

      {blocked && quality?.issues && quality.issues.length > 0 && (
        <div className="quality-issues">
          {quality.issues.map((issue) => (
            <div className="quality-issue" key={issue.type}>
              <strong>{issue.type.replaceAll('_', ' ')}</strong>
              <span>{issue.message}</span>
              <em>{issue.recommendation}</em>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ResultMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="result-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function runProgress(run: ScreeningRun) {
  const completed = Object.values(run.stage_status).filter(
    (value) => value === 'COMPLETED',
  ).length;

  return Math.min(5, Math.max(1, completed));
}

function failureGuidance(category: ApiErrorCategory | null) {
  switch (category) {
    case 'REQUEST_VALIDATION_FAILURE':
      return 'REQUEST_VALIDATION_FAILURE · Correct the input and retry.';
    case 'API_CONNECTION_FAILURE':
      return 'API_CONNECTION_FAILURE · No clinical prediction was created because the backend could not be reached.';
    case 'MODEL_UNAVAILABLE':
      return 'MODEL_UNAVAILABLE · A registered model artifact was unavailable; no prediction was created.';
    case 'INFERENCE_FAILURE':
      return 'INFERENCE_FAILURE · Inference failed safely; no prediction was created.';
    case 'QUALITY_GATE_REJECTION':
      return 'QUALITY_GATE_REJECTION · Follow the image recapture guidance before continuing.';
    case 'INTERNAL_SERVER_ERROR':
      return 'INTERNAL_SERVER_ERROR · The backend reported an internal failure before a result could be rendered.';
    default:
      return 'No clinical prediction was created. Review the request status and retry when the issue is resolved.';
  }
}
