import Vue from 'vue';
import App from '../client/App.vue';
import { setState } from './store';

export function createApp(context?: any) {
  // Initialize state from SSR context
  if (context && context.state) {
    setState(context.state);
  }

  const app = new Vue({
    render: (h) => h(App),
  });

  return { app };
}
