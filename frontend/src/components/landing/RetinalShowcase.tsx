export default function RetinalShowcase() {
  return (
    <section className="retinal-showcase">
      <div className="retinal-showcase-header">
        <span className="section-eyebrow">
          <span className="eyebrow-dot" />
          AI-POWERED VISION
        </span>

        <h2>
          From retinal image
          <span> to clinical insight.</span>
        </h2>

        <p>
          Advanced visual intelligence transforms retinal imagery into
          structured, explainable screening evidence.
        </p>
      </div>

      <div className="retinal-visual-card">
        <div className="retinal-image-placeholder">
          <div className="scan-line" />

          <div className="retinal-center">
            <div className="retinal-ring ring-one" />
            <div className="retinal-ring ring-two" />
            <div className="retinal-ring ring-three" />
            <div className="retinal-core" />
          </div>

          <div className="visual-label label-top">
            <span />
            OPTIC DISC
          </div>

          <div className="visual-label label-right">
            <span />
            VASCULAR NETWORK
          </div>

          <div className="visual-label label-bottom">
            <span />
            AI ANALYSIS REGION
          </div>
        </div>

        <div className="visual-status">
          <span className="status-dot" />
          RETINAL ANALYSIS ACTIVE
        </div>
      </div>
    </section>
  );
}