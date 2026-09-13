import { useRef, useState } from "react";

export default function HeroVisual() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = async () => {
    const video = videoRef.current;

    if (!video) return;

    try {
      if (soundOn) {
        video.muted = true;
        video.volume = 0;
        setSoundOn(false);
      } else {
        video.muted = false;
        video.volume = 1;

        await video.play();

        setSoundOn(true);
      }
    } catch (error) {
      console.error("Video audio error:", error);
    }
  };

  return (
    <section className="hero-visual">
      <div className="hero-video-container">

        <video
          ref={videoRef}
          className="hero-video"
          src="/videos/retina-ai.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />

        <div className="hero-video-overlay" />

        <div className="ai-status">
          <span className="status-dot" />
          AI ANALYSIS ACTIVE
        </div>

        <button
          type="button"
          className="video-sound-button"
          onClick={toggleSound}
          aria-label={soundOn ? "Mute video" : "Unmute video"}
        >
          {soundOn ? "🔊" : "🔇"}
        </button>

      </div>
    </section>
  );
}