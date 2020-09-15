<template>
  <el-container class="page">
    <el-header>
      <h1>Geo Tool</h1>
      <el-button icon="el-icon-share"></el-button>
    </el-header>
    <el-main>
      <el-cascader
        v-model="value"
        :options="options"
        :props="{ expandTrigger: 'hover' }"
        @change="handleChange"
      ></el-cascader>
      <GoogleMap />
      <div class="map">Map</div>
      <el-button
        class="add-button"
        type="primary"
        icon="el-icon-plus"
        circle
      ></el-button>
    </el-main>
  </el-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      value: [],
      options: [
        {
          value: 'address',
          label: '住所',
          children: [
            {
              value: 'pref',
              label: '都道府県',
            },
            {
              value: 'city',
              label: '市区町村',
            },
            {
              value: 'town',
              label: '丁目番地',
            },
          ],
        },
        {
          value: 'mesh',
          label: '地域メッシュ',
          children: [
            {
              value: 'mesh1',
              label: '1次メッシュ(80km)',
            },
            {
              value: 'mesh2',
              label: '2次メッシュ(10km)',
            },
            {
              value: 'mesh3',
              label: '3次メッシュ(1km)',
            },
            {
              value: 'mesh4',
              label: '4次メッシュ(500m)',
            },
            {
              value: 'mesh5',
              label: '5次メッシュ(250m)',
            },
            {
              value: 'mesh6',
              label: '6次メッシュ(125m)',
            },
          ],
        },
        {
          value: 'heatmap',
          label: 'ヒートマップ',
        },
        {
          value: 'cluster',
          label: 'マーカークラスター',
        },
      ],
    }
  },

  async mounted() {
    await this.loadMap()
    this.google = this.$store.state.map.google
  },

  methods: {
    ...mapActions('map', { loadMap: 'load' }),

    handleChange(value) {
      console.log(value)
    },
  },
}
</script>

<style>
.page {
  width: 100%;
  height: 100vh;
}

h1 {
  flex: 1;
}

.el-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #999;
}

.el-main {
  position: relative;
  padding: 0;
}

.el-cascader {
  position: absolute;
  top: 20px;
  left: 20px;
}
.map {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.add-button {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
}
</style>
