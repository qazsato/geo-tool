<template>
  <nuxt-link class="logo" :to="url">
    <img src="~/assets/images/logo.svg" />
  </nuxt-link>
</template>

<script>
export default {
  props: {
    url: {
      required: true,
      type: String,
    },
  },
}
</script>

<style lang="scss" scoped>
.logo {
  height: 30px;
  width: 110px;

  > img {
    height: 100%;
    width: 100%;
  }
}
</style>
