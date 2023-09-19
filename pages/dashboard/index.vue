<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const push = usePush();

const { data: workspaces, error } = await useFetch("/api/workspaces", {
  headers: useRequestHeaders(["cookie"]),
});

if (error.value) {
  console.log(error.value);

  push.error({
    title: "Something went wrong",
    message: "We couldn't load your workspaces",
  });

  navigateTo("/");
}

if (workspaces.value?.length === 0) {
  console.log("No workspaces found");

  // Create a new personal workspace
  const { data: workspace, error } = await useFetch("/api/workspaces", {
    body: JSON.stringify({
      title: "My workspace",
      description: "This is my personal workspace",
    }),
    headers: useRequestHeaders(["cookie"]),
    method: "POST",
  });

  if (error.value) {
    console.log(error.value);

    push.error({
      title: "Something went wrong",
      message: "Please contact support",
    });

    navigateTo("/");
  }

  if (workspace.value) {
    console.log("Workspace created", workspace.value);

    push.success({
      title: "Workspace created",
      message: "You can now start adding your collections",
    });

    navigateTo(`dashboard/workspaces/${workspace.value.workspaceId}`);
  }
} else {
  console.log("Workspaces found", workspaces.value);
  // navigateTo(`dashboard/workspaces`);
}
</script>

<template>
  <main>
    List all workspaces

    <div v-for="workspace in workspaces" :key="workspace.id">
      {{ workspace }}
    </div>
  </main>
</template>
