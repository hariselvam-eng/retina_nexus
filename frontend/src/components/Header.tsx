import {
  Bell,
  ChevronDown,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import '../styles/header.css';
export function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="relative z-30 mb-6">
      <div className="premium-header">
        {/* Left */}
        <div className="min-w-0">
          <div className="header-breadcrumb">
            <span>RETINA NEXUS</span>
            <span className="header-slash">/</span>
            <span className="header-current">CLINICAL WORKSPACE</span>
          </div>

          <h1 className="header-title">
            Clinical intelligence workspace
          </h1>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Notification */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((value) => !value);
                setProfileOpen(false);
              }}
              className="header-icon-button"
              aria-label="Notifications"
            >
              <Bell size={17} />

              {/* Notification indicator */}
              <span className="notification-dot" />
            </button>

            {notificationsOpen && (
              <div className="header-dropdown notification-dropdown">
                <div className="dropdown-header">
                  <div>
                    <p className="dropdown-title">Notifications</p>
                    <p className="dropdown-subtitle">
                      Workspace activity
                    </p>
                  </div>

                  <span className="notification-count">2</span>
                </div>

                <div className="notification-item">
                  <div className="notification-icon warning">
                    <ShieldCheck size={15} />
                  </div>

                  <div>
                    <p className="notification-item-title">
                      Human review required
                    </p>
                    <p className="notification-item-text">
                      A screening requires clinical review.
                    </p>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-icon success">
                    <ShieldCheck size={15} />
                  </div>

                  <div>
                    <p className="notification-item-title">
                      System operational
                    </p>
                    <p className="notification-item-text">
                      Workspace services are available.
                    </p>
                  </div>
                </div>

                <div className="dropdown-footer">
                  Notifications are workspace-only
                </div>
              </div>
            )}
          </div>

          {/* Workspace */}
          <div className="workspace-pill">
            <div className="workspace-shield">
              <ShieldCheck size={15} />
            </div>

            <div className="hidden sm:block">
              <p className="workspace-label">WORKSPACE</p>
              <p className="workspace-name">Clinical</p>
            </div>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((value) => !value);
                setNotificationsOpen(false);
              }}
              className="profile-button"
              aria-label="User profile"
            >
              <span className="profile-avatar">CT</span>
              <ChevronDown
                size={14}
                className={`hidden text-slate-400 transition-transform sm:block ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {profileOpen && (
              <div className="header-dropdown profile-dropdown">
                <div className="profile-summary">
                  <div className="profile-avatar large">
                    CT
                  </div>

                  <div>
                    <p className="dropdown-title">
                      Care Team
                    </p>
                    <p className="dropdown-subtitle">
                      Clinical workspace
                    </p>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <button type="button" className="profile-menu-item">
                  <UserRound size={15} />
                  <span>Profile</span>
                </button>

                <button type="button" className="profile-menu-item">
                  <ShieldCheck size={15} />
                  <span>Access & permissions</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  type="button"
                  className="profile-menu-item danger"
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}