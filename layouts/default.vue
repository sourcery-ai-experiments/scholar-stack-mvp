<template>
  <div
    class="relative flex h-screen w-full flex-col"
    :class="{ 'debug-screens': devMode }"
  >
    <UiHeader />
    <slot />
  </div>
</template>

<script setup>
const devMode = process.env.NODE_ENV === "development";
</script>
