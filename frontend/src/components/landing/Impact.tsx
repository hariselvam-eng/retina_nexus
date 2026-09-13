import { useEffect, useRef, useState } from 'react';

const pillars = [
  {
    number: '01',
    title: 'ACCESS',
    description: 'Screening beyond geographic boundaries.',
  },
  {
    number: '02',
    title: 'REACH',
    description:
      'Technology designed to scale across underserved communities.',
  },
  {
    number: '03',
    title: 'TRUST',
    description:
      'Explainable AI with human oversight at the centre of the workflow.',
  },
];

const capabilities = [
  {
    number: '01',
    title: 'RURAL-FIRST',
    description:
      'Designed to bring AI-assisted retinal screening closer to communities where specialist access may be limited.',
  },
  {
    number: '02',
    title: 'MULTILINGUAL',
    description:
      'A more accessible experience through multilingual interaction, helping technology reach people in the language they understand.',
  },
  {
    number: '03',
    title: 'VOICE-GUIDED',
    description:
      'Voice-guided interaction can simplify navigation and make the screening workflow easier to use.',
  },
  {
    number: '04',
    title: 'LOW-BANDWIDTH',
    description:
      'A lightweight digital workflow designed with connectivity constraints in mind.',
  },
];

export default function RuralImpact() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activePillar, setActivePillar] = useState(0);
  const [activeCapability, setActiveCapability] = useState(-1);

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
   * Scroll-based animation for this section only.
   */
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const sectionProgress =
        (viewportHeight - rect.top) /
        (rect.height + viewportHeight);

      const progress = Math.max(
        0,
        Math.min(1, sectionProgress)
      );

      /*
       * Pillars activate through the middle
       * of the section.
       */
      const pillarProgress = Math.min(
        0.65,
        progress
      );

      const pillarStep = Math.min(
        pillars.length - 1,
        Math.floor(
          (pillarProgress / 0.65) * pillars.length
        )
      );

      setActivePillar(pillarStep);

      /*
       * Capabilities activate later.
       */
      if (progress < 0.48) {
        setActiveCapability(-1);
      } else {
        const capabilityProgress =
          (progress - 0.48) / 0.35;

        const capabilityStep = Math.min(
          capabilities.length - 1,
          Math.floor(
            capabilityProgress *
              capabilities.length
          )
        );

        setActiveCapability(capabilityStep);
      }
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="rural-impact"
      className={`rural-impact-section ${
        isVisible ? 'is-visible' : ''
      }`}
    >
      <div className="rural-impact-container">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="rural-impact-header">

  <span className="rural-impact-eyebrow">
    RURAL-FIRST IMPACT
  </span>

  <h2
    className="rural-impact-title"
    aria-label="WHERE ACCESS ENDS, WE EXTEND IT."
  >
    <span className="rural-title-line">
      {'WHERE ACCESS ENDS,'.split('').map((char, index) => (
        <span
          key={`first-${index}`}
          className="rural-letter"
          style={{
            transitionDelay: `${index * 0.045}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>

    <span className="rural-title-line rural-title-violet">
      {'WE EXTEND IT.'.split('').map((char, index) => (
        <span
          key={`second-${index}`}
          className="rural-letter"
          style={{
            transitionDelay: `${(index + 17) * 0.045}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  </h2>

  <p>
    Bringing explainable AI-assisted retinal
    screening closer to communities where
    specialist access may be limited.
  </p>

</div>

        {/* =========================================
            ORBIT / NETWORK
        ========================================= */}

        <div className="rural-orbit-area">

          {/* Ambient glow */}

          <div className="rural-orbit-glow" />

          {/* Orbit rings */}

          <div className="rural-orbit-ring rural-ring-one" />
          <div className="rural-orbit-ring rural-ring-two" />
          <div className="rural-orbit-ring rural-ring-three" />

          {/* Connecting lines */}

          <div className="rural-connection rural-connection-left" />
          <div className="rural-connection rural-connection-right" />
          <div className="rural-connection rural-connection-bottom" />

          {/* Animated signal */}

          <div className="rural-signal rural-signal-one" />
          <div className="rural-signal rural-signal-two" />
          <div className="rural-signal rural-signal-three" />


          {/* =====================================
              CENTRAL NEXUS
          ====================================== */}

          <div className="rural-nexus">

            <div className="rural-nexus-inner">

              <span className="rural-nexus-status">
                AI SYSTEM
              </span>

              <strong>
                RETINA
              </strong>

              <span>
                NEXUS
              </span>

            </div>

            <div className="rural-nexus-pulse" />

          </div>


          {/* =====================================
              PILLARS
          ====================================== */}

          {pillars.map((pillar, index) => (
            <div
              key={pillar.number}
              className={`rural-pillar rural-pillar-${index + 1} ${
                activePillar === index
                  ? 'active'
                  : ''
              }`}
            >

              <span className="rural-pillar-number">
                {pillar.number}
              </span>

              <h3>
                {pillar.title}
              </h3>

              <p>
                {pillar.description}
              </p>

              <span className="rural-pillar-line" />

            </div>
          ))}

        </div>


        {/* =========================================
            CAPABILITIES HEADER
        ========================================= */}

        <div className="rural-capabilities-header">

          <span>
            DESIGNED FOR REAL COMMUNITIES
          </span>

          <div />

        </div>


        {/* =========================================
            CAPABILITIES
        ========================================= */}

        <div className="rural-capabilities">

          {capabilities.map(
            (capability, index) => (
              <div
                key={capability.number}
                className={`rural-capability ${
                  activeCapability === index
                    ? 'active'
                    : ''
                } ${
                  activeCapability > index
                    ? 'passed'
                    : ''
                }`}
              >

                <div className="rural-capability-number">
                  {capability.number}
                </div>

                <div className="rural-capability-main">

                  <div className="rural-capability-title">
                    <h3>
                      {capability.title}
                    </h3>

                    <span>
                      ↗
                    </span>
                  </div>

                  <p>
                    {capability.description}
                  </p>

                </div>

                <div className="rural-capability-line">
                  <span />
                </div>

              </div>
            )
          )}

        </div>


        {/* =========================================
            FINAL STATEMENT
        ========================================= */}

        <div className="rural-final">

          <span className="rural-final-eyebrow">
            THE VISION
          </span>

          <h2>
            TECHNOLOGY SHOULD
            <br />

            <span>
              TRAVEL FURTHER
            </span>

            <br />

            THAN THE CLINIC.
          </h2>

          <div className="rural-final-line">
            <span />
          </div>

          <p>
            Extending the reach of explainable
            AI-assisted retinal screening.
          </p>

        </div>

      </div>
    </section>
  );
}