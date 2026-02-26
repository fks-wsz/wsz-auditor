<template>
  <div id="app">
    <!-- 动画背景 -->
    <div class="animated-background">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- 主题切换按钮 -->
    <ThemeToggle />
    <ReturnHome />

    <!-- 主内容 -->
    <main class="main-content">
      <LandingPage v-if="state.currentView === 'home'" />
      <AuditDashboard v-else />
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AuditDashboard from './components/AuditDashboard.vue';
import ThemeToggle from './components/ThemeToggle.vue';
import ReturnHome from './components/ReturnHome.vue';
import LandingPage from './components/LandingPage.vue';
import { useState } from '../shared/store';

export default Vue.extend({
  name: 'App',

  provide: {
    globalState: useState(),
  },
  components: {
    AuditDashboard,
    ThemeToggle,
    LandingPage,
    ReturnHome,
  },

  data() {
    return {
      state: useState(),
    };
  },

  mounted() {
    // const eventSource = new EventSource('/api/audit-stream', {
    //   withCredentials: true,
    // });
    // eventSource.addEventListener('progress', (event) => {
    //   console.log(event.data);
    // });
    // eventSource.addEventListener('done', (event) => {
    //   console.log(event.data);
    //   eventSource.close();
    // });
  },
});
</script>

<style>
/* 
 * 注意：这里不使用 scoped，因为这些是全局样式
 * 动画和背景样式从 animations.css 和 layout.css 导入
 */
</style>
