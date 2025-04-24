
import React from 'react'; // Explicit React import
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Use the non-null assertion operator to tell TypeScript the element exists
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

root.render(<App />);
