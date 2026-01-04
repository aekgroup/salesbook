import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { DataProviderProvider, SupabaseDataProvider } from '../data/dataProvider';
import { ToastProvider } from '../shared/ui/ToastProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
    mutations: {
      onError: (error) => {
        console.error(error);
      },
    },
  },
});

export const AppProviders = () => {
  const dataProvider = useMemo(() => new SupabaseDataProvider(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <DataProviderProvider value={dataProvider}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DataProviderProvider>
      </ToastProvider>
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
};
