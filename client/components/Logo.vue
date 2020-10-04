<template>
  <nuxt-link class="logo" :to="url">
    <span>Geo Tool</span>
    <img src="~/assets/images/planet.svg" />
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
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 120px;
  margin: 10px 0;
  padding: 5px 0;
  border-radius: 3px;
  background: #eee;
  color: #3b4151;
  line-height: 19px;
  text-decoration: none;
  font-weight: bold;

  @include xs() {
    min-width: 36px;
    padding: 8px 0;
  }

  > span {
    margin-right: 6px;

    @include xs() {
      display: none;
    }
  }

  > img {
    width: 20px;
  }
}
</style>
