<template>
  <div class="main">
    <div class="text">
      <h1 class="title">
        <div>Geo Tool</div>
        <div>404 Not Found</div>
      </h1>
      <p class="sub-title">お探しのページは見つかりませんでした</p>
    </div>
    <img class="telescope" src="~/assets/images/error/telescope.png" />
    <el-button icon="el-icon-back" @click="backTop">TOPに戻る</el-button>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      required: true,
      type: Object,
    },
  },

  head() {
    return {
      title: 'Error',
    }
  },

  methods: {
    backTop() {
      this.$router.push('/')
    },
  },
}
</script>

<style lang="scss" scoped>
.main {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: #303133;

  .text {
    text-align: center;
    color: #fff;

    .title {
      font-size: 50px;
      margin-bottom: 20px;
    }

    .sub-title {
      font-size: 18px;
      margin-bottom: 20px;
    }
  }

  .telescope {
    height: 200px;
    margin-bottom: 20px;
  }
}
</style>
