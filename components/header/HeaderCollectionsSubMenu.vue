<script setup lang="ts">
const route = useRoute();

const isDraftVersion = ref(false);

const {
  data: collection,
  error,
  pending,
} = await useFetch<CollectionGETAPIResponse>(
  `/api/workspaces/${route.params.workspaceid}/collections/${route.params.collectionid}`,
  {
    headers: useRequestHeaders(["cookie"]),
    lazy: true,
    server: false,
  }
);

if (error.value) {
  console.error(error.value);
}

if (collection.value) {
  isDraftVersion.value =
    collection.value.version?.published === false || !!collection.value.version;
}

const navItems = [
  {
    name: "Overview",
    disabled: false,
    href: `/dashboard/workspaces/${route.params.workspaceid}/collections/${route.params.collectionid}`,
    icon: "mdi:home-outline",
  },
  {
    name: "Resources",
    disabled: false,
    href: `/dashboard/workspaces/${route.params.workspaceid}/collections/${route.params.collectionid}/resources`,
    icon: "cil:list",
  },
  {
    name: "Changelog",
    disabled: !isDraftVersion.value,
    href: `/dashboard/workspaces/${route.params.workspaceid}/collections/${route.params.collectionid}/changelog`,
    icon: "mdi:history",
  },
  {
    name: "Publish",
    disabled: !isDraftVersion.value,
    href: `/dashboard/workspaces/${route.params.workspaceid}/collections/${route.params.collectionid}/publish`,
    icon: "entypo:publish",
  },

  {
    name: "Settings",
    disabled: false,
    href: `/dashboard/workspaces/${route.params.workspaceid}/collections/${route.params.collectionid}/settings`,
    icon: "material-symbols:settings-outline",
  },
];
</script>

<template>
  <div class="submenu flex items-center space-x-5 pt-4">
    <NuxtLink
      v-for="item in navItems"
      :key="item.name"
      class="flex items-center space-x-1 text-slate-500"
      active-class="border-b-2 border-slate-800 text-slate-900"
      :to="item.href"
      :class="{
        'cursor-not-allowed': item.disabled,
        'opacity-50': item.disabled,
      }"
    >
      <div
        class="mb-1 flex items-center space-x-1 rounded-md px-2 py-2 transition-all hover:bg-slate-100 hover:text-slate-800"
      >
        <Icon :name="item.icon" />

        <span class="text-sm">
          {{ item.name }}
        </span>
      </div>
    </NuxtLink>
  </div>
</template>
