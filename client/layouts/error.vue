<template>
  <Page class="page">
    <template v-slot:header>
      <Header />
    </template>
    <div class="main">
      <div class="text">
        <h1 class="title">404 Not Found</h1>
        <p class="sub-title">お探しのページは見つかりませんでした</p>
      </div>
      <img class="telescope" src="~/assets/images/error/telescope.png" />
    </div>
  </Page>
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
      title: '404 Not Found',
    }
  },
}
</script>

<style lang="scss" scoped>
.page {
  background-color: #303133;
}

.main {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .text {
    text-align: center;
    color: #fff;

    .title {
      font-size: 60px;
      margin-bottom: 20px;
    }

    .sub-title {
      font-size: 18px;
      margin-bottom: 20px;
    }
  }

  .telescope {
    height: 200px;
  }
}
</style>
