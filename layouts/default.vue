<template>
  <div class="relative flex h-screen w-full flex-col">
    <div
      class="header fixed right-4 top-2 flex w-full justify-end space-x-4 text-slate-800"
    >
      <NuxtLink to="/"> Home </NuxtLink>
      <NuxtLink to="/auth/confirm-email"> Confirm Email </NuxtLink>
      <NuxtLink to="/auth/register"> Register </NuxtLink>
      <div v-if="loggedIn" @click="logout">Logout</div>
      <NuxtLink v-else to="/auth/login"> Login </NuxtLink>
    </div>
    <slot />
  </div>
</template>

<script setup>
const { auth } = useSupabaseAuthClient();
const user = useSupabaseUser();

const loggedIn = computed(() => user.value);

const logout = async () => {
  await auth.signOut();
  window.location.href = "/";
};
</script>
