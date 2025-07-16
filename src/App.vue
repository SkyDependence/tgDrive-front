<template>
  <router-view />
</template>

<script setup lang="ts">
// No script logic needed here, it's handled by layouts.
</script>

<style>
#app {
  height: 100vh;
  width: 100vw;
  overflow-x: hidden; /* Prevent horizontal scrolling */
  overflow-y: auto;   /* Allow vertical scrolling when needed */
}
</style>