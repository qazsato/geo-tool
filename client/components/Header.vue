<template>
  <div class="header">
    <h1 v-if="title" class="title">{{ title }}</h1>
    <Logo v-else />
    <div class="spacer"></div>
    <el-tooltip content="共有する" placement="bottom">
      <el-button icon="el-icon-share" @click="onClickShare"></el-button>
    </el-tooltip>
    <el-tooltip content="データ読込" placement="bottom">
      <el-button icon="el-icon-place" @click="onClickImport"></el-button>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      required: true,
      type: String,
    },
  },

  methods: {
    onClickShare() {
      this.$emit('clickShare')
    },

    onClickImport() {
      this.$emit('clickImport')
    },
  },
}
</script>

<style lang="scss" scoped>
.header {
  height: 100%;
  display: flex;
  align-items: center;
}

.spacer {
  flex: 1;
}
</style>
