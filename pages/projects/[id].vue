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
const route = useRoute();

const { data, error } = useFetch(`/api/projects/${route.params.id}`, {
  headers: useRequestHeaders(["cookie"]),
  method: "GET",
});

if (error.value) {
  console.error(error.value);

  // redirect to project not found page

  // navigateTo("/projects/not-found");
}

definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({
  title: "Projects",
});
</script>
