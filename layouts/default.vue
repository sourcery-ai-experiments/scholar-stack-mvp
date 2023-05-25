<template>
  <div
    class="relative flex h-screen w-full flex-col"
    :class="{ 'debug-screens': devMode }"
  >
    <div
      class="header fixed right-0 top-0 z-50 flex w-full justify-end space-x-4 bg-red-100 px-4 pb-4 pt-2 text-slate-800"
    >
      <NuxtLink to="/"> Home </NuxtLink>
      <NuxtLink to="/projects"> Projects </NuxtLink>
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

const devMode = process.env.NODE_ENV === "development";

const loggedIn = computed(() => user.value);

const logout = async () => {
  await auth.signOut();
  window.location.href = "/";
};
</script>
