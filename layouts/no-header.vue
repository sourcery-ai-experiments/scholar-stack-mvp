<template>
  <div
    class="relative mx-auto flex h-screen w-full flex-col"
    :class="{ 'debug-screens': devMode }"
  >
    <div class="absolute top-0 px-4 py-3">
      <img src="/logo/logo.svg" alt="logo" class="h-12 w-12" />
    </div>

    <n-back-top />
    <slot />
  </div>
</template>

<script setup>
const devMode = process.env.NODE_ENV === "development";
</script>
