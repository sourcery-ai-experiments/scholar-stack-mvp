<template>
  <div
    class="relative mx-auto flex h-screen w-full flex-col"
    :class="{ 'debug-screens': devMode }"
  >
    <UiHeader />
    <n-back-top />
    <slot />
  </div>
</template>

<script setup>
const devMode = process.env.NODE_ENV === "development";
</script>
