<template>
  <el-cascader v-model="value" :options="options" @change="onChange"></el-cascader>
</template>

<script>
import { analysisType } from '@/constants/view-map-state'
import { addressLevel, addressLevelName } from '@/constants/address'
import { meshLevel, meshLevelName } from '@/constants/mesh'

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
          value: analysisType.address.key,
          label: '住所',
          children: [
            {
              value: addressLevel.level1.value,
              label: addressLevelName.level1.value,
            },
            {
              value: addressLevel.level2.value,
              label: addressLevelName.level2.value,
            },
            {
              value: addressLevel.level3.value,
              label: addressLevelName.level3.value,
            },
            {
              value: addressLevel.level4.value,
              label: addressLevelName.level4.value,
            },
          ],
        },
        {
          value: analysisType.mesh.key,
          label: '地域メッシュ',
          children: [
            {
              value: meshLevel.level80000.value,
              label: meshLevelName.level80000.value,
            },
            {
              value: meshLevel.level10000.value,
              label: meshLevelName.level10000.value,
            },
            {
              value: meshLevel.level5000.value,
              label: meshLevelName.level5000.value,
            },
            {
              value: meshLevel.level2000.value,
              label: meshLevelName.level2000.value,
            },
            {
              value: meshLevel.level1000.value,
              label: meshLevelName.level1000.value,
            },
            {
              value: meshLevel.level500.value,
              label: meshLevelName.level500.value,
            },
            {
              value: meshLevel.level250.value,
              label: meshLevelName.level250.value,
            },
            {
              value: meshLevel.level125.value,
              label: meshLevelName.level125.value,
            },
          ],
        },
        {
          value: analysisType.heatmap.key,
          label: 'ヒートマップ',
        },
        {
          value: analysisType.cluster.key,
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
