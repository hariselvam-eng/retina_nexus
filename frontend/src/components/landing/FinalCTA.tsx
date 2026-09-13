import { useEffect, useRef, useState } from 'react';
import retinaImage from '../../assets/images/retina.jpg';


const headline = "SEE WHAT'S POSSIBLE.";

const callouts = [
  {
    label: 'AI ANALYSIS',
    sub: 'DETECT',
    position: 'top-left',
  },
  {
    label: 'EVIDENCE',
    sub: 'EXPLAIN',
    position: 'top-right',
  },
  {
    label: 'ACCESS',
    sub: 'REACH',
    position: 'bottom-left',
  },
  {
    label: 'HUMAN REVIEW',
    sub: 'DECIDE',
    position: 'bottom-right',
  },
];

const impactItems = [
  'EARLIER DETECTION',
  'WIDER ACCESS',
  'CLEARER DECISIONS',
  'BRIGHTER TOMORROWS',
];

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <section
      ref={sectionRef}
      className={`final-cta ${
        isVisible ? 'final-cta-visible' : ''
      }`}
      id="final-cta"
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="final-cta-noise" />

      <div className="final-cta-violet-glow" />

      <div className="final-cta-horizon" />

      {/* =====================================================
          TOP BRAND
      ====================================================== */}

      <div className="final-cta-top">

        <div className="final-cta-brand">
          <span className="brand-orbit">
            <span />
          </span>

          <span>
            RETINA <strong>NEXUS</strong>
          </span>
        </div>

        <span className="final-cta-stage">
          05 / 05
        </span>

      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="final-cta-content">

        {/* ===================================================
            LEFT TYPOGRAPHY
        ==================================================== */}

        <div className="final-cta-copy">

          <span className="final-cta-eyebrow">
            A CLEARER TOMORROW
          </span>

          <span className="final-cta-eyebrow-line" />

          <h2 className="final-cta-title">
            {headline.split('').map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className={`cta-letter ${
                  letter === ' '
                    ? 'cta-space'
                    : ''
                }`}
                style={{
                  transitionDelay: `${index * 0.035}s`,
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </h2>

          <p className="final-cta-description">
            Retina Nexus brings AI-assisted retinal
            screening, explainable evidence and human
            oversight closer to every community.
          </p>

          {/* =================================================
              BUTTONS
          ================================================== */}

          <div className="final-cta-actions">

            <a
              href="#platform"
              className="final-cta-primary"
            >
              <span>
                EXPLORE THE PLATFORM
              </span>

              <span className="cta-arrow">
                ↗
              </span>

              <span className="button-shine" />
            </a>

            <a
              href="#technology"
              className="final-cta-secondary"
            >
              <span>
                LEARN MORE
              </span>

              <span>
                ↗
              </span>
            </a>

          </div>

        </div>

        {/* ===================================================
            RETINAL LENS
        ==================================================== */}

        <div className="retinal-lens">

          {/* Outer atmosphere */}

          <div className="lens-atmosphere" />

          {/* HUD circles */}

          <div className="lens-ring lens-ring-outer" />
          <div className="lens-ring lens-ring-middle" />
          <div className="lens-ring lens-ring-inner" />

          {/* Dashed technical ring */}

          <div className="lens-dashed-ring" />

          {/* Vertical / horizontal targeting */}

          <div className="lens-crosshair horizontal" />
          <div className="lens-crosshair vertical" />

          {/* =================================================
              RETINA
          ================================================== */}

          <div className="retina-core">

            <img
              src={retinaImage}
              alt="Retinal fundus scan"
            />

            <div className="retina-vignette" />

            <div className="retina-scan-line" />

            {/* Red evidence target */}

            <div className="evidence-target">

              <span className="target-corner corner-tl" />
              <span className="target-corner corner-tr" />
              <span className="target-corner corner-bl" />
              <span className="target-corner corner-br" />

              <div className="target-circle">
                <span />
              </div>

            </div>

          </div>

          {/* =================================================
              CENTER HUD
          ================================================== */}

          <div className="lens-center">

            <span className="center-dot" />

            <span className="center-line center-line-x" />
            <span className="center-line center-line-y" />

          </div>

          {/* =================================================
              CALLOUTS
          ================================================== */}

          {callouts.map((item) => (
            <div
              key={item.label}
              className={`lens-callout ${item.position}`}
            >

              <span className="callout-line" />

              <span className="callout-dot" />

              <div className="callout-content">

                <strong>
                  {item.label}
                </strong>

                <small>
                  {item.sub}
                </small>

              </div>

            </div>
          ))}

          {/* =================================================
              FLOATING STATUS
          ================================================== */}

          <div className="lens-status">
            <span className="status-dot" />
            ANALYSIS ACTIVE
          </div>

        </div>

        {/* ===================================================
            RIGHT IMPACT PANEL
        ==================================================== */}

        <div className="final-cta-impact">

          <div className="impact-line" />

          <span className="impact-heading">
            FROM<br />
            INSIGHT<br />
            TO IMPACT
          </span>

          <div className="impact-list">

            {impactItems.map((item, index) => (
              <div
                className="impact-item"
                key={item}
                style={{
                  transitionDelay: `${0.7 + index * 0.15}s`,
                }}
              >
                <span>
                  {item}
                </span>

                <i />
              </div>
            ))}

          </div>

        </div>

      </div>

      {/* =====================================================
          BOTTOM STATEMENT
      ====================================================== */}

      <div className="final-cta-bottom">

        <div className="bottom-statement">

          <span className="bottom-marker" />

          <p>
            BECAUSE BETTER RETINAL CARE
            <br />
            SHOULD NOT DEPEND ON DISTANCE.
          </p>

        </div>

        <div className="bottom-brand">

          <strong>
            RETINA NEXUS
          </strong>

          <span>
            FOR A CLEARER, HEALTHIER TOMORROW.
          </span>

        </div>

      </div>

    </section>
  );
}