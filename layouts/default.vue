<script setup lang="ts">
const route = useRoute();

const devMode = process.env.NODE_ENV === "development";

const navbarHiddenRoutes = ["/auth/login", "/auth/register"];

const showNavbar = computed(() => {
  return !navbarHiddenRoutes.includes(route.path);
});
</script>

<template>
  <div
    class="relative mx-auto flex h-screen w-full flex-col"
    :class="{ 'debug-screens': devMode }"
  >
    <UiHeader v-if="showNavbar" />
    <n-back-top />
    <slot />
  </div>
</template>
