import { createApp } from '../shared/app';
import { initTheme } from '../shared/store';
import './styles/main.css';

// Get initial state injected from server
declare global {
  interface Window {
    __INITIAL_STATE__: any;
  }
}

// Initialize theme
initTheme();

// Create app instance
const { app } = createApp(window.__INITIAL_STATE__);

// Mount app (client hydration)
app.$mount('#app');
