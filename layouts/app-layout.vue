<script setup lang="ts">
const route = useRoute();

const devMode = process.env.NODE_ENV === "development";

const currentLayout = computed(() => {
  if (route.params.resourceid) {
    return "resource-layout";
  }

  if (route.params.collectionid) {
    return "collections-layout";
  }

  if (route.params.workspaceid) {
    return "workspace-layout";
  }

  return "default-layout";
});
</script>

<template>
  <div
    class="relative mx-auto flex h-screen w-full flex-col"
    :class="{ 'debug-screens': devMode }"
  >
    <header class="z-10">
      <nav
        class="flex w-full flex-col-reverse border-b border-gray-200 bg-white px-4 pt-2.5 lg:px-6"
      >
        <HeaderWorkspaceSubMenu
          v-if="currentLayout === 'workspace-layout'"
          :key="$route.fullPath"
        />

        <HeaderCollectionsSubMenu
          v-if="currentLayout === 'collections-layout'"
          :key="$route.fullPath"
        />

        <HeaderResourcesSubMenu
          v-if="currentLayout === 'resource-layout'"
          :key="$route.fullPath"
        />

        <div class="flex w-full items-center justify-between">
          <HeaderLeftBar />

          <HeaderRightBar />
        </div>
      </nav>
    </header>

    <slot />
  </div>
</template>
