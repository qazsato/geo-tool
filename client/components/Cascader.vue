<template>
  <el-cascader
    v-model="value"
    :options="options"
    :props="{ expandTrigger: 'hover' }"
    @change="handleChange"
  ></el-cascader>
</template>

<script>
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

  methods: {
    handleChange(value) {
      console.log(value)
    },
  },
}
</script>
