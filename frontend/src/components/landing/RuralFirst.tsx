import { useEffect, useRef, useState } from 'react';
import retinaImage from '../../assets/images/retina.jpg';
import ruralImage from '../../assets/images/rural-healthcare.jpg';

const principles = [
  {
    number: '01',
    title: 'ACCESS',
    heading: 'Rural-first screening',
    description:
      'Bring AI-assisted retinal screening closer to communities where specialist access can be limited.',
  },
  {
    number: '02',
    title: 'CLARITY',
    heading: 'Explainable AI evidence',
    description:
      'Show the visual evidence behind AI-assisted results so they are easier to understand and review.',
  },
  {
    number: '03',
    title: 'TRUST',
    heading: 'Human-in-the-loop',
    description:
      'Keep clinical judgment at the center while AI assists with analysis, evidence and decision support.',
  },
];

export default function RuralFirst() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [activePoint, setActivePoint] = useState(0);

  /* =========================================
     SECTION VISIBILITY
  ========================================== */

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

  /* =========================================
     AUTO ROTATING PRINCIPLES
  ========================================== */

  useEffect(() => {
    if (!isVisible) return;

    const interval = window.setInterval(() => {
      setActivePoint((current) => (current + 1) % principles.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isVisible]);

  const active = principles[activePoint];

  return (
    <section
      ref={sectionRef}
      className={`rural-section ${isVisible ? 'is-visible' : ''}`}
      id="rural-first"
    >
      <div className="rural-container">

        {/* =====================================
            HEADER
        ====================================== */}

        <header className="rural-header">

          <div className="rural-eyebrow">
            <span className="rural-eyebrow-dot" />
            OUR PRIORITY
          </div>

          <h2>
            Healthcare shouldn't
            <br />
            depend on <span>where you live.</span>
          </h2>

          <p>
            Retina Nexus is designed with rural and underserved
            communities at the center — bringing retinal screening
            closer, making AI more explainable, and keeping people
            at the heart of every decision.
          </p>

        </header>

        {/* =====================================
            FEATURE VISUAL
        ====================================== */}

        <div className="rural-feature">

          {/* Ambient background */}

          <div className="rural-ambient rural-ambient-one" />
          <div className="rural-ambient rural-ambient-two" />

          {/* =================================
              LEFT — RURAL IMAGE
          ================================== */}

          <div className="rural-photo-card">

            <img
              src={ruralImage}
              alt="Healthcare screening in a rural community"
              className="rural-photo"
            />

            <div className="rural-photo-overlay" />

            <div className="rural-photo-grid" />

            <div className="rural-photo-top">

              <span>
                FIELD ACCESS
              </span>

              <span className="rural-live">
                <i />
                ACTIVE
              </span>

            </div>

            <div className="rural-photo-bottom">

              <div>
                <span>RURAL-FIRST</span>
                <strong>Healthcare access beyond the city.</strong>
              </div>

              <span className="rural-photo-index">
                01
              </span>

            </div>

          </div>

          {/* =================================
              CONNECTING ENERGY
          ================================== */}

          <div className="rural-connection">

            <div className="rural-connection-dot" />

            <div className="rural-connection-line" />

            <div className="rural-connection-dot rural-connection-dot-end" />

            <span>
              AI BRIDGES
              <br />
              DISTANCE
            </span>

          </div>

          {/* =================================
              RIGHT — RETINAL AI CARD
          ================================== */}

          <div className="rural-ai-card">

            <div className="rural-ai-header">

              <span>
                RETINAL INTELLIGENCE
              </span>

              <span>
                AI
              </span>

            </div>

            <div className="rural-retina-wrapper">

              <img
                src={retinaImage}
                alt="Retinal fundus image analyzed by AI"
                className="rural-retina-image"
              />

              <div className="rural-retina-overlay" />

              {/* Red medical evidence region */}

              <div className="rural-evidence-ring" />

              <div className="rural-evidence-dot" />

              <div className="rural-retina-scan" />

            </div>

            <div className="rural-ai-data">

              <div>
                <span>ANALYSIS</span>
                <strong>AI ASSISTED</strong>
              </div>

              <div>
                <span>EVIDENCE</span>
                <strong>IDENTIFIED</strong>
              </div>

            </div>

            <div className="rural-ai-footer">

              <div>
                <span>MODE</span>
                <strong>EXPLAINABLE</strong>
              </div>

              <div>
                <span>REVIEW</span>
                <strong>HUMAN</strong>
              </div>

            </div>

          </div>

        </div>

        {/* =====================================
            PRINCIPLES
        ====================================== */}

        <div className="rural-principles">

          {principles.map((item, index) => (
            <button
              key={item.number}
              type="button"
              className={`rural-principle ${
                activePoint === index ? 'active' : ''
              }`}
              onClick={() => setActivePoint(index)}
            >

              <div className="rural-principle-top">

                <span className="rural-principle-number">
                  {item.number}
                </span>

                <span className="rural-principle-label">
                  {item.title}
                </span>

              </div>

              <h3>
                {item.heading}
              </h3>

              <p>
                {item.description}
              </p>

              <div className="rural-principle-progress">
                <span />
              </div>

            </button>
          ))}

        </div>

        {/* =====================================
            ACTIVE MISSION STATEMENT
        ====================================== */}

        <div className="rural-mission">

          <div className="rural-mission-line" />

          <div className="rural-mission-content">

            <span>
              BUILT TO REACH BEYOND THE CITY
            </span>

            <strong>
              {active.title}
            </strong>

            <p>
              Designed for rural clinics, primary health
              centers and community health workers.
            </p>

          </div>

          <div className="rural-mission-line" />

        </div>

      </div>
    </section>
  );
}