<template>
  <ol-fullscreen-control v-if="fullscreencontrol" />
</template>

<script setup>
import { ref } from "vue";

const fullscreencontrol = ref(true);
</script>
