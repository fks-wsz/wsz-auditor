<template>
  <div class="chart-section">
    <h2 class="chart-section__title">漏洞分布图表</h2>
    <div class="chart-grid">
      <div class="chart-card glass-card">
        <h3 class="chart-card__title">严重性占比</h3>
        <div class="chart-card__canvas-wrap">
          <canvas ref="doughnutCanvas"></canvas>
        </div>
      </div>
      <div class="chart-card glass-card">
        <h3 class="chart-card__title">各级漏洞数量</h3>
        <div class="chart-card__canvas-wrap">
          <canvas ref="barCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  BarController,
} from 'chart.js';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController);

const SEVERITY_LABELS = ['严重 (Critical)', '高危 (High)', '中危 (Moderate)', '低危 (Low)'];
const SEVERITY_KEYS = ['critical', 'high', 'moderate', 'low'] as const;
const CSS_VAR_MAP: Record<string, string> = {
  critical: '--color-critical',
  high: '--color-high',
  moderate: '--color-moderate',
  low: '--color-low',
};

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getColors(): string[] {
  return SEVERITY_KEYS.map((k) => getCssVar(CSS_VAR_MAP[k]));
}

export default Vue.extend({
  name: 'AuditSummaryChart',

  props: {
    totalRecord: {
      type: Object as () => Record<string, number>,
      required: true,
    },
  },

  data() {
    return {
      doughnutChart: null as Chart | null,
      barChart: null as Chart | null,
      themeObserver: null as MutationObserver | null,
    };
  },

  mounted() {
    if (typeof window === 'undefined') return;
    this.$nextTick(() => {
      this.initCharts();
      this.observeTheme();
    });
  },

  beforeDestroy() {
    if (this.doughnutChart) this.doughnutChart.destroy();
    if (this.barChart) this.barChart.destroy();
    if (this.themeObserver) this.themeObserver.disconnect();
  },

  methods: {
    getData(): number[] {
      return SEVERITY_KEYS.map((k) => this.totalRecord[k] ?? 0);
    },

    initCharts() {
      const colors = getColors();
      const data = this.getData();
      const borderColor = getCssVar('--color-border') || 'rgba(0,0,0,0.08)';

      // --- 甜甜圈图 ---
      const dCtx = (this.$refs.doughnutCanvas as HTMLCanvasElement).getContext('2d');
      if (dCtx) {
        this.doughnutChart = new Chart(dCtx, {
          type: 'doughnut',
          data: {
            labels: SEVERITY_LABELS,
            datasets: [
              {
                data,
                backgroundColor: colors,
                borderColor: borderColor,
                borderWidth: 2,
                hoverOffset: 10,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '62%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: getCssVar('--color-text-secondary'),
                  padding: 16,
                  font: { size: 13 },
                },
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
                },
              },
            },
          },
        });
      }

      // --- 横向条形图 ---
      const bCtx = (this.$refs.barCanvas as HTMLCanvasElement).getContext('2d');
      if (bCtx) {
        this.barChart = new Chart(bCtx, {
          type: 'bar',
          data: {
            labels: SEVERITY_LABELS,
            datasets: [
              {
                label: '漏洞数量',
                data,
                backgroundColor: colors,
                borderRadius: 6,
                borderSkipped: false,
              },
            ],
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` 数量: ${ctx.parsed.x}`,
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: getCssVar('--color-text-muted'),
                  stepSize: 1,
                },
                grid: {
                  color: 'rgba(128,128,128,0.12)',
                },
              },
              y: {
                ticks: {
                  color: getCssVar('--color-text-secondary'),
                  font: { size: 13 },
                },
                grid: { display: false },
              },
            },
          },
        });
      }
    },

    updateChartColors() {
      const colors = getColors();
      const textSecondary = getCssVar('--color-text-secondary');
      const textMuted = getCssVar('--color-text-muted');
      const borderColor = getCssVar('--color-border') || 'rgba(0,0,0,0.08)';

      if (this.doughnutChart) {
        const ds = this.doughnutChart.data.datasets[0] as any;
        ds.backgroundColor = colors;
        ds.borderColor = borderColor;
        const legend = this.doughnutChart.options.plugins!.legend!.labels as any;
        legend.color = textSecondary;
        this.doughnutChart.update();
      }

      if (this.barChart) {
        const ds = this.barChart.data.datasets[0] as any;
        ds.backgroundColor = colors;
        const scales = this.barChart.options.scales as any;
        scales.x.ticks.color = textMuted;
        scales.y.ticks.color = textSecondary;
        this.barChart.update();
      }
    },

    observeTheme() {
      this.themeObserver = new MutationObserver(() => {
        this.$nextTick(() => this.updateChartColors());
      });
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    },
  },
});
</script>

<style scoped>
.chart-section {
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.chart-section__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.chart-card {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.chart-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-align: center;
}

.chart-card__canvas-wrap {
  position: relative;
  width: 100%;
  max-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-card__canvas-wrap canvas {
  max-height: 300px;
}

@media (max-width: 768px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
