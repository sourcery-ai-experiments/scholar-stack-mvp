<template>
  <main class="px-4">
    <div class="flex justify-between">
      <h1>Your Projects</h1>
    </div>

    <div class="my-4">
      <p>{{ $route.params.id }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
const { data, error } = useFetch("/api/projects/:id", {
  headers: useRequestHeaders(["cookie"]),
  method: "GET",
});

// const route = useRoute();
// if (!route.params.id) {
//   console.log("Warning! Make sure user is authenticated!");
// }

definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({
  title: "Projects",
});
</script>
