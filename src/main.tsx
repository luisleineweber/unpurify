import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './i18n/LanguageProvider';
import './styles.css';
import './language.css';
import './mobile.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><LanguageProvider><App /></LanguageProvider></React.StrictMode>,
);
