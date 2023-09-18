<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const push = usePush();

const { data: workspaces, error } = await useFetch("/api/projects", {
  headers: useRequestHeaders(["cookie"]),
});

if (error.value) {
  console.log(error.value);

  push.error({
    title: "Something went wrong",
    message: "Taking you back to the homepage.",
  });

  navigateTo("/");
}

if (workspaces.value.length === 0) {
  console.log("No workspaces found");

  // Create a new personal workspace
}
</script>

<template>
  <main>List all workspaces</main>
</template>
