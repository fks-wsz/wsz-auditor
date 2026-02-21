import { createApp } from '../shared/app';
import { initTheme } from '../shared/store';
import './styles/main.css';

// 获取服务端注入的初始状态
declare global {
  interface Window {
    __INITIAL_STATE__: any;
  }
}

// 初始化主题
initTheme();

// 创建应用实例
const { app } = createApp(window.__INITIAL_STATE__);

// 挂载应用（客户端水合）
app.$mount('#app');
