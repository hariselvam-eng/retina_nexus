import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="landing-navbar">
      <div className="landing-navbar-inner">

        <Link to="/" className="landing-brand">
          RETINA NEXUS
        </Link>

        <nav className="landing-nav">
          <a href="#technology">Technology</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#explainable-ai">Explainable AI</a>
          <a href="#research">Research</a>

          <Link to="/login" className="landing-nav-cta">
            Launch Platform
          </Link>
        </nav>

      </div>
    </header>
  );
}