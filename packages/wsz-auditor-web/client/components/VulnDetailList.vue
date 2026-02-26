<template>
  <div class="vuln-detail-list">
    <h2 class="vuln-detail-list__title">漏洞详情</h2>

    <div v-for="severity in severityOrder" :key="severity" class="vuln-group">
      <template v-if="getItems(severity).length > 0">
        <!-- 分组标题（可折叠） -->
        <button class="vuln-group__header" :class="`vuln-group__header--${severity}`" @click="toggleGroup(severity)">
          <span class="vuln-group__badge" :class="`severity-bg-${severity}`">
            {{ severityLabel[severity] }}
          </span>
          <span class="vuln-group__count">{{ getItems(severity).length }} 个漏洞</span>
          <span class="vuln-group__arrow" :class="{ 'vuln-group__arrow--open': openGroups[severity] }">▾</span>
        </button>

        <!-- 漏洞列表 -->
        <transition name="accordion">
          <div v-if="openGroups[severity]" class="vuln-group__body">
            <div v-for="(item, idx) in getItems(severity)" :key="idx" class="vuln-item glass-card">
              <template v-if="isAdvisoryWithChain(item)">
                <!-- AdvisoryWithChain -->
                <div class="vuln-item__header">
                  <span class="vuln-item__severity-dot" :class="`dot-${item.problem.severity || severity}`"></span>
                  <span class="vuln-item__title">{{ item.problem.title }}</span>
                  <span class="vuln-item__badge" :class="`severity-bg-${item.problem.severity || severity}`">
                    {{ item.problem.severity || severity }}
                  </span>
                </div>
                <div class="vuln-item__meta">
                  <span class="vuln-item__meta-tag">📦 {{ item.problem.name }}</span>
                  <span v-if="item.problem.range" class="vuln-item__meta-tag">🔖 {{ item.problem.range }}</span>
                  <a
                    v-if="item.problem.url"
                    :href="item.problem.url"
                    target="_blank"
                    rel="noopener"
                    class="vuln-item__meta-tag vuln-item__link"
                    >🔗 Advisory</a
                  >
                </div>
                <div v-if="item.chain && item.chain.length > 0" class="vuln-item__chain">
                  <span class="vuln-item__chain-label">依赖链：</span>
                  <span class="vuln-item__chain-path">{{ item.chain.join(' → ') }}</span>
                </div>
              </template>

              <template v-else>
                <!-- Advisory (no chain) -->
                <div class="vuln-item__header">
                  <span class="vuln-item__severity-dot" :class="`dot-${item.severity || severity}`"></span>
                  <span class="vuln-item__title">{{ item.title }}</span>
                  <span class="vuln-item__badge" :class="`severity-bg-${item.severity || severity}`">
                    {{ item.severity || severity }}
                  </span>
                </div>
                <div class="vuln-item__meta">
                  <span class="vuln-item__meta-tag">📦 {{ item.name }}</span>
                  <span v-if="item.range" class="vuln-item__meta-tag">🔖 {{ item.range }}</span>
                  <a
                    v-if="item.url"
                    :href="item.url"
                    target="_blank"
                    rel="noopener"
                    class="vuln-item__meta-tag vuln-item__link"
                    >🔗 Advisory</a
                  >
                </div>
              </template>
            </div>
          </div>
        </transition>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

type Severity = 'critical' | 'high' | 'moderate' | 'low';

interface Advisory {
  name: string;
  id: string;
  dependency: string;
  type: string;
  url: string;
  title: string;
  severity: string;
  range: string;
  versions: string[];
  vulnerableVersions: string[];
  source: string | number;
}

interface AdvisoryWithChain {
  chain: string[];
  problem: Advisory;
}

export default Vue.extend({
  name: 'VulnDetailList',

  props: {
    vulnSortBySeverity: {
      type: Object as () => Record<Severity, Array<AdvisoryWithChain | Advisory>>,
      required: true,
    },
  },

  data() {
    const openGroups: Record<string, boolean> = {
      critical: true,
      high: true,
      moderate: false,
      low: false,
    };
    return {
      openGroups,
      severityOrder: ['critical', 'high', 'moderate', 'low'] as Severity[],
      severityLabel: {
        critical: '严重 Critical',
        high: '高危 High',
        moderate: '中危 Moderate',
        low: '低危 Low',
      } as Record<Severity, string>,
    };
  },

  methods: {
    getItems(severity: Severity): Array<AdvisoryWithChain | Advisory> {
      return this.vulnSortBySeverity[severity] || [];
    },

    isAdvisoryWithChain(item: AdvisoryWithChain | Advisory): item is AdvisoryWithChain {
      return 'problem' in item && 'chain' in item;
    },

    toggleGroup(severity: Severity) {
      this.$set(this.openGroups, severity, !this.openGroups[severity]);
    },
  },
});
</script>

<style scoped>
.vuln-detail-list {
  margin-top: var(--spacing-xl);
}

.vuln-detail-list__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

/* 分组 */
.vuln-group {
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.vuln-group__header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-glass);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast);
}

.vuln-group__header:hover {
  background: var(--color-bg-secondary);
}

/* 分组标题左侧彩色竖线 */
.vuln-group__header--critical {
  border-left: 4px solid var(--color-critical);
}
.vuln-group__header--high {
  border-left: 4px solid var(--color-high);
}
.vuln-group__header--moderate {
  border-left: 4px solid var(--color-moderate);
}
.vuln-group__header--low {
  border-left: 4px solid var(--color-low);
}

.vuln-group__count {
  flex: 1;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.vuln-group__arrow {
  font-size: 1.2rem;
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
  display: inline-block;
}

.vuln-group__arrow--open {
  transform: rotate(180deg);
}

/* 严重性徽标 */
.vuln-group__badge {
  padding: 0.2rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #fff;
}

.severity-bg-critical {
  background: var(--color-critical);
}
.severity-bg-high {
  background: var(--color-high);
}
.severity-bg-moderate {
  background: var(--color-moderate);
  color: #333;
}
.severity-bg-low {
  background: var(--color-low);
  color: #333;
}

/* 展开动画 */
.accordion-enter-active,
.accordion-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);
  overflow: hidden;
}

.accordion-enter,
.accordion-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 漏洞分组内容 */
.vuln-group__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
}

/* 单条漏洞卡片 */
.vuln-item {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-radius: var(--radius-md);
  transition: box-shadow var(--transition-fast);
}

.vuln-item__header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.vuln-item__severity-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-critical {
  background: var(--color-critical);
}
.dot-high {
  background: var(--color-high);
}
.dot-moderate {
  background: var(--color-moderate);
}
.dot-low {
  background: var(--color-low);
}

.vuln-item__title {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
  word-break: break-word;
}

.vuln-item__badge {
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #fff;
  white-space: nowrap;
}

.vuln-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.vuln-item__meta-tag {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  background: rgba(128, 128, 128, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
}

.vuln-item__link {
  text-decoration: none;
  color: var(--color-primary);
  transition: opacity var(--transition-fast);
}

.vuln-item__link:hover {
  opacity: 0.75;
}

/* 依赖链 */
.vuln-item__chain {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: baseline;
}

.vuln-item__chain-label {
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.vuln-item__chain-path {
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

@media (max-width: 768px) {
  .vuln-item__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
