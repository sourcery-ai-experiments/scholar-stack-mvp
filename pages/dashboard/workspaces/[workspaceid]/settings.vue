<script setup lang="ts">
definePageMeta({
  layout: "workspaces-layout",
  middleware: ["auth"],
});

const push = usePush();
const route = useRoute();

const { workspaceid } = route.params as { workspaceid: string };
</script>

<template>
  <main>settings</main>
</template>
