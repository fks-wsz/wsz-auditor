<template>
  <div id="app">
    <!-- Animated background -->
    <div class="animated-background">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- Theme toggle button -->
    <ThemeToggle />
    <ReturnHome />

    <!-- Main content -->
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
 * Note: scoped is not used here as these are global styles
 * Animation and background styles are imported from animations.css and layout.css
 */
</style>
