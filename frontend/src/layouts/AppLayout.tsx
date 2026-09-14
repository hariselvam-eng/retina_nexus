import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ChatBot } from '../components/ChatBot';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <div className="app-atmosphere" />

      <div className="app-layout">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="app-content">
          <Header onMenu={() => setSidebarOpen(true)} />

          <main className="app-main">
            <div className="app-container">
              <Outlet />
            </div>
          </main>

          <footer className="app-footer">
            <span>RETINA NEXUS</span>
            <span className="footer-separator">•</span>
            <span>Clinical intelligence workspace</span>
            <span className="footer-separator">•</span>
            <span>AI output requires clinical review</span>
          </footer>
        </div>
      </div>

      {/* Global chatbot - available throughout the application */}
      <ChatBot />
    </div>
  );
}