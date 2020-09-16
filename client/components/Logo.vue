<template>
  <div class="logo">
    <span>Geo Tool</span>
    <img src="~/assets/images/planet.svg" />
  </div>
</template>

<style lang="scss" scoped>
.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  margin: 10px 0;
  padding: 5px 0;
  border-radius: 3px;
  background: #eee;
  color: #3b4151;
  line-height: 19px;
  text-decoration: none;
  font-weight: bold;

  > img {
    margin-left: 6px;
    width: 20px;
  }
}
</style>
