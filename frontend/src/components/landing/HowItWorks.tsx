import { useEffect, useRef, useState } from 'react';
import retinaImage from '../../assets/images/retina.jpg';

const steps = [
  {
    number: '01',
    label: 'UPLOAD',
    title: 'Retinal image received',
    description:
      'Begin with a high-quality retinal fundus image ready for analysis.',
  },
  {
    number: '02',
    label: 'ANALYZE',
    title: 'AI examines the retina',
    description:
      'The system analyzes retinal structures and identifies relevant patterns.',
  },
  {
    number: '03',
    label: 'EVIDENCE',
    title: 'Visual evidence identified',
    description:
      'Regions contributing to the prediction are highlighted for inspection.',
  },
  {
    number: '04',
    label: 'INSIGHT',
    title: 'Result becomes explainable',
    description:
      'The prediction is presented together with supporting evidence and confidence.',
  },
  {
    number: '05',
    label: 'REVIEW',
    title: 'Human oversight',
    description:
      'A clinician can review the AI-assisted result before making a decision.',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [hasEntered, setHasEntered] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  /*
   * Detect only when the How It Works section
   * enters/leaves the viewport.
   */
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHasEntered(entry.isIntersecting);
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  /*
   * Scroll control
   *
   * The page scroll is monitored, but the calculation
   * only uses the position of THIS section.
   */
useEffect(() => {
  const section = sectionRef.current;

  if (!section) return;

  let interval: number | undefined;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        // Start from the first step
        setActiveStep(0);

        // Change every 5 seconds
        interval = window.setInterval(() => {
          setActiveStep((current) => {
            return (current + 1) % steps.length;
          });
        }, 5000);
      } else {
        // Stop animation when section is outside viewport
        if (interval) {
          window.clearInterval(interval);
          interval = undefined;
        }
      }
    },
    {
      threshold: 0.25,
    }
  );

  observer.observe(section);

  return () => {
    observer.disconnect();

    if (interval) {
      window.clearInterval(interval);
    }
  };
}, []);

  const step = steps[activeStep];

  return (
    <section
      ref={sectionRef}
      className={`hiw-section ${
        hasEntered ? 'is-visible' : ''
      }`}
      id="how-it-works"
    >
      <div className="hiw-container">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="hiw-header">

          <span className="hiw-eyebrow">
            THE RETINA NEXUS WORKFLOW
          </span>

          <h2>
            From image to <span>insight.</span>
          </h2>

          <p>
            Every step is designed to make AI-assisted
            retinal screening more transparent,
            understandable and clinically useful.
          </p>

        </div>

        {/* =====================================
            TIMELINE
        ====================================== */}

        <div className="hiw-timeline">

          <div className="hiw-line">

            {/* Base line */}

            <div className="hiw-line-base" />

            {/* Violet progress */}

            <div
              className="hiw-line-progress"
              style={{
                width: `${
                  (activeStep /
                    (steps.length - 1)) *
                  100
                }%`,
              }}
            />

            {/* Energy particle */}

            <div
              className="hiw-energy"
              style={{
                left: `${
                  (activeStep /
                    (steps.length - 1)) *
                  100
                }%`,
              }}
            />

          </div>

          {/* Steps */}

          <div className="hiw-steps">

            {steps.map((item, index) => (
              <div
                key={item.number}
                className={`hiw-step ${
                  index === activeStep
                    ? 'active'
                    : ''
                } ${
                  index < activeStep
                    ? 'completed'
                    : ''
                }`}
              >

                <span className="hiw-step-number">
                  {item.number}
                </span>

                <span className="hiw-step-dot" />

                <span className="hiw-step-label">
                  {item.label}
                </span>

              </div>
            ))}

          </div>

        </div>

        {/* =====================================
            WORKFLOW STAGE
        ====================================== */}

        <div className="hiw-stage">

          {/* =================================
              LEFT — RETINAL IMAGE
          ================================== */}

          <div className="hiw-retina-panel">

            <div className="hiw-panel-top">

              <span>
                RETINAL INPUT
              </span>

              <span className="hiw-live">
                <i />
                LIVE
              </span>

            </div>

            <div className="hiw-retina-visual">

              <div className="hiw-retina-glow" />

              {/* Retinal image */}

              <div className="hiw-retina-circle">

                <img
                  src={retinaImage}
                  alt="Retinal fundus image"
                  className="hiw-retina-image"
                />

                <div className="hiw-image-overlay" />

                <div
                  className={`hiw-focus-ring ${
                    hasEntered
                      ? 'focus-active'
                      : ''
                  }`}
                />

                {/* New scan whenever step changes */}

                <div
                  key={activeStep}
                  className={`hiw-scan-line ${
                    hasEntered
                      ? 'scan-active'
                      : ''
                  }`}
                />

              </div>

              <div className="hiw-retina-grid" />

            </div>

            <div className="hiw-retina-footer">

              <span>
                FUNDUS IMAGE
              </span>

              <span>
                AI READY
              </span>

            </div>

          </div>

          {/* =================================
              RIGHT — AI ANALYSIS
          ================================== */}

          <div className="hiw-analysis-panel">

            <div className="hiw-panel-top">

              <span>
                AI WORKFLOW
              </span>

              <span className="hiw-status">
                PROCESSING
              </span>

            </div>

            {/* Step content */}

            <div
              className="hiw-analysis-content"
              key={activeStep}
            >

              <div className="hiw-analysis-number">
                {step.number}
              </div>

              <div className="hiw-analysis-info">

                <span className="hiw-analysis-label">
                  {step.label}
                </span>

                <h3>
                  {step.title}
                </h3>

                <p>
                  {step.description}
                </p>

              </div>

            </div>

            {/* =================================
                METRICS
            ================================== */}

            <div className="hiw-metrics">

              <div>
                <span>
                  STAGE
                </span>

                <strong>
                  {String(
                    activeStep + 1
                  ).padStart(2, '0')}
                  /05
                </strong>
              </div>

              <div>
                <span>
                  STATUS
                </span>

                <strong>
                  ACTIVE
                </strong>
              </div>

              <div>
                <span>
                  MODE
                </span>

                <strong>
                  AI + HUMAN
                </strong>
              </div>

            </div>

          </div>

        </div>

        {/* =====================================
            BOTTOM STATEMENT
        ====================================== */}

        <div className="hiw-bottom">

          <span className="hiw-bottom-line" />

          <p>
            <strong>
              AI doesn't replace clinical judgment.
            </strong>{' '}
            It makes the evidence easier to see,
            understand and review.
          </p>

          <span className="hiw-bottom-line" />

        </div>

      </div>
    </section>
  );
}