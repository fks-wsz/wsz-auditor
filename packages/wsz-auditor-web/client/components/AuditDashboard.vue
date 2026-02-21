<template>
  <div class="audit-dashboard">
    <header class="dashboard-header glass-card">
      <div class="dashboard-header__content">
        <h1 class="dashboard-header__title">依赖安全审计报告</h1>
        <p class="dashboard-header__subtitle">
          <span class="package-name">{{ packageInfo.name }}</span>
          <span class="package-version">v{{ packageInfo.version }}</span>
        </p>
      </div>
    </header>

    <div class="summary-cards">
      <div class="summary-card glass-card">
        <div class="summary-card__value">{{ summary.total }}</div>
        <div class="summary-card__label">总漏洞</div>
      </div>
      <div class="summary-card glass-card severity-critical">
        <div class="summary-card__value">{{ summary.critical }}</div>
        <div class="summary-card__label">严重</div>
      </div>
      <div class="summary-card glass-card severity-high">
        <div class="summary-card__value">{{ summary.high }}</div>
        <div class="summary-card__label">高危</div>
      </div>
      <div class="summary-card glass-card severity-moderate">
        <div class="summary-card__value">{{ summary.moderate }}</div>
        <div class="summary-card__label">中危</div>
      </div>
      <div class="summary-card glass-card severity-low">
        <div class="summary-card__value">{{ summary.low }}</div>
        <div class="summary-card__label">低危</div>
      </div>
    </div>

    <VulnerabilityList :audit-result="state.auditResult" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import VulnerabilityList from './VulnerabilityList.vue';
import { useState } from '../../shared/store';

export default Vue.extend({
  name: 'AuditDashboard',

  components: {
    VulnerabilityList,
  },

  computed: {
    state() {
      return useState();
    },
    summary() {
      return this.state.auditResult?.summary || { total: 0, critical: 0, high: 0, moderate: 0, low: 0 };
    },
    packageInfo() {
      return this.state.packageInfo || { name: 'Unknown', version: '0.0.0' };
    },
  },
});
</script>

<style scoped>
/* Dashboard styles are in layout.css */
</style>
