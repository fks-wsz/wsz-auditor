import Vue from 'vue';

export interface State {
  auditResult: any;
  packageInfo: any;
  theme: 'light' | 'dark';
}

const state = Vue.observable<State>({
  auditResult: { vulnerabilities: {}, summary: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 } },
  packageInfo: { name: '', version: '' },
  theme: 'light',
});

export function useState() {
  return state;
}

export function setState(newState: Partial<State>) {
  Object.assign(state, newState);
}

export function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
  }
}

export function initTheme() {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      state.theme = savedTheme;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      state.theme = prefersDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', state.theme);
  }
}
