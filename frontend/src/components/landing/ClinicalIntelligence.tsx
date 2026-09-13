import { useEffect, useRef, useState } from 'react';

import screeningImage from '../../assets/images/clinical-screening.jpg';
import doctorImage from '../../assets/images/clinical-review.jpg';

const headline = 'FROM PREDICTION TO DECISION.';

const stages = [
  {
    number: '01',
    title: 'SEE',
    description: 'Understand what the model detected.',
  },
  {
    number: '02',
    title: 'VERIFY',
    description: 'Review the evidence supporting the result.',
  },
  {
    number: '03',
    title: 'DECIDE',
    description: 'Keep clinical judgment at the centre.',
  },
];

export default function ClinicalIntelligence() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState(0);

  /*
   * SECTION VISIBILITY
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
   * LETTER-BY-LETTER HEADLINE
   */
  useEffect(() => {
    if (!isVisible) {
      setRevealedLetters(0);
      return;
    }

    let current = 0;

    const interval = window.setInterval(() => {
      current += 1;
      setRevealedLetters(current);

      if (current >= headline.length) {
        window.clearInterval(interval);
      }
    }, 45);

    return () => window.clearInterval(interval);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      id="clinical-intelligence"
      className={`clinical-section ${
        isVisible ? 'clinical-visible' : ''
      }`}
    >
      <div className="clinical-container">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="clinical-header">

          <span className="clinical-eyebrow">
            CLINICAL INTELLIGENCE
          </span>

          <h2 className="clinical-title">
            {headline.split('').map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className={
                  index < revealedLetters
                    ? 'letter-visible'
                    : 'letter-hidden'
                }
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </h2>

          <p className="clinical-intro">
            AI-assisted screening that brings retinal
            evidence into the clinical workflow.
          </p>

        </div>


        {/* =====================================
            VISUAL WORKFLOW
        ====================================== */}

        <div className="clinical-visual">

          {/* ---------------------------------
              IMAGE 01
          ---------------------------------- */}

          <div className="clinical-image-card clinical-image-left">

            <div className="clinical-image-number">
              01
            </div>

            <div className="clinical-image-label">
              SCREENING
            </div>

            <div className="clinical-image-wrapper">
              <img
                src={screeningImage}
                alt="Retinal screening workflow"
              />

              <div className="clinical-image-overlay" />

              <div className="clinical-image-scan" />
            </div>

            <div className="clinical-image-caption">
              <span>RETINAL INPUT</span>
              <span>CAPTURE</span>
            </div>

          </div>


          {/* =================================
              CENTRAL SIGNAL
          ================================= */}

          <div className="clinical-signal">

            <div className="clinical-signal-node">
              <span />
            </div>

            <div className="clinical-signal-line">

              <div className="clinical-signal-progress" />

            </div>

            <div className="clinical-ai-node">

              <span className="clinical-ai-dot" />

              <span className="clinical-ai-text">
                AI
              </span>

            </div>

            <div className="clinical-signal-line clinical-signal-line-right">

              <div className="clinical-signal-progress" />

            </div>

          </div>


          {/* ---------------------------------
              IMAGE 02
          ---------------------------------- */}

          <div className="clinical-image-card clinical-image-right">

            <div className="clinical-image-number">
              02
            </div>

            <div className="clinical-image-label">
              CLINICAL REVIEW
            </div>

            <div className="clinical-image-wrapper">
              <img
                src={doctorImage}
                alt="Clinician reviewing retinal images"
              />

              <div className="clinical-image-overlay" />

              <div className="clinical-review-ring" />
            </div>

            <div className="clinical-image-caption">
              <span>HUMAN REVIEW</span>
              <span>OVERSIGHT</span>
            </div>

          </div>

        </div>


        {/* =====================================
            RESULT PANEL
        ====================================== */}

        <div className="clinical-result">

          <div className="clinical-result-top">

            <span className="clinical-result-status">
              <i />
              EXPLAINABLE RESULT
            </span>

            <span className="clinical-result-confidence">
              91% CONFIDENCE
            </span>

          </div>

          <div className="clinical-result-body">

            <div className="clinical-result-number">
              91<span>%</span>
            </div>

            <div className="clinical-result-copy">

              <span>
                AI PREDICTION
              </span>

              <h3>
                Evidence before decision.
              </h3>

              <p>
                The model output is accompanied by visual
                evidence, allowing the clinician to review
                what contributed to the result.
              </p>

            </div>

          </div>

        </div>


        {/* =====================================
            THREE STAGES
        ====================================== */}

        <div className="clinical-stages">

          {stages.map((stage, index) => (
            <div
              key={stage.number}
              className="clinical-stage"
              style={{
                transitionDelay: `${index * 180}ms`,
              }}
            >

              <span className="clinical-stage-number">
                {stage.number}
              </span>

              <div className="clinical-stage-content">

                <h3>
                  {stage.title}
                </h3>

                <p>
                  {stage.description}
                </p>

              </div>

              <span className="clinical-stage-arrow">
                ↗
              </span>

            </div>
          ))}

        </div>


        {/* =====================================
            BOTTOM STATEMENT
        ====================================== */}

        <div className="clinical-bottom">

          <span className="clinical-bottom-line" />

          <p>
            <strong>
              AI assists the workflow.
            </strong>{' '}
            Clinical expertise remains at the centre.
          </p>

          <span className="clinical-bottom-line" />

        </div>

      </div>
    </section>
  );
}