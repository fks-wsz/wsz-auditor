<template>
  <div class="package-card glass-card">
    <div class="package-card__header">
      <h3 class="package-card__name">{{ packageName }}</h3>
      <span class="package-card__badge" :class="`severity-${maxSeverity}`">
        {{ maxSeverity }}
      </span>
    </div>
    <div class="package-card__body">
      <p class="package-card__count">{{ totalProblems }} 个漏洞</p>
      <div class="package-card__versions">
        <div v-for="pkg in packages" :key="pkg.name" class="version-item">
          <span class="version-item__name">{{ pkg.name }}</span>
          <span class="version-item__problems">{{ pkg.problems?.length || 0 }} 个问题</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import type { NormalizedPackageInfo } from '../../../src/audit/types/index';

export default Vue.extend({
  name: 'PackageCard',

  props: {
    packageName: {
      type: String,
      required: true,
    },
    packages: {
      type: Array as PropType<NormalizedPackageInfo[]>,
      required: true,
    },
  },

  computed: {
    totalProblems(): number {
      return this.packages.reduce((sum, pkg) => sum + (pkg.problems?.length || 0), 0);
    },
    maxSeverity(): string {
      const severities = this.packages.map((pkg) => pkg.severity).filter(Boolean);
      if (severities.includes('critical')) return 'critical';
      if (severities.includes('high')) return 'high';
      if (severities.includes('moderate')) return 'moderate';
      if (severities.includes('low')) return 'low';
      return 'info';
    },
  },
});
</script>

<style scoped>
.package-card {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.package-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.package-card__name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  word-break: break-word;
  flex: 1;
}

.package-card__badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  color: white;
}

.package-card__badge.severity-critical {
  background: var(--color-critical);
}

.package-card__badge.severity-high {
  background: var(--color-high);
}

.package-card__badge.severity-moderate {
  background: var(--color-moderate);
}

.package-card__badge.severity-low {
  background: var(--color-low);
}

.package-card__badge.severity-info {
  background: var(--color-info);
}

.package-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.package-card__count {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.package-card__versions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(var(--color-primary), 0.05);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-primary);
  transition: background var(--transition-fast);
}

.version-item:hover {
  background: rgba(var(--color-primary), 0.1);
}

.version-item__name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  font-family: 'Courier New', monospace;
}

.version-item__problems {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .package-card {
    padding: var(--spacing-md);
  }

  .package-card__name {
    font-size: 1.125rem;
  }
}
</style>
