import Vue from 'vue';
import App from '../client/App.vue';
import { setState } from './store';

export function createApp(context?: any) {
  // 从 SSR context 初始化状态
  if (context && context.state) {
    setState(context.state);
  }

  const app = new Vue({
    render: (h) => h(App),
  });

  return { app };
}
