import { useEffect, useRef, useState } from 'react';
import retinaImage from '../../assets/images/retina.jpg';

const tabs = [
  {
    id: 'evidence',
    label: 'EVIDENCE',
    title: 'Visual evidence',
    description:
      'The regions that influence the AI prediction are surfaced directly on the retinal image.',
  },
  {
    id: 'confidence',
    label: 'CONFIDENCE',
    title: 'Prediction confidence',
    description:
      'Confidence provides context around the model output instead of presenting the result as a black box.',
  },
  {
    id: 'explanation',
    label: 'EXPLANATION',
    title: 'Understand the result',
    description:
      'Supporting visual evidence makes the AI-assisted result easier for a human reviewer to interpret.',
  },
];

export default function ExplainableAI() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [confidence, setConfidence] = useState(0);

  /*
   * ==========================================
   * SECTION VISIBILITY
   * ==========================================
   */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  /*
   * ==========================================
   * CONFIDENCE COUNTER
   * ==========================================
   */

  useEffect(() => {
    if (!isVisible) {
      setConfidence(0);
      return;
    }

    let current = 0;

    const timer = window.setInterval(() => {
      current += 1.5;

      if (current >= 91.4) {
        current = 91.4;
        window.clearInterval(timer);
      }

      setConfidence(current);
    }, 30);

    return () => {
      window.clearInterval(timer);
    };
  }, [isVisible]);

  /*
   * ==========================================
   * AUTOMATIC TABS
   * ==========================================
   */

  useEffect(() => {
    if (!isVisible) return;

    const timer = window.setInterval(() => {
      setActiveTab((current) => {
        return (current + 1) % tabs.length;
      });
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isVisible]);

  const activeContent = tabs[activeTab];

  return (
    <section
      ref={sectionRef}
      className={`explain-section ${
        isVisible ? 'is-visible' : ''
      }`}
      id="explainable-ai"
    >
      <div className="explain-container">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="explain-header">

          <span className="explain-eyebrow">
            EXPLAINABLE INTELLIGENCE
          </span>

          <h2>
            Don't just see the result.
            <br />
            <span>Understand why.</span>
          </h2>

          <p>
            Retina Nexus connects every AI prediction
            to visual evidence, confidence and an
            explanation designed for human review.
          </p>

        </div>

        {/* =====================================
            MAIN GLASS PANEL
        ====================================== */}

        <div className="explain-glass-panel">

          {/* Ambient glow */}

          <div className="explain-ambient-glow" />

          {/* =================================
              PANEL HEADER
          ================================== */}

          <div className="explain-panel-header">

            <div className="explain-panel-title">

              <span className="explain-live-dot" />

              <span>
                EXPLAINABLE AI
              </span>

            </div>

            <div className="explain-analysis-state">
              ANALYSIS LIVE
            </div>

          </div>

          {/* =================================
              CONTENT
          ================================== */}

          <div className="explain-content">

            {/* =================================
                LEFT — RETINAL IMAGE
            ================================== */}

            <div className="explain-image-panel">

              <div className="explain-image-header">

                <span>
                  RETINAL INPUT
                </span>

                <span>
                  FUNDUS / RGB
                </span>

              </div>

              <div className="explain-image-stage">

                {/* Image */}

                <div className="explain-image-circle">

                  <img
                    src={retinaImage}
                    alt="Retinal fundus image"
                    className="explain-retina-image"
                  />

                  {/* Dark glass overlay */}

                  <div className="explain-image-overlay" />

                  {/* Evidence regions */}

                  <div
                    className={`explain-evidence explain-evidence-one ${
                      activeTab === 0
                        ? 'evidence-active'
                        : ''
                    }`}
                  />

                  <div
                    className={`explain-evidence explain-evidence-two ${
                      activeTab === 0
                        ? 'evidence-active'
                        : ''
                    }`}
                  />

                  {/* Focus ring */}

                  <div className="explain-focus-ring" />

                  {/* Light sweep */}

                  {isVisible && (
                    <div className="explain-light-sweep" />
                  )}

                </div>

                {/* Evidence label */}

                <div
                  className={`explain-evidence-label ${
                    activeTab === 0
                      ? 'label-visible'
                      : ''
                  }`}
                >
                  <span />
                  CONTRIBUTING REGION
                </div>

              </div>

              <div className="explain-image-footer">

                <span>
                  AI EVIDENCE MAP
                </span>

                <span>
                  ACTIVE
                </span>

              </div>

            </div>

            {/* =================================
                RIGHT — EXPLANATION
            ================================== */}

            <div className="explain-info-panel">

              {/* Tabs */}

              <div className="explain-tabs">

                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={
                      index === activeTab
                        ? 'active'
                        : ''
                    }
                    onClick={() => setActiveTab(index)}
                  >
                    {tab.label}
                  </button>
                ))}

              </div>

              {/* Content */}

              <div
                className="explain-info-content"
                key={activeTab}
              >

                <span className="explain-content-label">
                  {activeContent.label}
                </span>

                <h3>
                  {activeContent.title}
                </h3>

                <p>
                  {activeContent.description}
                </p>

              </div>

              {/* =================================
                  AI RESULT
              ================================== */}

              <div className="explain-result-card">

                <div className="explain-result-top">

                  <span>
                    AI FINDING
                  </span>

                  <span className="explain-result-status">
                    ANALYZED
                  </span>

                </div>

                <div className="explain-result-main">

                  <div>

                    <span>
                      PREDICTION
                    </span>

                    <strong>
                      AI-ASSISTED RESULT
                    </strong>

                  </div>

                  <div className="explain-confidence">

                    <span>
                      CONFIDENCE
                    </span>

                    <strong>
                      {confidence.toFixed(1)}%
                    </strong>

                  </div>

                </div>

                {/* Confidence bar */}

                <div className="explain-confidence-bar">

                  <div
                    style={{
                      width: `${confidence}%`,
                    }}
                  />

                </div>

              </div>

              {/* =================================
                  EXPLANATION NOTE
              ================================== */}

              <div className="explain-note">

                <span className="explain-note-icon">
                  ✦
                </span>

                <p>
                  AI output is presented with supporting
                  evidence to assist — not replace —
                  clinical judgment.
                </p>

              </div>

            </div>

          </div>

          {/* =================================
              PANEL FOOTER
          ================================== */}

          <div className="explain-panel-footer">

            <span>
              RETINA NEXUS / EXPLAINABILITY ENGINE
            </span>

            <span>
              AI + HUMAN REVIEW
            </span>

          </div>

        </div>

        {/* =====================================
            BOTTOM STATEMENT
        ====================================== */}

        <div className="explain-bottom">

          <span className="explain-bottom-line" />

          <p>
            <strong>
              Every prediction should have a reason.
            </strong>{' '}
            Retina Nexus makes that reasoning visible.
          </p>

          <span className="explain-bottom-line" />

        </div>

      </div>
    </section>
  );
}