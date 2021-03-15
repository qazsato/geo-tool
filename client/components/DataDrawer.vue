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
        <el-table :data="data" :default-sort="{ prop: 'count', order: 'descending' }">
          <el-table-column prop="key" label="ポリゴン" sortable>
            <template slot-scope="scope">
              <el-link type="primary" :underline="false" @click="clickRow(scope.row.code)">{{ scope.row.key }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="count" label="件数" width="100" sortable></el-table-column>
        </el-table>
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
</style>
