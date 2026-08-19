import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/AppShell';
import ServerSetupPage from './pages/ServerSetupPage';
import AccountSetupPage from './pages/AccountSetupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExpenseHistoryPage from './pages/ExpenseHistoryPage';
import AddExpensePage from './pages/AddExpensePage';
import ExpenseDetailsPage from './pages/ExpenseDetailsPage';
import ReportsPage from './pages/ReportsPage';
import MorePage from './pages/MorePage';
import CategoriesPage from './pages/CategoriesPage';
import ExportPage from './pages/ExportPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function AuthGate() {
  const { checking, accountConfigured, isAuthenticated, error } = useAuth();

  if (checking || accountConfigured === null) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      </div>
    );
  }

  if (!accountConfigured) return <AccountSetupPage />;
  if (!isAuthenticated) return <LoginPage />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<ExpenseHistoryPage />} />
          <Route path="/add" element={<AddExpensePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/expenses/:id" element={<ExpenseDetailsPage />} />
          <Route path="/expenses/:id/edit" element={<AddExpensePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Gate() {
  const { serverUrl, loaded } = useSettings();

  if (!loaded) return null;
  // Only the installed native app (Android APK) runs on a separate device from
  // the backend and needs an explicit address. The browser/PWA build always
  // talks to same-origin /api (see api/client.js), so it works with zero setup.
  if (Capacitor.isNativePlatform() && !serverUrl) return <ServerSetupPage />;

  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <Gate />
      </SettingsProvider>
    </QueryClientProvider>
  );
}
