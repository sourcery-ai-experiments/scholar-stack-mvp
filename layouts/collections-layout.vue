<script setup lang="ts">
// const route = useRoute();

const devMode = process.env.NODE_ENV === "development";

// const workspaceid = computed(() => {
//   console.log(route.params.workspaceid);
//   return route.params.workspaceid;
// });

// const collectionid = computed(() => {
//   console.log(route.params.collectionid);
//   return route.params.collectionid;
// });
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
        <HeaderCollectionsSubMenu :key="$route.fullPath" />

        <div class="flex w-full flex-wrap items-center justify-between">
          <HeaderLeftBar />

          <HeaderRightBar />
        </div>
      </nav>
    </header>

    <slot />
  </div>
</template>
