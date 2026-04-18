<template>
  <div class="landing-page">
    <div class="landing-card">
      <!-- Decorative rounded border -->
      <div class="landing-card__inner">
        <!-- Brand title -->
        <h1 class="landing-title">WSZ-Auditor</h1>

        <!-- Subtitle -->
        <h2 class="landing-subtitle">Intelligent Dependency Security Auditor</h2>

        <!-- Description -->
        <p class="landing-description">
          A dependency security auditing tool built on Node.js and npm, integrated with an MCP Server and a
          visualization interface. It supports full dependency chain analysis and risk identification to help developers
          quickly locate potential vulnerabilities and improve software supply chain security.
        </p>

        <!-- Start button -->
        <button class="landing-btn" @click="handleStart"> Start-&gt; </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { navigateTo } from '../../shared/store';

export default Vue.extend({
  name: 'LandingPage',

  methods: {
    handleStart() {
      navigateTo('dashboard');
    },
  },
});
</script>

<style scoped>
.landing-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--spacing-lg) * 2);
}

.landing-card {
  width: 100%;
  padding: 0;
  animation: landingFadeIn 0.8s ease both;
}

.landing-card__inner {
  padding: 3.5rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  text-align: center;
}

/* Handwritten style brand title */
.landing-title {

/* Gradient subtitle */
.landing-subtitle {

/* Description paragraph */
.landing-description {

/* Start button */
.landing-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 3.5rem;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-text-primary);
  background: transparent;
  border: 2px solid var(--color-text-primary);
  border-radius: 2rem;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: background var(--transition-base), color var(--transition-base), transform var(--transition-base),
    box-shadow var(--transition-base);
  margin-top: var(--spacing-sm);
}

.landing-btn:hover {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.landing-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

@keyframes landingFadeIn {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive adaptation */
@media (max-width: 768px) {
  .landing-card__inner {
    padding: 2.5rem 1.5rem;
  }

  .landing-title {
    font-size: 2.25rem;
  }

  .landing-subtitle {
    font-size: 1.375rem;
  }
}
</style>
