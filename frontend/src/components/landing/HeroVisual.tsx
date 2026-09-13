export default function HeroVisual() {
  return (
    <section className="hero-visual">
      <div className="hero-video-container">

        <video
          className="hero-video"
          src="/videos/retina-ai.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="hero-video-overlay" />

        <div className="ai-status">
          <span className="status-dot" />
          AI ANALYSIS ACTIVE
        </div>

      </div>
    </section>
  );
}