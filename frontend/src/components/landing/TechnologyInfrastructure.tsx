import { useEffect, useRef, useState } from 'react';

const workflow = [
  {
    number: '01',
    label: 'INPUT',
    title: 'Retinal Image',
    description: 'Fundus image acquisition',
  },
  {
    number: '02',
    label: 'PROCESSING',
    title: 'AI Engine',
    description: 'Pattern analysis & classification',
  },
  {
    number: '03',
    label: 'EVIDENCE',
    title: 'Evidence Map',
    description: 'Visual regions supporting the result',
  },
  {
    number: '04',
    label: 'OUTPUT',
    title: 'Explainable Result',
    description: 'Prediction with supporting evidence',
  },
  {
    number: '05',
    label: 'OVERSIGHT',
    title: 'Human Review',
    description: 'Clinical judgment remains central',
  },
];

export default function TechnologyInfrastructure() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  /*
   * Detect only this section.
   */
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  /*
   * Workflow animation.
   *
   * Each stage activates one after another.
   */
  useEffect(() => {
    if (!isVisible) {
      setActiveStep(0);
      return;
    }

    setActiveStep(0);

    const interval = window.setInterval(() => {
      setActiveStep((current) => {
        if (current >= workflow.length - 1) {
          return 0;
        }

        return current + 1;
      });
    }, 2200);

    return () => window.clearInterval(interval);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      id="technology"
      className={`tech-section ${
        isVisible ? 'tech-visible' : ''
      }`}
    >
      <div className="tech-container">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="tech-header">

          <div className="tech-eyebrow">
            TECHNOLOGY / INFRASTRUCTURE
          </div>

          <h2>
            BUILT FOR THE
            <br />
            <span>REAL WORLD.</span>
          </h2>

          <p>
            AI-assisted screening designed around
            the realities of clinical workflows.
          </p>

        </div>


        {/* =====================================
            WORKFLOW SYSTEM
        ====================================== */}

        <div className="tech-workflow">

          {/* Ambient background */}

          <div className="tech-orbit tech-orbit-one" />
          <div className="tech-orbit tech-orbit-two" />

          <div className="tech-grid" />


          {/* =====================================
              CONNECTING PATH
          ====================================== */}

          <div className="tech-path">

            <div className="tech-path-base" />

            <div
              className="tech-path-progress"
              style={{
                width: `${Math.min(
                  activeStep / (workflow.length - 1),
                  1
                ) * 100}%`,
              }}
            />

            <div
              className="tech-energy"
              key={activeStep}
            />

          </div>


          {/* =====================================
              STEP 01 — RETINAL IMAGE
          ====================================== */}

          <div
            className={`tech-card tech-card-input ${
              activeStep === 0 ? 'active' : ''
            } ${
              activeStep > 0 ? 'completed' : ''
            }`}
          >

            <div className="tech-card-top">
              <span className="tech-number">
                01
              </span>

              <span className="tech-card-status">
                INPUT
              </span>
            </div>

            <div className="tech-node">
              <span />
            </div>

            <div className="tech-card-content">

              <span className="tech-label">
                RETINAL IMAGE
              </span>

              <h3>
                Retinal Image
              </h3>

              <p>
                Fundus image acquisition
              </p>

            </div>

          </div>


          {/* =====================================
              STEP 02 — AI ENGINE
          ====================================== */}

          <div
            className={`tech-card tech-card-ai ${
              activeStep === 1 ? 'active' : ''
            } ${
              activeStep > 1 ? 'completed' : ''
            }`}
          >

            <div className="tech-card-top">
              <span className="tech-number">
                02
              </span>

              <span className="tech-card-status">
                PROCESSING
              </span>
            </div>

            <div className="tech-ai-core">

              <div className="tech-ai-ring ring-one" />
              <div className="tech-ai-ring ring-two" />

              <div className="tech-ai-dot">
                AI
              </div>

            </div>

            <div className="tech-card-content">

              <span className="tech-label">
                AI ENGINE
              </span>

              <h3>
                AI Engine
              </h3>

              <p>
                Pattern analysis & classification
              </p>

            </div>

          </div>


          {/* =====================================
              STEP 03 — EVIDENCE
          ====================================== */}

          <div
            className={`tech-card tech-card-evidence ${
              activeStep === 2 ? 'active' : ''
            } ${
              activeStep > 2 ? 'completed' : ''
            }`}
          >

            <div className="tech-card-top">

              <span className="tech-number">
                03
              </span>

              <span className="tech-card-status">
                EVIDENCE
              </span>

            </div>

            <div className="tech-evidence-graph">

              <span />
              <span />
              <span />
              <span />
              <span />
              <span />

            </div>

            <div className="tech-card-content">

              <span className="tech-label">
                EVIDENCE MAP
              </span>

              <h3>
                Evidence Map
              </h3>

              <p>
                Visual regions supporting the result
              </p>

            </div>

          </div>


          {/* =====================================
              STEP 04 — RESULT
          ====================================== */}

          <div
            className={`tech-card tech-card-result ${
              activeStep === 3 ? 'active' : ''
            } ${
              activeStep > 3 ? 'completed' : ''
            }`}
          >

            <div className="tech-card-top">

              <span className="tech-number">
                04
              </span>

              <span className="tech-card-status">
                OUTPUT
              </span>

            </div>

            <div className="tech-confidence">

              <strong>
                {activeStep >= 3 ? '91' : '00'}
              </strong>

              <span>
                %
              </span>

            </div>

            <div className="tech-card-content">

              <span className="tech-label">
                EXPLAINABLE RESULT
              </span>

              <h3>
                Explainable Result
              </h3>

              <p>
                Prediction with supporting evidence
              </p>

            </div>

          </div>


          {/* =====================================
              STEP 05 — HUMAN REVIEW
          ====================================== */}

          <div
            className={`tech-card tech-card-human ${
              activeStep === 4 ? 'active' : ''
            }`}
          >

            <div className="tech-card-top">

              <span className="tech-number">
                05
              </span>

              <span className="tech-card-status">
                OVERSIGHT
              </span>

            </div>

            <div className="tech-human-icon">

              <div className="tech-head" />
              <div className="tech-body" />

            </div>

            <div className="tech-card-content">

              <span className="tech-label">
                HUMAN REVIEW
              </span>

              <h3>
                Human Review
              </h3>

              <p>
                Clinical judgment remains central
              </p>

            </div>

          </div>


          {/* =====================================
              TOP STATUS
          ====================================== */}

          <div className="tech-status-pill">

            <span />

            ANALYSIS ACTIVE

          </div>


          {/* =====================================
              BOTTOM LABEL
          ====================================== */}

          <div className="tech-system-label">
            CLINICAL WORKFLOW
          </div>

        </div>


        {/* =====================================
            BOTTOM METRICS
        ====================================== */}

        <div className="tech-metrics">

          <div className="tech-metric">

            <span>
              IMAGE ANALYSIS
            </span>

            <strong>
              AI-ASSISTED
            </strong>

          </div>

          <div className="tech-metric">

            <span>
              EVIDENCE
            </span>

            <strong>
              VISUAL
            </strong>

          </div>

          <div className="tech-metric">

            <span>
              CLINICAL REVIEW
            </span>

            <strong>
              HUMAN-IN-THE-LOOP
            </strong>

          </div>

        </div>


        {/* =====================================
            STATEMENT
        ====================================== */}

        <div className="tech-statement">

          <span />

          <p>
            From retinal image to explainable
            decision support — <strong>
              without removing the human from the workflow.
            </strong>
          </p>

          <span />

        </div>

      </div>
    </section>
  );
}