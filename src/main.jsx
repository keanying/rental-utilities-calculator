import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { Toaster } from '@/components/ui/sonner';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);