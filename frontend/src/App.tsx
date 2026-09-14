import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';

import { AnalyticsPage } from './pages/AnalyticsPage';
import { DashboardPage } from './pages/DashboardPage';
import { DatasetManagementPage } from './pages/DatasetManagementPage';
import { DemoPage } from './pages/DemoPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import LandingPage from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { NewScreeningPage } from './pages/NewScreeningPage';
import { PatientsPage } from './pages/PatientsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ResultsPage } from './pages/ResultsPage';
import { ReviewPage } from './pages/ReviewPage';
import { ScreeningHistoryPage } from './pages/ScreeningHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>

      {/* =========================
          LANDING PAGE
      ========================= */}
      <Route path="/" element={<LandingPage />} />

      {/* =========================
          LOGIN PAGE
      ========================= */}
      <Route path="/login" element={<LoginPage />} />

      {/* =========================
          MAIN APPLICATION
      ========================= */}
      <Route path="/app" element={<AppLayout />}>

        {/* Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* Screening */}
        <Route
          path="screening/new"
          element={<NewScreeningPage />}
        />

        <Route
          path="screening/results"
          element={<ResultsPage />}
        />

        <Route
          path="screening/explain"
          element={<ExplainabilityPage />}
        />

        {/* Workspace */}
        <Route
          path="history"
          element={<ScreeningHistoryPage />}
        />

        <Route
          path="patients"
          element={<PatientsPage />}
        />

        {/* Clinical */}
        <Route
          path="review"
          element={<ReviewPage />}
        />

        <Route
          path="reports"
          element={<ReportsPage />}
        />

        {/* Intelligence */}
        <Route
          path="analytics"
          element={<AnalyticsPage />}
        />

        <Route
          path="monitoring"
          element={<MonitoringPage />}
        />

        {/* Administration */}
        <Route
          path="datasets"
          element={<DatasetManagementPage />}
        />

        <Route
          path="settings"
          element={<SettingsPage />}
        />

        {/* Demo */}
        <Route
          path="demo"
          element={<DemoPage />}
        />

      </Route>


      {/* =====================================================
          COMPATIBILITY ROUTES
          Old buttons can continue using /screening/new etc.
          They will automatically enter the application.
      ===================================================== */}

      <Route
        path="/screening/new"
        element={<Navigate to="/app/screening/new" replace />}
      />

      <Route
        path="/screening/results"
        element={<Navigate to="/app/screening/results" replace />}
      />

      <Route
        path="/screening/explain"
        element={<Navigate to="/app/screening/explain" replace />}
      />

      <Route
        path="/history"
        element={<Navigate to="/app/history" replace />}
      />

      <Route
        path="/patients"
        element={<Navigate to="/app/patients" replace />}
      />

      <Route
        path="/review"
        element={<Navigate to="/app/review" replace />}
      />

      <Route
        path="/reports"
        element={<Navigate to="/app/reports" replace />}
      />

      <Route
        path="/analytics"
        element={<Navigate to="/app/analytics" replace />}
      />

      <Route
        path="/monitoring"
        element={<Navigate to="/app/monitoring" replace />}
      />

      <Route
        path="/datasets"
        element={<Navigate to="/app/datasets" replace />}
      />

      <Route
        path="/settings"
        element={<Navigate to="/app/settings" replace />}
      />

      <Route
        path="/demo"
        element={<Navigate to="/app/demo" replace />}
      />


      {/* =========================
          UNKNOWN ROUTES
      ========================= */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  
  );

}