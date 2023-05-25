<template>
  <main class="px-8 py-16">
    <div class="flex justify-between">
      <h1>Your Projects</h1>
    </div>

    <div class="my-8">
      <p>{{ $route.params.group }} - {{ $route.params.id }}</p>
    </div>
  </main>
</template>

<script setup>
const route = useRoute();
if (route.params.group === "admins" && !route.params.id) {
  console.log("Warning! Make sure user is authenticated!");
}
</script>
