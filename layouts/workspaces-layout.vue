<script setup lang="ts">
const route = useRoute();

const devMode = process.env.NODE_ENV === "development";

const workspaceid = computed(() => {
  console.log(route.params.workspaceid);
  return route.params.workspaceid;
});

const navbarItems = [
  {
    name: "Overview",
    href: `/dashboard/workspaces/${workspaceid.value}`,
    icon: "material-symbols:home-outline",
  },
  {
    name: "Activity",
    href: `/dashboard/workspaces/${workspaceid.value}/activity`,
    icon: "mdi:timeline-clock-outline",
  },
  {
    name: "Settings",
    href: `/dashboard/workspaces/${workspaceid.value}/settings`,
    icon: "material-symbols:settings-outline",
  },
];

function navigate() {
  // the callback is fired once the animation is completed
  // to allow smooth transition
}
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
        <HeaderWorkspacesSubMenu :key="$route.fullPath" />

        <div class="flex w-full flex-wrap items-center justify-between">
          <HeaderLeftBar />

          <HeaderRightBar />
        </div>
      </nav>
    </header>

    <slot />
  </div>
</template>
