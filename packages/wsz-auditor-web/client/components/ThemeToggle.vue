<template>
  <button
    class="theme-toggle glass-card"
    :aria-label="'Toggle theme'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="handleToggle">
    <span class="theme-toggle__icon">{{ isDark ? '🌙' : '☀️' }}</span>
  </button>
</template>

<script lang="ts">
import Vue from 'vue';
import { useState, toggleTheme } from '../../shared/store';

export default Vue.extend({
  name: 'ThemeToggle',

  computed: {
    theme(): string {
      return useState().theme;
    },
    isDark(): boolean {
      return this.theme === 'dark';
    },
  },

  methods: {
    handleToggle() {
      toggleTheme();
    },
  },
});
</script>

<style scoped>
/* ThemeToggle specific styles are handled by layout.css */
</style>
