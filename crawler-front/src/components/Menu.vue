<template>
  <div class="menu">
    <ul>
      <li>
        <button class="invisible-button" @click="refresh">
          <p>Crawler</p>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
function refresh() {
  window.location.reload();
}
</script>

<style scoped>
.menu {
  position: fixed;
  background-color: #5c35d1;
  width: 100%;
  left: 0%;
}
.menu ul {
  list-style-type: none;
  padding: 0;
}
.menu li {
  margin: 5px 0;
}
.menu li p {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}
.invisible-button {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
}
.invisible-button p {
  margin: 0;
}
</style>