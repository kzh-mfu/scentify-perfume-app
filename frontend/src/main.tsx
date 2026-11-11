/*
 * Team member: Kyaw Zin Htike (6831503011)
 * Frontend tasks: application entry point, routing setup, and frontend bootstrapping.
 */
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
