import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './app';
import { AppQueryProvider } from './providers/query-provider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppQueryProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppQueryProvider>
  </React.StrictMode>,
);
