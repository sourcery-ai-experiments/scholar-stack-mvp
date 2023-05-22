<template>
  <main>
    <section
      class="container mx-auto flex flex-wrap items-center justify-center px-5 py-24 text-gray-400"
    >
      <form
        class="bg-opacity-50 mt-10 flex w-full flex-col rounded-lg bg-[#242424] p-8 md:mt-0 md:w-1/2 lg:w-2/6"
        @submit.prevent="userLogin"
      >
        <h2 class="mb-5 text-lg font-medium text-[#aac8e4]">Login</h2>
        <div class="relative mb-4">
          <label for="full-name" class="text-sm leading-7 text-gray-400"
            >Email</label
          >
          <input
            id="email"
            v-model="email"
            type="email"
            name="email"
            class="bg-opacity-20 w-full rounded border border-gray-600 bg-transparent px-3 py-1 text-base leading-8 text-gray-100 outline-none transition-colors duration-200 ease-in-out focus:border-[#42b883] focus:bg-transparent focus:ring-2 focus:ring-transparent"
            required
          />
        </div>
        <div class="relative mb-4">
          <label for="password" class="text-sm leading-7 text-gray-400"
            >Password</label
          >
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            class="bg-opacity-20 w-full rounded border border-gray-600 bg-transparent px-3 py-1 text-base leading-8 text-gray-100 outline-none transition-colors duration-200 ease-in-out focus:border-[#42b883] focus:bg-transparent focus:ring-2 focus:ring-transparent"
            required
          />
        </div>
        <button
          class="rounded border-0 bg-[#42b883] px-8 py-2 font-sans font-bold text-[#213547] transition-colors duration-500 hover:bg-[#42d392] focus:outline-none"
        >
          Submit
        </button>
        <span
          v-if="errorMsg"
          class="bg-opacity-50 absolute right-8 top-8 rounded-lg bg-[#242424] p-8 px-4 py-2 text-red-500"
          >{{ errorMsg }}</span
        >
        <p class="mt-3 text-xs">You don't have an account yet?</p>
        <nuxt-link
          class="w-fit text-sm text-[#aac8e4] hover:text-[#42b883]"
          to="/auth/register"
          >Register</nuxt-link
        >
      </form>
    </section>
  </main>
</template>

<script setup>
const user = useSupabaseUser();

const email = ref("");
const password = ref("");
const errorMsg = ref("");

const { auth } = useSupabaseAuthClient();

const userLogin = async () => {
  console.log(auth);
  try {
    const { error } = await auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    email.value = "";
    password.value = "";
    if (error) throw error;
  } catch (error) {
    errorMsg.value = error.message;
    setTimeout(() => {
      errorMsg.value = "";
    }, 3000);
  }
};

watchEffect(() => {
  if (user.value) {
    return navigateTo("/projects");
  }
});
</script>
