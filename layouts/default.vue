<template>
  <div class="relative flex h-screen w-full flex-col">
    <div
      class="header fixed right-4 top-2 flex w-full justify-end space-x-4 text-slate-800"
    >
      <NuxtLink to="/"> Home </NuxtLink>
      <NuxtLink v-if="loggedIn" to="/auth/logout"> Logout </NuxtLink>
      <NuxtLink v-else to="/auth/login"> Login </NuxtLink>
    </div>
    <slot />
  </div>
</template>

<script setup>
const user = useSupabaseUser();

const loggedIn = computed(() => user.value);
</script>
