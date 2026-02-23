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
import LandingPage from './components/LandingPage.vue';
import { useState } from '../shared/store';

export default Vue.extend({
  name: 'App',

  components: {
    AuditDashboard,
    ThemeToggle,
    LandingPage,
  },

  data() {
    return {
      state: useState(),
    };
  },
});
</script>

<style>
/* 
 * 注意：这里不使用 scoped，因为这些是全局样式
 * 动画和背景样式从 animations.css 和 layout.css 导入
 */
</style>
