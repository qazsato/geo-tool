<template>
  <div class="header">
    <Logo href="/" />
    <h1 class="title">{{ title }}</h1>
    <div class="spacer"></div>
    <slot></slot>
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
}
</script>

<style lang="scss" scoped>
.header {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 60px 0 20px;
}

.title {
  margin-left: 10px;
  font-size: 18px;
  font-weight: normal;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spacer {
  flex: 1;
}
</style>
