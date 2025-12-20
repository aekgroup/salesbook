import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { SalesPage } from '../features/sales/pages/SalesPage';
import { StatusesPage } from '../features/statuses/pages/StatusesPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { PreferencesPage } from '../features/preferences/pages/PreferencesPage';
import { PageLoader } from '../shared/ui/PageLoader';

export const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/statuses" element={<StatusesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Suspense>
  );
};
