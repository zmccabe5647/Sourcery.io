import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App.tsx';

const container = document.getElementById('dashboard-root');
const root = createRoot(container);
root.render(<App />);