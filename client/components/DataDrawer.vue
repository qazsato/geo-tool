<template>
  <el-drawer
    :title="title"
    :visible.sync="innerVisible"
    :before-close="onBeforeClose"
    custom-class="data-drawer"
    direction="ltr"
  >
    <el-tabs v-model="activeTab" :stretch="true">
      <el-tab-pane label="表" name="table">
        <div class="list-container">
          <div class="list-title">
            <div class="polygon">ポリゴン</div>
            <div class="spacer"></div>
            <div class="count">件数</div>
          </div>
          <RecycleScroller v-slot="{ item }" :items="data" :item-size="50" key-field="code" page-mode>
            <div class="list-item">
              <el-link type="primary" :underline="false" @click="clickRow(item.code)">{{ item.key }}</el-link>
              <div class="spacer"></div>
              <span class="count">{{ item.count }}</span>
            </div>
          </RecycleScroller>
        </div>
      </el-tab-pane>
      <el-tab-pane label="グラフ" name="graph">
        <canvas ref="chart" width="100%" height="100%"></canvas>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script>
import Chart from 'chart.js'
import 'chartjs-plugin-colorschemes'

export default {
  props: {
    title: {
      required: true,
      type: String,
    },

    visible: {
      required: true,
      type: Boolean,
    },

    data: {
      required: true,
      type: Array,
    },
  },

  data() {
    return {
      activeTab: 'table',
      innerVisible: this.visible,
      chart: null,
    }
  },

  watch: {
    visible(val) {
      this.innerVisible = val
      this.$nextTick(() => {
        this.createChart()
      })
    },
  },

  methods: {
    onBeforeClose() {
      this.$emit('close')
    },

    clickRow(code) {
      this.$emit('clickRow', code)
    },

    createChart() {
      if (this.chart) {
        this.chart.destroy()
      }
      const chartData = []
      const max = 10
      this.data.forEach((d, i) => {
        if (i < max) {
          chartData.push(d)
        } else if (chartData[max]) {
          chartData[max].count += d.count
        } else {
          chartData.push({ key: 'その他', count: d.count })
        }
      })
      this.chart = new Chart(this.$refs.chart, {
        type: 'pie',
        data: {
          labels: chartData.map((d) => d.key),
          datasets: [
            {
              data: chartData.map((d) => d.count),
            },
          ],
        },
        options: {
          plugins: {
            colorschemes: {
              scheme: 'tableau.GreenOrangeTeal12',
            },
          },
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.el-table {
  width: 100%;
}
</style>

<style lang="scss">
.data-drawer {
  width: 40% !important;
  outline: 0;

  @include xs() {
    width: 100% !important;
  }

  .el-drawer__header {
    > span {
      outline: 0;
    }
  }

  .el-drawer__body {
    overflow: auto;
  }
}

.el-tabs {
  height: 100%;

  .el-tabs__header {
    margin-bottom: 0;
  }

  .el-tabs__content {
    overflow: auto;
    height: calc(100% - 40px);
  }
}

.list-container {
  font-size: 14px;
  color: #606266;

  .list-title {
    padding: 15px 15px 10px;
    display: flex;
    font-weight: bold;
    color: #909399;
    border-bottom: 1px solid #ebeef5;

    .spacer {
      flex: 1;
    }
  }

  .list-item {
    padding: 10px 15px;
    height: 50px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ebeef5;

    .spacer {
      flex: 1;
    }

    .count {
      min-width: 20px;
    }
  }
}
</style>
