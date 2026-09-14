import {
  AlertTriangle,
  Check,
  ChevronRight,
  ClipboardCheck,
  Eye,
  FileText,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  ScanEye,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { DataState, EmptyState, ErrorState } from '../components/DataState';
import { StatusBadge } from '../components/StatusBadge';
import {
  getReviewQueue,
  getScreeningRun,
  submitReview,
  imageContentUrl,
  type ReviewQueueItem,
  type ScreeningRun,
} from '../services/api';

import '../styles/review.css';

type ReviewDecision = 'approve' | 'modify' | 'reject' | 'request_recapture';

type ReviewNavigation = {
  screeningId?: string;
};

export function ReviewPage() {
  const location = useLocation();

  const navigation =
    (location.state as ReviewNavigation | null) ?? null;

  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [selectedId, setSelectedId] = useState(
    navigation?.screeningId ?? ''
  );

  const [run, setRun] = useState<ScreeningRun | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState('');

  const [decision, setDecision] =
    useState<ReviewDecision>('approve');

  const [modifiedGrade, setModifiedGrade] =
    useState('2');

  const [comments, setComments] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');

  function loadQueue() {
    setLoading(true);
    setError('');

    getReviewQueue()
      .then((items) => {
        setQueue(items);

        if (!selectedId && items[0]) {
          setSelectedId(items[0].session_id);
        }
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load the clinical review queue.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadQueue();
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    setDetailLoading(true);
    setError('');

    getScreeningRun(selectedId)
      .then(setRun)
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load the selected screening.'
        );
      })
      .finally(() => {
        setDetailLoading(false);
      });
  }, [selectedId]);

  const selected = useMemo(
    () =>
      queue.find(
        (item) => item.session_id === selectedId
      ),
    [queue, selectedId]
  );

  async function saveReview() {
    if (!selectedId) return;

    setSaving(true);
    setSaved('');
    setError('');

    try {
      await submitReview(selectedId, {
        decision,
        modified_grade:
          decision === 'modify'
            ? Number(modifiedGrade)
            : undefined,
        comments:
          comments.trim() || undefined,
      });

      setSaved(
        'Clinical decision recorded successfully in the audit trail.'
      );

      await loadQueue();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to save the clinician decision.'
      );
    } finally {
      setSaving(false);
    }
  }

  const openCases = queue.filter(
    (item) => item.status === 'open'
  ).length;

  return (
    <div className="review-page">
      {/* HEADER */}

      <div className="review-hero">
        <div>
          <div className="review-eyebrow">
            <span className="pulse-dot" />
            HUMAN-IN-THE-LOOP CLINICAL AI
          </div>

          <h1>Clinical Review</h1>

          <p>
            Validate AI findings, inspect retinal evidence and
            record the final clinical decision.
          </p>
        </div>

        <div className="review-header-actions">
          <div className="queue-counter">
            <div className="queue-counter-icon">
              <ClipboardCheck size={17} />
            </div>

            <div>
              <span>OPEN CASES</span>
              <strong>{openCases}</strong>
            </div>
          </div>

          <button
            onClick={loadQueue}
            className="review-refresh"
            disabled={loading}
          >
            <RefreshCw
              size={15}
              className={loading ? 'spin' : ''}
            />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <DataState label="Loading clinical review queue" />
      ) : error && queue.length === 0 ? (
        <ErrorState
          message={error}
          onRetry={loadQueue}
        />
      ) : (
        <div className="review-layout">

          {/* LEFT QUEUE */}

          <ReviewQueue
            queue={queue}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setRun(null);
              setSaved('');
              setError('');
            }}
          />

          {/* MAIN */}

          <main className="review-main">

            {detailLoading ? (
              <DataState label="Loading screening evidence" />
            ) : !selected || !run ? (
              <div className="review-empty">
                <div className="review-empty-icon">
                  <ScanEye size={28} />
                </div>

                <h2>Select a case</h2>

                <p>
                  Choose a case from the review queue to
                  inspect the AI result and supporting evidence.
                </p>
              </div>
            ) : (
              <ReviewDetail
                item={selected}
                run={run}
                decision={decision}
                setDecision={setDecision}
                modifiedGrade={modifiedGrade}
                setModifiedGrade={setModifiedGrade}
                comments={comments}
                setComments={setComments}
                saving={saving}
                saved={saved}
                error={error}
                onSave={saveReview}
              />
            )}

          </main>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   REVIEW QUEUE
========================================================= */

function ReviewQueue({
  queue,
  selectedId,
  onSelect,
}: {
  queue: ReviewQueueItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="review-queue">

      <div className="queue-header">
        <div>
          <div className="queue-label">
            ACTIVE WORKLIST
          </div>

          <h2>Cases for review</h2>
        </div>

        <span className="queue-count">
          {queue.filter(
            (item) => item.status === 'open'
          ).length}
        </span>
      </div>

      {queue.length === 0 ? (
        <div className="queue-empty">
          <div className="queue-empty-icon">
            <Check size={22} />
          </div>

          <strong>Queue is clear</strong>

          <span>
            No completed screening currently requires
            clinician review.
          </span>
        </div>
      ) : (
        <div className="queue-list">

          {queue.map((item, index) => {
            const selected =
              selectedId === item.session_id;

            const urgent =
              item.referable_dr ||
              item.trust_category === 'UNRELIABLE';

            return (
              <button
                key={item.session_id}
                onClick={() =>
                  onSelect(item.session_id)
                }
                className={`queue-item ${
                  selected ? 'selected' : ''
                }`}
                style={{
                  animationDelay: `${index * 70}ms`,
                }}
              >

                <div className="queue-item-top">

                  <div
                    className={`case-icon ${
                      urgent ? 'urgent' : ''
                    }`}
                  >
                    <ScanEye size={16} />
                  </div>

                  <div className="case-meta">
                    <strong>
                      {shortId(item.session_id)}
                    </strong>

                    <span>
                      {shortId(item.patient_id)} ·{' '}
                      {item.eye.toUpperCase()}
                    </span>
                  </div>

                  <ChevronRight
                    size={15}
                    className="queue-arrow"
                  />
                </div>

                <div className="queue-item-reason">
                  {item.reason}
                </div>

                <div className="queue-item-bottom">

                  <span
                    className={
                      item.referable_dr
                        ? 'referable-text'
                        : ''
                    }
                  >
                    {item.predicted_grade_label ??
                      'No AI grade'}
                  </span>

                  {item.referable_dr && (
                    <span className="referable-pill">
                      REFERABLE
                    </span>
                  )}

                </div>

                <div className="queue-status">
                  <StatusBadge
                    tone={
                      item.trust_category ===
                      'UNRELIABLE'
                        ? 'danger'
                        : item.status ===
                          'reviewed'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {item.status === 'reviewed'
                      ? 'Reviewed'
                      : item.trust_category ??
                        'Review'}
                  </StatusBadge>
                </div>

              </button>
            );
          })}

        </div>
      )}
    </aside>
  );
}


/* =========================================================
   DETAIL
========================================================= */

function ReviewDetail({
  item,
  run,
  decision,
  setDecision,
  modifiedGrade,
  setModifiedGrade,
  comments,
  setComments,
  saving,
  saved,
  error,
  onSave,
}: {
  item: ReviewQueueItem;
  run: ScreeningRun;
  decision: ReviewDecision;
  setDecision: (value: ReviewDecision) => void;
  modifiedGrade: string;
  setModifiedGrade: (value: string) => void;
  comments: string;
  setComments: (value: string) => void;
  saving: boolean;
  saved: string;
  error: string;
  onSave: () => void;
}) {
  const [overlay, setOverlay] = useState(true);

  const classification = run.classification;
  const trust = run.retinaguard;

  const heatmap =
    run.explainability?.grad_cam
      ?.overlay_data_uri;

  const lesion =
    run.explainability
      ?.lesion_evidence_map_data_uri;

  const confidence = classification
    ? Math.round(
        classification.raw_confidence * 100
      )
    : 0;

  const trustScore = trust
    ? Math.round(trust.trust_score * 100)
    : 0;

  return (
    <div className="detail-stack">

      {/* CASE BAR */}

      <section className="case-bar glass-panel">

        <div className="case-bar-left">

          <div className="case-badge">
            <ScanEye size={17} />
          </div>

          <div>
            <span>SCREENING CASE</span>

            <h2>
              {shortId(item.session_id)}
            </h2>
          </div>

          <div className="case-divider" />

          <div className="case-info">
            <span>PATIENT</span>
            <strong>
              {shortId(item.patient_id)}
            </strong>
          </div>

          <div className="case-info">
            <span>EYE</span>
            <strong>
              {item.eye.toUpperCase()}
            </strong>
          </div>

        </div>

        <div className="case-live">
          <span className="pulse-dot" />
          LIVE REVIEW
        </div>

      </section>


      {/* ANALYSIS GRID */}

      <section className="analysis-grid">

        {/* IMAGE */}

        <div className="retina-panel glass-panel">

          <div className="panel-heading">

            <div>
              <span className="panel-kicker">
                RETINAL ANALYSIS
              </span>

              <h3>Evidence viewer</h3>
            </div>

            <div className="evidence-toggle">
              <button
                onClick={() =>
                  setOverlay(false)
                }
                className={
                  !overlay ? 'active' : ''
                }
              >
                Original
              </button>

              <button
                onClick={() =>
                  setOverlay(true)
                }
                className={
                  overlay ? 'active' : ''
                }
              >
                <Sparkles size={13} />
                Evidence
              </button>
            </div>

          </div>

          <div className="retina-viewer">

            <div className="scan-line" />

            <img
              src={imageContentUrl(
                item.image_id
              )}
              alt="Fundus image for clinical review"
              className="retina-image"
            />

            {overlay && heatmap && (
              <img
                src={heatmap}
                alt="Grad-CAM evidence overlay"
                className="retina-overlay heatmap"
              />
            )}

            {overlay && lesion && (
              <img
                src={lesion}
                alt="Lesion evidence overlay"
                className="retina-overlay lesion"
              />
            )}

            <div className="viewer-top-left">
              <Eye size={13} />
              {overlay
                ? 'AI EVIDENCE ACTIVE'
                : 'ORIGINAL IMAGE'}
            </div>

            <div className="viewer-bottom">

              <div>
                <span>IMAGE ID</span>
                <strong>
                  {shortId(item.image_id)}
                </strong>
              </div>

              <div>
                <span>VIEW</span>
                <strong>
                  {item.eye.toUpperCase()}
                </strong>
              </div>

            </div>

          </div>

          <div className="evidence-legend">

            <div>
              <span className="legend-dot heat" />
              Grad-CAM attention
            </div>

            <div>
              <span className="legend-dot lesion" />
              Lesion evidence
            </div>

            <span className="legend-note">
              Evidence is supportive, not diagnostic.
            </span>

          </div>

        </div>


        {/* AI INSIGHT */}

        <aside className="insight-panel glass-panel">

          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                AI INSIGHT
              </span>

              <h3>Model assessment</h3>
            </div>

            <div className="ai-chip">
              <Zap size={13} />
              AI
            </div>
          </div>

          <div className="ai-result">

            <span>AI RECOMMENDATION</span>

            <h2>
              {classification?.predicted_grade_label ??
                'No grade returned'}
            </h2>

            <div
              className={`result-state ${
                classification?.referable_dr
                  ? 'danger'
                  : 'safe'
              }`}
            >
              <span />
              {classification?.referable_dr
                ? 'Referable signal detected'
                : 'No referable DR detected'}
            </div>

          </div>

          <ScoreMeter
            label="Model confidence"
            value={confidence}
            suffix="%"
          />

          <ScoreMeter
            label="RetinaGuard trust"
            value={trustScore}
            suffix="/100"
          />

          <div className="insight-grid">

            <InsightStat
              label="AI grade"
              value={
                classification?.predicted_grade_label ??
                '—'
              }
            />

            <InsightStat
              label="Referable DR"
              value={
                classification
                  ? classification.referable_dr
                    ? 'YES'
                    : 'NO'
                  : '—'
              }
              danger={
                classification?.referable_dr
              }
            />

          </div>

          <div className="model-disclaimer">
            <ShieldCheck size={15} />

            <p>
              AI output is a recommendation only.
              Final clinical interpretation remains
              with the reviewing clinician.
            </p>
          </div>

        </aside>

      </section>


      {/* TRUST FACTORS */}

      <section className="trust-panel glass-panel">

        <div className="panel-heading">

          <div>
            <span className="panel-kicker">
              MODEL RELIABILITY
            </span>

            <h3>Trust factors</h3>
          </div>

          <div className="trust-score">
            <ShieldCheck size={15} />
            {trustScore}/100
          </div>

        </div>

        <div className="trust-grid">

          {(trust?.contributing_factors ?? [])
            .slice(0, 6)
            .map((factor) => {

              const score =
                Math.round(
                  factor.score * 100
                );

              return (
                <div
                  key={factor.factor}
                  className="trust-factor"
                >

                  <div className="trust-factor-top">

                    <span>
                      {factor.factor.replaceAll(
                        '_',
                        ' '
                      )}
                    </span>

                    <strong>
                      {factor.raw_value == null
                        ? 'N/A'
                        : `${score}%`}
                    </strong>

                  </div>

                  <div className="mini-bar">
                    <span
                      style={{
                        width:
                          factor.raw_value ==
                          null
                            ? '0%'
                            : `${score}%`,
                      }}
                    />
                  </div>

                </div>
              );
            })}

        </div>

      </section>


      {/* DECISION */}

      <section className="decision-panel glass-panel">

        <div className="decision-heading">

          <div className="decision-icon">
            <UserRound size={19} />
          </div>

          <div>
            <span className="panel-kicker">
              HUMAN OVERSIGHT
            </span>

            <h3>Final clinical decision</h3>

            <p>
              Record the care team's interpretation
              separately from the AI recommendation.
            </p>
          </div>

        </div>


        {/* DECISION OPTIONS */}

        <div className="decision-options">

          <DecisionButton
            active={decision === 'approve'}
            onClick={() =>
              setDecision('approve')
            }
            icon={<Check size={18} />}
            title="Approve"
            description="Accept AI recommendation"
            variant="approve"
          />

          <DecisionButton
            active={decision === 'modify'}
            onClick={() =>
              setDecision('modify')
            }
            icon={<RotateCcw size={18} />}
            title="Modify grade"
            description="Override AI grade"
            variant="modify"
          />

          <DecisionButton
            active={
              decision ===
              'request_recapture'
            }
            onClick={() =>
              setDecision(
                'request_recapture'
              )
            }
            icon={<RefreshCw size={18} />}
            title="Recapture"
            description="Request new image"
            variant="recapture"
          />

          <DecisionButton
            active={decision === 'reject'}
            onClick={() =>
              setDecision('reject')
            }
            icon={<X size={18} />}
            title="Reject"
            description="Reject AI output"
            variant="reject"
          />

        </div>


        {/* MODIFIED GRADE */}

        {decision === 'modify' && (
          <div className="modify-grade">

            <label>
              Modified DR grade
            </label>

            <select
              value={modifiedGrade}
              onChange={(event) =>
                setModifiedGrade(
                  event.target.value
                )
              }
            >
              <option value="0">
                0 · No DR
              </option>

              <option value="1">
                1 · Mild
              </option>

              <option value="2">
                2 · Moderate
              </option>

              <option value="3">
                3 · Severe
              </option>

              <option value="4">
                4 · Proliferative DR
              </option>
            </select>

          </div>
        )}


        {/* NOTES */}

        <div className="clinical-notes">

          <label>
            <MessageSquare size={15} />
            Clinical notes
          </label>

          <textarea
            value={comments}
            onChange={(event) =>
              setComments(
                event.target.value
              )
            }
            rows={4}
            placeholder="Add clinical context, observations or rationale for the care team…"
          />

        </div>


        {/* ERROR */}

        {error && (
          <div className="review-alert error">
            <AlertTriangle size={16} />

            <span>{error}</span>
          </div>
        )}


        {/* SUCCESS */}

        {saved && (
          <div className="review-alert success">
            <Check size={16} />

            <span>{saved}</span>
          </div>
        )}


        {/* SAVE */}

        <div className="decision-footer">

          <div className="audit-note">
            <ShieldCheck size={15} />

            <span>
              Decision will be added to the audit trail.
            </span>
          </div>

          <button
            onClick={onSave}
            disabled={saving}
            className="save-decision"
          >
            {saving ? (
              <LoaderCircle
                size={16}
                className="spin"
              />
            ) : (
              <ClipboardCheck size={16} />
            )}

            {saving
              ? 'Saving decision…'
              : 'Save final decision'}

          </button>

        </div>

      </section>

    </div>
  );
}


/* =========================================================
   COMPONENTS
========================================================= */

function ScoreMeter({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="score-meter">

      <div className="score-top">
        <span>{label}</span>

        <strong>
          {value}
          {suffix}
        </strong>
      </div>

      <div className="score-track">
        <span
          style={{
            width: `${Math.max(
              0,
              Math.min(value, 100)
            )}%`,
          }}
        />
      </div>

    </div>
  );
}


function InsightStat({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="insight-stat">

      <span>{label}</span>

      <strong
        className={
          danger ? 'danger-text' : ''
        }
      >
        {value}
      </strong>

    </div>
  );
}


function DecisionButton({
  active,
  onClick,
  icon,
  title,
  description,
  variant,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`decision-option ${
        active ? 'active' : ''
      } ${variant}`}
    >

      <div className="decision-option-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      {active && (
        <div className="decision-check">
          <Check size={12} />
        </div>
      )}

    </button>
  );
}


function shortId(value: string) {
  return value.length > 12
    ? `…${value.slice(-8)}`
    : value;
}