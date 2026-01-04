import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { MainLayout } from './MainLayout';
import { PageLoader } from '../shared/ui/PageLoader';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { SalesPage } from '../features/sales/pages/SalesPage';
import { StatusesPage } from '../features/statuses/pages/StatusesPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { PreferencesPage } from '../features/preferences/pages/PreferencesPage';
import { PricingPage } from '../features/pricing/pages/PricingPage';
import { ExpensesPage } from '../features/expenses/pages/ExpensesPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}

function AuthenticatedApp() {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
      <Route path="/sales" element={<PrivateRoute><SalesPage /></PrivateRoute>} />
      <Route path="/statuses" element={<PrivateRoute><StatusesPage /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
      <Route path="/pricing" element={<PrivateRoute><PricingPage /></PrivateRoute>} />
      <Route path="/expenses" element={<PrivateRoute><ExpensesPage /></PrivateRoute>} />
      <Route path="/preferences" element={<PrivateRoute><PreferencesPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <AuthenticatedApp />
      </Suspense>
    </AuthProvider>
  );
}
