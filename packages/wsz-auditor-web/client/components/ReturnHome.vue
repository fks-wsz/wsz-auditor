<template>
  <button class="return-home glass-card" aria-label="返回首页" title="返回首页" @click="onClickReturnHome">
    <span>🏠</span>
  </button>
</template>

<script lang="ts">
import Vue from 'vue';
import { useState } from '../../shared/store';

export default Vue.extend({
  name: 'ReturnHome',

  inject: ['globalState'],

  computed: {
    theme(): string {
      return useState().theme;
    },
    isDark(): boolean {
      return this.theme === 'dark';
    },
  },

  methods: {
    onClickReturnHome() {
      // @ts-ignore
      this.globalState.currentView = 'home';
    },
  },
});
</script>

<style scoped>
/* ThemeToggle specific styles are handled by layout.css */
</style>
