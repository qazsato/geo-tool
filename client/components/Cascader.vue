<template>
  <el-cascader v-model="value" :options="options" @change="onChange"></el-cascader>
</template>

<script>
export default {
  props: {
    cascader: {
      required: true,
      type: Array,
    },
  },

  data() {
    return {
      value: this.cascader,
      options: [
        {
          value: 'address',
          label: '住所',
          children: [
            {
              value: '1',
              label: '都道府県',
            },
            {
              value: '2',
              label: '市区町村',
            },
            {
              value: '3',
              label: '町丁・字等',
            },
          ],
        },
        {
          value: 'mesh',
          label: '地域メッシュ',
          children: [
            {
              value: '1',
              label: '1次メッシュ(80km)',
            },
            {
              value: '2',
              label: '2次メッシュ(10km)',
            },
            {
              value: '3',
              label: '3次メッシュ(1km)',
            },
            {
              value: '4',
              label: '4次メッシュ(500m)',
            },
            {
              value: '5',
              label: '5次メッシュ(250m)',
            },
            {
              value: '6',
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
