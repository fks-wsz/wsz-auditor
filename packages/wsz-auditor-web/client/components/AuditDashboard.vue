<template>
  <div class="audit-dashboard">
    <!-- Top interaction area -->
    <div class="hero-area" :class="{ 'hero-area--started': hasStarted, 'hero-area--done': isDone }">
      <!-- Progress text layer (shown after submission, above the input) -->
      <transition name="fade-slide">
        <div v-if="hasStarted" class="status-area">
          <transition name="fade-slide" mode="out-in">
            <p :key="statusText" class="status-text">{{ statusText }}</p>
          </transition>
        </div>
      </transition>

      <!-- Input layer (always shown, moves down after submission) -->
      <div class="input-bar" :class="{ 'input-bar--shifted': hasStarted }">
        <div class="input-bar__inner glass-card">
          <input
            v-model="inputUrl"
            class="input-bar__input"
            type="text"
            placeholder="Enter project path or repository URL..."
            :disabled="isLoading"
            @keydown.enter="startAudit" />
          <button class="input-bar__btn" :disabled="isLoading || !inputUrl.trim()" @click="startAudit">
            <span v-if="!isLoading">Audit</span>
            <span v-else class="loading-spinner">⟳</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Result area (fade in after done) -->
    <transition name="result-fade">
      <div v-if="isDone" class="result-area">
        <!-- Summary cards -->
        <div class="summary-cards">
          <div class="summary-card glass-card">
            <div class="summary-card__value">{{ totalRecord.total }}</div>
            <div class="summary-card__label">Total Vulnerabilities</div>
          </div>
          <div class="summary-card glass-card severity-critical">
            <div class="summary-card__value">{{ totalRecord.critical }}</div>
            <div class="summary-card__label">Critical</div>
          </div>
          <div class="summary-card glass-card severity-high">
            <div class="summary-card__value">{{ totalRecord.high }}</div>
            <div class="summary-card__label">High</div>
          </div>
          <div class="summary-card glass-card severity-moderate">
            <div class="summary-card__value">{{ totalRecord.moderate }}</div>
            <div class="summary-card__label">Moderate</div>
          </div>
          <div class="summary-card glass-card severity-low">
            <div class="summary-card__value">{{ totalRecord.low }}</div>
            <div class="summary-card__label">Low</div>
          </div>
        </div>

        <!-- Chart area -->
        <AuditSummaryChart v-if="totalRecord.total > 0" :total-record="totalRecord" />

        <!-- Vulnerability details list -->
        <VulnDetailList
          v-if="state.auditResult && state.auditResult.vulnSortBySeverity"
          :vuln-sort-by-severity="state.auditResult.vulnSortBySeverity" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AuditSummaryChart from './AuditSummaryChart.vue';
import VulnDetailList from './VulnDetailList.vue';
import { useState, setState } from '../../shared/store';

export default Vue.extend({
  name: 'AuditDashboard',

  components: {
    AuditSummaryChart,
    VulnDetailList,
  },

  data() {
    return {
      inputUrl: '',
      isLoading: false,
      hasStarted: false,
      isDone: false,
      statusText: '',
      eventSource: null as EventSource | null,
    };
  },

  computed: {
    state() {
      return useState();
    },
    totalRecord(): Record<string, number> {
      return (
        this.state.auditResult?.metadata?.totalRecord || {
          total: 0,
          critical: 0,
          high: 0,
          moderate: 0,
          low: 0,
        }
      );
    },
  },

  beforeDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  },

  methods: {
    startAudit() {
      if (!this.inputUrl.trim() || this.isLoading) return;
      this.hasStarted = true;
      this.isLoading = true;
      this.isDone = false;
      this.statusText = 'Connecting...';

      const url = `/api/audit-stream?url=${encodeURIComponent(this.inputUrl.trim())}`;
      this.eventSource = new EventSource(url);

      this.eventSource.addEventListener('progress', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.statusText = data.message || '';
        } catch (_) {}
      });

      this.eventSource.addEventListener('done', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          setState({ auditResult: data.result });
        } catch (_) {}
        this.statusText = 'Completed!';
        this.isDone = true;
        this.isLoading = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
      });

      this.eventSource.addEventListener('error', (e: Event) => {
        let message = 'Audit failed, please try again later';
        if (e instanceof MessageEvent) {
          try {
            const data = JSON.parse(e.data);
            message = data.message || message;
          } catch (_) {}
        }
        this.statusText = message;
        this.isLoading = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
      });

      this.eventSource.onerror = (e: Event) => {
        let message = 'Connection error, please try again later';
        if (e instanceof MessageEvent) {
          try {
            const data = JSON.parse(e.data);
            message = data.message || message;
          } catch (_) {}
        }
        this.statusText = message;
        this.isLoading = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
      };
    },
  },
});
</script>

<style scoped>
/* ---- Top interaction area ---- */
.hero-area {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  z-index: 10;
  /* Do not block underlying mouse events, child elements enable separately */
  pointer-events: none;
}

.hero-area > * {
  pointer-events: auto;
}

/* After submission (audit in progress): keep vertically centered */
.hero-area--started {
  justify-content: center;
}

/* After audit completed: exit fixed, return to document flow, transition to top */
.hero-area--done {
  position: relative;
  inset: auto;
  justify-content: flex-start;
  padding-top: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  z-index: auto;
  pointer-events: auto;
  transition: padding-top var(--transition-slow);
}

/* Input bar */
.input-bar {
  width: 100%;
  max-width: 680px;
  transition: transform var(--transition-slow);
}

.input-bar--shifted {
  transform: translateY(8px);
}

.input-bar__inner {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
}

.input-bar__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.125rem;
  color: var(--color-text-primary);
  caret-color: var(--color-primary);
}

.input-bar__input::placeholder {
  color: var(--color-text-muted);
}

.input-bar__btn {
  padding: 0.5rem 1.4rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  white-space: nowrap;
}

.input-bar__btn:hover:not(:disabled) {
  opacity: 0.88;
  transform: translateY(-1px);
}

.input-bar__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading spin */
.loading-spinner {

/* Status text */
.status-area {

/* Status text transition: fade-slide */
.fade-slide-enter-active,
.fade-slide-leave-active {

.fade-slide-enter {

.fade-slide-leave-to {

/* Result area fade in: result-fade */
.result-fade-enter-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.result-fade-enter {
  opacity: 0;
  transform: translateY(24px);
}
</style>
