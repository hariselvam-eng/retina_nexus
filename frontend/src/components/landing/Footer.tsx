export default function Footer() {
  return (
    <footer className="site-footer">

      {/* Ambient glow */}
      <div className="footer-glow" />

      {/* Top line */}
      <div className="footer-top-line" />

      <div className="footer-container">

        {/* =================================================
            BRAND
        ================================================== */}

        <div className="footer-brand">

          <div className="footer-logo">

            <span className="footer-logo-ring">
              <span />
            </span>

            <span className="footer-logo-text">
              RETINA <strong>NEXUS</strong>
            </span>

          </div>

          <p className="footer-description">
            AI-assisted retinal screening designed
            to extend access, clarify evidence and
            keep clinical judgement at the centre.
          </p>

          <span className="footer-location">
            INDIA / 2026
          </span>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================== */}

        <div className="footer-navigation">

          <span className="footer-nav-label">
            EXPLORE
          </span>

          <a href="#platform">
            PLATFORM
            <span>↗</span>
          </a>

          <a href="#technology">
            TECHNOLOGY
            <span>↗</span>
          </a>

          <a href="#impact">
            IMPACT
            <span>↗</span>
          </a>

          <a href="#about">
            ABOUT
            <span>↗</span>
          </a>

        </div>


        {/* =================================================
            STATEMENT
        ================================================== */}

        <div className="footer-statement">

          <span className="footer-statement-label">
            OUR NORTH STAR
          </span>

          <h3>
            BUILT FOR
            <br />
            <span>ACCESS.</span>
          </h3>

          <h3>
            DESIGNED FOR
            <br />
            <span>CLARITY.</span>
          </h3>

        </div>

      </div>


      {/* =================================================
          BOTTOM
      ================================================== */}

      <div className="footer-bottom">

        <span>
          © 2026 RETINA NEXUS
        </span>

        <span className="footer-status">
          <i />
          SYSTEM DESIGNED FOR HUMAN OVERSIGHT
        </span>

        <button
          className="footer-top-button"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            })
          }
        >
          BACK TO TOP
          <span>↑</span>
        </button>

      </div>

      {/* Bottom line */}
      <div className="footer-bottom-line" />

    </footer>
  );
}