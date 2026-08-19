import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import AppShell from './components/AppShell';
import ServerSetupPage from './pages/ServerSetupPage';
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

function Gate() {
  const { serverUrl, loaded } = useSettings();

  if (!loaded) return null;
  if (!serverUrl) return <ServerSetupPage />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/history" element={<ExpenseHistoryPage />} />
          <Route path="/add" element={<AddExpensePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/expenses/:id" element={<ExpenseDetailsPage />} />
          <Route path="/expenses/:id/edit" element={<AddExpensePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
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
