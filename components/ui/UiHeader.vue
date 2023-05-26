<template>
  <header
    class="header left-0 top-0 z-50 w-full border-b border-slate-200 bg-slate-100 px-4 pb-3 pt-2 text-slate-800"
  >
    <div class="flex items-center justify-start">
      <div class="px-8">
        <NuxtLink
          to="/"
          class="flex flex-row items-center justify-start space-x-2"
        >
          <img src="/logo/logo.svg" alt="Logo" class="w-10" />
          <span class="text-xl font-bold text-blue-800">Scholar Stack</span>
        </NuxtLink>
      </div>
      <div class="flex w-fit justify-start space-x-4">
        <NuxtLink to="/" class=""> Home </NuxtLink>
        <NuxtLink to="/projects"> Projects </NuxtLink>
        <NuxtLink to="/auth/confirm-email"> Confirm Email </NuxtLink>
        <NuxtLink to="/auth/register"> Register </NuxtLink>
        <div v-if="loggedIn" @click="logout">Logout</div>
        <NuxtLink v-else to="/auth/login"> Login </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { auth } = useSupabaseAuthClient();
const user = useSupabaseUser();

const loggedIn = computed(() => user.value);

const logout = async () => {
  await auth.signOut();
  window.location.href = "/";
};
</script>
