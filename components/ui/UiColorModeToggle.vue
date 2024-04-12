<script setup lang="ts">
const route = useRoute();
const colorMode = useColorMode();
const { colorModePreference } = useNaiveColorMode();

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    /**
     * At some point we might need to select a single component
     * but for now using both is fine
     */

    // Toggle the color mode for nuxt ui
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";

    // Toggle the color mode for naive ui
    colorModePreference.set(colorMode.value === "dark" ? "light" : "dark");
  },
});

const isHome = computed(() => route.path === "/");
</script>

<template>
  <ClientOnly>
    <UButton
      v-if="!isHome"
      :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
      color="gray"
      aria-label="Theme"
      @click="isDark = !isDark"
    />

    <template #fallback>
      <!-- this will be rendered on server side -->
      <div class="h-8 w-8 rounded-full"></div>
    </template>
  </ClientOnly>
</template>
