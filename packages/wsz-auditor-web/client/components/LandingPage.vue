<template>
  <div class="landing-page">
    <div class="landing-card">
      <!-- 装饰性圆角边框 -->
      <div class="landing-card__inner">
        <!-- 品牌标题 -->
        <h1 class="landing-title">WSZ-Auditor</h1>

        <!-- 副标题 -->
        <h2 class="landing-subtitle">智能项目依赖安全审查工具</h2>

        <!-- 描述文字 -->
        <p class="landing-description">
          基于 Node.js 与 npm 构建的安全依赖审查工具，集成 MCP Server 与可视化界面，支持
          依赖链全面梳理与风险识别，帮助开发者快速定位潜在漏洞，提升供应链安全治理效率。
        </p>

        <!-- 开始按钮 -->
        <button class="landing-btn" @click="handleStart"> 开始-&gt; </button>
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

/* 手写风格品牌标题 */
.landing-title {
  font-family: 'Caveat', 'Dancing Script', cursive;
  font-size: 5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
  line-height: 1.2;
  margin-bottom: 0;
}

/* 渐变色副标题 */
.landing-subtitle {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #f87171, #fb923c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
  margin-bottom: 0;
}

/* 描述段落 */
.landing-description {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
  max-width: 800px;
  margin-bottom: 0;
}

/* 开始按钮 */
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

/* 响应式适配 */
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
