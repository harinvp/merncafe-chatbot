import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthProvider from "./components/AuthProvider";
import TrolleyProvider from "./components/TrolleyProvider";
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
      <TrolleyProvider>
        <App />
        </TrolleyProvider>
      </AuthProvider>
    
    </Router>
  </React.StrictMode >
);

reportWebVitals();
