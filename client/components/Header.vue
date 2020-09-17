<template>
  <div class="header">
    <h1 v-if="title" class="title">{{ title }}</h1>
    <Logo v-else />
    <div class="spacer"></div>
    <el-button icon="el-icon-place" @click="onClickImport">データ読み込み</el-button>
    <GithubCorner fill="#bbb" />
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
  padding: 0 60px 0 20px;
}

.spacer {
  flex: 1;
}
</style>
