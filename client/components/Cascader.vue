<template>
  <el-cascader
    v-model="value"
    :options="options"
    @change="onChange"
  ></el-cascader>
</template>

<script>
export default {
  data() {
    return {
      value: 'cluster',
      options: [
        {
          value: 'address',
          label: '住所',
          children: [
            {
              value: 'level1',
              label: '都道府県',
            },
            {
              value: 'level2',
              label: '市区町村',
            },
            {
              value: 'level3',
              label: '町丁・字等',
            },
          ],
        },
        {
          value: 'mesh',
          label: '地域メッシュ',
          children: [
            {
              value: 'level1',
              label: '1次メッシュ(80km)',
            },
            {
              value: 'level2',
              label: '2次メッシュ(10km)',
            },
            {
              value: 'level3',
              label: '3次メッシュ(1km)',
            },
            {
              value: 'level4',
              label: '4次メッシュ(500m)',
            },
            {
              value: 'level5',
              label: '5次メッシュ(250m)',
            },
            {
              value: 'level6',
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
    onChange(value) {
      this.$emit('change', value)
    },
  },
}
</script>
