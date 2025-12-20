import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AppProviders } from './app/AppProviders';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Unable to find root element');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>,
);
