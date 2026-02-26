<template>
  <div class="audit-dashboard">
    <!-- 顶部交互区域 -->
    <div class="hero-area" :class="{ 'hero-area--started': hasStarted, 'hero-area--done': isDone }">
      <!-- 进度文字层（提交后显示，位于输入框上方） -->
      <transition name="fade-slide">
        <div v-if="hasStarted" class="status-area">
          <transition name="fade-slide" mode="out-in">
            <p :key="statusText" class="status-text">{{ statusText }}</p>
          </transition>
        </div>
      </transition>

      <!-- 输入层（始终显示，提交后下移） -->
      <div class="input-bar" :class="{ 'input-bar--shifted': hasStarted }">
        <div class="input-bar__inner glass-card">
          <input
            v-model="inputUrl"
            class="input-bar__input"
            type="text"
            placeholder="输入项目路径或仓库链接…"
            :disabled="isLoading"
            @keydown.enter="startAudit" />
          <button class="input-bar__btn" :disabled="isLoading || !inputUrl.trim()" @click="startAudit">
            <span v-if="!isLoading">审查</span>
            <span v-else class="loading-spinner">⟳</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 结果区域（done 后淡入） -->
    <transition name="result-fade">
      <div v-if="isDone" class="result-area">
        <!-- 统计卡片 -->
        <div class="summary-cards">
          <div class="summary-card glass-card">
            <div class="summary-card__value">{{ totalRecord.total }}</div>
            <div class="summary-card__label">总漏洞</div>
          </div>
          <div class="summary-card glass-card severity-critical">
            <div class="summary-card__value">{{ totalRecord.critical }}</div>
            <div class="summary-card__label">严重</div>
          </div>
          <div class="summary-card glass-card severity-high">
            <div class="summary-card__value">{{ totalRecord.high }}</div>
            <div class="summary-card__label">高危</div>
          </div>
          <div class="summary-card glass-card severity-moderate">
            <div class="summary-card__value">{{ totalRecord.moderate }}</div>
            <div class="summary-card__label">中危</div>
          </div>
          <div class="summary-card glass-card severity-low">
            <div class="summary-card__value">{{ totalRecord.low }}</div>
            <div class="summary-card__label">低危</div>
          </div>
        </div>

        <!-- 图表区域 -->
        <AuditSummaryChart v-if="totalRecord.total > 0" :total-record="totalRecord" />

        <!-- 漏洞详情列表 -->
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
      this.statusText = '准备连接…';

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
        this.statusText = '完成！';
        this.isDone = true;
        this.isLoading = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
      });

      this.eventSource.onerror = () => {
        this.statusText = '连接出错，请稍后重试';
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
/* ---- 顶部交互区域 ---- */
.hero-area {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  z-index: 10;
  /* 不阻断底层鼠标事件，子元素单独开启 */
  pointer-events: none;
}

.hero-area > * {
  pointer-events: auto;
}

/* 提交后（审计进行中）：保持垂直居中 */
.hero-area--started {
  justify-content: center;
}

/* 审计完成后：退出 fixed，回到文档流，过渡到顶部 */
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

/* 输入条 */
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

/* Loading 旋转 */
.loading-spinner {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 进度文字 */
.status-area {
  width: 100%;
  text-align: center;
}

.status-text {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.15;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

/* 进度文字过渡：fade-slide */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.fade-slide-enter {
  opacity: 0;
  transform: translateY(-16px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

/* 结果区域淡入：result-fade */
.result-fade-enter-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.result-fade-enter {
  opacity: 0;
  transform: translateY(24px);
}
</style>
