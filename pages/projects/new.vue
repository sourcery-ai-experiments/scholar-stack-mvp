<template>
  <main class="px-8 py-16">
    <div class="flex justify-between">
      <h1>Lets create a new project</h1>

      <n-button strong secondary type="info" icon-placement="left" size="large">
        <template #icon>
          <Icon name="fluent:form-new-20-filled" />
        </template>
        Create a new project
      </n-button>
    </div>

    <div class="my-8">Add form here</div>
  </main>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
});
</script>
