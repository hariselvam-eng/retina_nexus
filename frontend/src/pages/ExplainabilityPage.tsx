import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  Info,
  LoaderCircle,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import {
  explainImage,
  imageContentUrl,
  type ExplainabilityResult,
  type ScreeningRun,
} from '../services/api';
import '../styles/explainability.css';

type NavigationState = {
  imageId?: string;
  screeningSessionId?: string;
  run?: ScreeningRun;
};

export function ExplainabilityPage() {
  const location = useLocation();
  const navigation = (location.state as NavigationState | null) ?? null;
  const imageId = navigation?.imageId ?? navigation?.run?.image_id;

  const [explanation, setExplanation] = useState<ExplainabilityResult | null>(
    navigation?.run?.explainability ?? null,
  );
  const [loading, setLoading] = useState(Boolean(imageId));
  const [error, setError] = useState('');
  const [runStability, setRunStability] = useState(false);
  const [runCounterfactual, setRunCounterfactual] = useState(false);
  const [visible, setVisible] = useState({
    gradCam: true,
    lesions: true,
    other: false,
  });
  const [opacity, setOpacity] = useState(0.78);

  useEffect(() => {
    let active = true;

    if (
      !imageId ||
      (navigation?.run?.explainability && !runStability && !runCounterfactual)
    ) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError('');

    explainImage(
      imageId,
      navigation?.screeningSessionId,
      runStability,
      runCounterfactual,
    )
      .then((result) => {
        if (active) setExplanation(result);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Explainability is unavailable.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [imageId, navigation?.screeningSessionId, runStability, runCounterfactual]);

  const agreementScore = explanation?.attention_lesion_agreement.score;
  const stability = explanation?.explanation_stability;
  const counterfactual = explanation?.counterfactual;

  return (
    <div className="explain-page">
      <div className="explain-orb explain-orb-one" />
      <div className="explain-orb explain-orb-two" />

      <header className="explain-topbar glass-panel">
        <div className="explain-heading">
          <Link
            to="/screening/results"
            state={{ imageId }}
            aria-label="Back to screening result"
            className="icon-button"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <div className="eyebrow-row">
              <span className="live-pulse" />
              SCREENING / EVIDENCE VERIFICATION
            </div>
            <h1>Explainability</h1>
          </div>
        </div>

        <div className="explain-actions">
          <label className="control-chip">
            <input
              type="checkbox"
              checked={runStability}
              onChange={(event) => setRunStability(event.target.checked)}
            />
            <Zap size={14} />
            Stability test
          </label>

          <label className="control-chip">
            <input
              type="checkbox"
              checked={runCounterfactual}
              onChange={(event) => setRunCounterfactual(event.target.checked)}
            />
            <Target size={14} />
            Counterfactual
          </label>
        </div>
      </header>

      <section className="boundary-banner">
        <div className="banner-icon">
          <CircleAlert size={17} />
        </div>
        <div>
          <strong>Engineering diagnostics, not clinical causality.</strong>
          <p>
            Grad-CAM, attention agreement, stability and counterfactual outputs
            help inspect model behaviour. They do not prove clinical causality
            or provide a clinical trust guarantee.
          </p>
        </div>
      </section>

      {!imageId && (
        <div className="empty-explain glass-panel">
          <Sparkles size={28} />
          <p className="eyebrow">No image selected</p>
          <h2>Open Explainability from a completed screening</h2>
        </div>
      )}

      {error && (
        <div className="explain-error glass-panel">
          <CircleAlert size={18} />
          <div>
            <strong>Explainability unavailable</strong>
            <p>{error}</p>
            <span>
              Configure a compatible classifier artifact before generating
              model-linked Grad-CAM.
            </span>
          </div>
        </div>
      )}

      {imageId && (
        <main className="explain-grid">
          <section className="explain-main">
            <div className="hero-explain-card glass-panel">
              <div className="card-header">
                <div>
                  <span className="eyebrow">ATTENTION MAP</span>
                  <h2>Evidence-linked visual explanation</h2>
                  <p>
                    Compare model attention with retinal evidence regions in
                    the original fundus image.
                  </p>
                </div>

                {loading ? (
                  <StatusBadge tone="teal">
                    <LoaderCircle size={13} className="animate-spin" />
                    Generating
                  </StatusBadge>
                ) : explanation ? (
                  <StatusBadge tone="success">Model-linked Grad-CAM</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">Not available</StatusBadge>
                )}
              </div>

              <div className="image-stage">
                <div className="image-glow" />
                <img
                  src={imageContentUrl(imageId)}
                  alt="Original fundus image"
                  className="fundus-image"
                />

                {visible.gradCam &&
                  explanation?.grad_cam.heatmap_data_uri && (
                    <img
                      src={explanation.grad_cam.heatmap_data_uri}
                      alt="Grad-CAM heatmap overlay"
                      className="overlay-image"
                      style={{ opacity }}
                    />
                  )}

                {visible.lesions &&
                  explanation?.lesion_evidence_map_data_uri && (
                    <img
                      src={explanation.lesion_evidence_map_data_uri}
                      alt="Lesion evidence overlay"
                      className="overlay-image"
                      style={{ opacity: opacity * 0.8 }}
                    />
                  )}

                {visible.other &&
                  counterfactual?.masked_region_data_uri && (
                    <img
                      src={counterfactual.masked_region_data_uri}
                      alt="Counterfactual masked region"
                      className="overlay-image"
                      style={{ opacity: 0.7 }}
                    />
                  )}

                <div className="image-label">
                  <span className="image-label-dot" />
                  ORIGINAL FUNDUS
                </div>

                <div className="analysis-badge">
                  <Sparkles size={13} />
                  AI ATTENTION
                </div>
              </div>

              <div className="viewer-controls">
                <Toggle
                  active={visible.gradCam}
                  onClick={() =>
                    setVisible((current) => ({
                      ...current,
                      gradCam: !current.gradCam,
                    }))
                  }
                  colour="grad"
                  icon={visible.gradCam ? Eye : EyeOff}
                >
                  Grad-CAM
                </Toggle>

                <Toggle
                  active={visible.lesions}
                  onClick={() =>
                    setVisible((current) => ({
                      ...current,
                      lesions: !current.lesions,
                    }))
                  }
                  colour="lesion"
                  icon={visible.lesions ? Eye : EyeOff}
                >
                  Lesion evidence
                </Toggle>

                <Toggle
                  active={visible.other}
                  onClick={() =>
                    setVisible((current) => ({
                      ...current,
                      other: !current.other,
                    }))
                  }
                  colour="other"
                  icon={visible.other ? Eye : EyeOff}
                />

                <div className="opacity-control">
                  <SlidersHorizontal size={14} />
                  <span>Opacity</span>
                  <input
                    aria-label="Explainability overlay opacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(event) =>
                      setOpacity(Number(event.target.value))
                    }
                  />
                  <strong>{Math.round(opacity * 100)}%</strong>
                </div>
              </div>

              {explanation && (
                <div className="target-strip">
                  <Info size={14} />
                  <span>
                    Target class <strong>{explanation.predicted_class_label}</strong>
                  </span>
                  <span className="target-separator">•</span>
                  <span>
                    Spatial layer <strong>{explanation.grad_cam.target_layer}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="agreement-card glass-panel">
              <div className="section-heading">
                <div className="section-icon">
                  <Sparkles size={17} />
                </div>
                <div>
                  <span className="eyebrow">EVIDENCE VERIFICATION</span>
                  <h2>Attention ↔ lesion agreement</h2>
                </div>
              </div>

              <div className="agreement-layout">
                <div className="agreement-score">
                  <div className="score-ring">
                    <span>
                      {agreementScore == null
                        ? '—'
                        : `${Math.round(agreementScore * 100)}%`}
                    </span>
                  </div>
                  <div>
                    <p>Engineering overlap score</p>
                    <StatusBadge
                      tone={agreementTone(
                        explanation?.attention_lesion_agreement.status,
                      )}
                    >
                      {explanation?.attention_lesion_agreement.status ?? 'Pending'}
                    </StatusBadge>
                  </div>
                </div>

                {explanation && (
                  <div className="metric-strip">
                    {[
                      [
                        'IoU',
                        explanation.attention_lesion_agreement.metrics
                          .intersection_over_union,
                      ],
                      [
                        'Dice',
                        explanation.attention_lesion_agreement.metrics.dice,
                      ],
                      [
                        'Attention in lesion',
                        explanation.attention_lesion_agreement.metrics
                          .attention_in_lesion,
                      ],
                    ].map(([label, value]) => (
                      <div className="mini-metric" key={String(label)}>
                        <span>{label}</span>
                        <strong>
                          {value == null
                            ? 'Unavailable'
                            : `${Math.round(Number(value) * 100)}%`}
                        </strong>
                        <div className="mini-bar">
                          <i
                            style={{
                              width:
                                value == null
                                  ? '0%'
                                  : `${Math.min(Number(value) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="reason-text">
                {explanation?.attention_lesion_agreement.reason ??
                  'Agreement will be calculated from classifier attention and retinal evidence regions.'}
              </p>
            </div>
          </section>

          <aside className="explain-side">
            <div className="prediction-card glass-panel">
              <div className="prediction-top">
                <span className="eyebrow">CLASSIFICATION TARGET</span>
                <div className="verified-icon">
                  <ShieldCheck size={16} />
                </div>
              </div>

              <h2>
                {explanation?.predicted_class_label ??
                  (loading ? 'Analyzing' : 'Unavailable')}
              </h2>

              <div className="prediction-meta">
                <Metric
                  label="Level"
                  value={explanation ? String(explanation.predicted_class) : '—'}
                />
                <Metric
                  label="Model"
                  value={explanation?.model_version ?? '—'}
                />
              </div>

              <div className="prediction-note">
                <Info size={14} />
                <span>
                  Grad-CAM is generated for the predicted class from the
                  registered DR classifier artifact.
                </span>
              </div>
            </div>

            <DiagnosticCard
              title="Explanation stability"
              eyebrow="CONTROLLED PERTURBATIONS"
              icon={<Zap size={16} />}
              rows={[
                ['Status', stability?.status ?? 'Pending'],
                [
                  'Prediction stability',
                  stability?.prediction_stability == null
                    ? 'Not run'
                    : `${Math.round(stability.prediction_stability * 100)}%`,
                ],
                [
                  'Grad-CAM stability',
                  stability?.grad_cam_stability == null
                    ? 'Not run'
                    : `${Math.round(stability.grad_cam_stability * 100)}%`,
                ],
              ]}
              note={
                stability?.reason ??
                stability?.note ??
                'Disabled by default to keep real-time screening lightweight.'
              }
            />

            <DiagnosticCard
              title="Suspicious-region masking"
              eyebrow="COUNTERFACTUAL"
              icon={<Target size={16} />}
              rows={[
                ['Status', counterfactual?.status ?? 'Pending'],
                [
                  'Selected region',
                  counterfactual?.selected_region?.replaceAll('_', ' ') ??
                    'Not run',
                ],
                [
                  'Grade changed',
                  counterfactual?.predicted_grade_changed == null
                    ? 'Not run'
                    : counterfactual.predicted_grade_changed
                      ? 'Yes'
                      : 'No',
                ],
              ]}
              note={
                counterfactual?.reason ??
                counterfactual?.note ??
                'Experimental and disabled by default.'
              }
            />
          </aside>
        </main>
      )}
    </div>
  );
}

function Toggle({
  active,
  onClick,
  colour,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  colour: 'grad' | 'lesion' | 'other';
  icon: typeof Eye;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`viewer-toggle ${active ? 'active' : ''}`}
    >
      <span className={`toggle-dot ${colour}`} />
      <Icon size={13} />
      {children ?? 'Other evidence'}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="prediction-metric">
      <span>{label}</span>
      <strong title={value}>{value}</strong>
    </div>
  );
}

function DiagnosticCard({
  title,
  eyebrow,
  icon,
  rows,
  note,
}: {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  rows: [string, string][];
  note: string;
}) {
  return (
    <div className="diagnostic-card glass-panel">
      <div className="section-heading compact">
        <div className="section-icon small">{icon}</div>
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="diagnostic-rows">
        {rows.map(([label, value]) => (
          <div className="diagnostic-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <p className="diagnostic-note">{note}</p>
    </div>
  );
}

function agreementTone(
  status?: string,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'HIGH AGREEMENT') return 'success';
  if (status === 'MODERATE AGREEMENT') return 'warning';
  if (status === 'LOW AGREEMENT') return 'danger';
  return 'neutral';
}
