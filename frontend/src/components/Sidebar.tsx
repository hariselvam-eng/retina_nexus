import {
  Activity,
  BarChart3,
  ClipboardCheck,
  Database,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Upload,
  X,
  Users,
} from 'lucide-react';

import { NavLink, useNavigate } from 'react-router-dom';
import { BrandMark } from './BrandMark';

const primaryNav = [
  {
    label: 'Dashboard',
    to: '/app',
    icon: LayoutDashboard,
  },
  {
    label: 'New screening',
    to: '/app/screening/new',
    icon: Upload,
  },
  {
    label: 'Patients',
    to: '/app/patients',
    icon: Users,
  },
  {
    label: 'Screening history',
    to: '/app/history',
    icon: History,
  },
];

const clinicalNav = [
  {
    label: 'Clinical review',
    to: '/app/review',
    icon: ClipboardCheck,
  },
  {
    label: 'Reports',
    to: '/app/reports',
    icon: FileText,
  },
];

const systemNav = [
  {
    label: 'Analytics',
    to: '/app/analytics',
    icon: BarChart3,
  },
  {
    label: 'Model monitoring',
    to: '/app/monitoring',
    icon: Activity,
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('retina_nexus_access_token');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="sidebar-backdrop"
        />
      )}

      <aside className={`app-sidebar ${open ? 'sidebar-open' : ''}`}>
        {/* Sidebar header */}
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <BrandMark dark />
          </div>

          <button
            aria-label="Close navigation"
            onClick={onClose}
            className="sidebar-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="sidebar-scroll">
          {/* Workspace */}
          <SidebarGroup
            title="Workspace"
            items={primaryNav}
          />

          {/* Clinical */}
          <SidebarGroup
            title="Clinical"
            items={clinicalNav}
          />

          {/* Intelligence */}
          <SidebarGroup
            title="Intelligence"
            items={systemNav}
          />

          {/* Administration */}
          <div className="sidebar-section">
            <div className="sidebar-section-label">
              Administration
            </div>

            <nav className="sidebar-nav">
              <NavItem
                label="Data governance"
                to="/app/datasets"
                icon={Database}
              />

              <NavItem
                label="Settings"
                to="/app/settings"
                icon={Settings}
              />
            </nav>
          </div>
        </div>

        {/* Bottom user section */}
        <div className="sidebar-bottom">
          <div className="user-panel">
            <div className="user-avatar">
              CT
            </div>

            <div className="user-info">
              <span className="user-name">
                Signed-in user
              </span>

              <span className="user-role">
                Care team
              </span>
            </div>

            <button
              aria-label="Sign out"
              onClick={handleLogout}
              className="logout-button"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* System status */}
          <div className="sidebar-system">
            <span className="system-dot" />
            <span>Systems operational</span>
          </div>
        </div>
      </aside>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar Group                                                              */
/* -------------------------------------------------------------------------- */

function SidebarGroup({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    to: string;
    icon: typeof Activity;
  }[];
}) {
  return (
    <div className="sidebar-section">
      <div className="sidebar-section-label">
        {title}
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavItem
            key={item.to}
            {...item}
          />
        ))}
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation Item                                                            */
/* -------------------------------------------------------------------------- */

function NavItem({
  label,
  to,
  icon: Icon,
}: {
  label: string;
  to: string;
  icon: typeof Activity;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `sidebar-nav-item ${
          isActive ? 'active' : ''
        }`
      }
    >
      <span className="nav-icon">
        <Icon
          size={17}
          strokeWidth={1.8}
        />
      </span>

      <span className="nav-label">
        {label}
      </span>

      <span className="nav-active-light" />
    </NavLink>
  );
}