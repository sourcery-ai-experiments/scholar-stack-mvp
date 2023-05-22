<template>
  <main>
    <section
      class="container mx-auto flex flex-wrap items-center justify-center px-5 py-24"
    >
      <div class="flex w-full max-w-screen-sm flex-col items-center">
        <ClientOnly>
          <Vue3Lottie
            animation-link="https://assets6.lottiefiles.com/packages/lf20_87uabjh2.json"
            :height="150"
            :width="150"
          />
        </ClientOnly>

        <h1 class="mb-8 mt-16 text-center text-2xl font-bold sm:text-4xl">
          Let's get you logged in!
        </h1>

        <div
          class="mt-4 w-full max-w-sm space-y-6 rounded-lg border border-slate-200 bg-white px-4 py-6 shadow-md sm:px-8 sm:py-8"
        >
          <div class="flex flex-col">
            <span class="mb-1 text-left text-sm text-slate-600">
              Email Address
            </span>

            <n-input
              v-model:value="emailAddress"
              type="text"
              size="large"
              placeholder="ea@sjy.so"
            />
          </div>

          <div class="flex flex-col">
            <span class="mb-1 text-left text-sm text-slate-600">
              Password
            </span>

            <n-input
              v-model:value="password"
              type="password"
              show-password-on="mousedown"
              size="large"
              placeholder=""
            />
          </div>

          <div class="flex justify-center">
            <n-button
              strong
              secondary
              type="primary"
              size="large"
              :loading="loading"
              :disabled="invalidEmailAddress"
              @click="userLogin"
            >
              Sign In
            </n-button>
          </div>

          <div class="flex justify-center text-sm">
            Don't have an account?
            <nuxt-link
              class="ml-1 w-fit text-blue-600 transition-all hover:text-blue-400"
              to="/auth/register"
            >
              Sign Up
            </nuxt-link>
          </div>
        </div>
      </div>
    </section>

    <section
      class="container mx-auto flex hidden flex-wrap items-center justify-center px-5 py-24 text-gray-400"
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
            id="emailAddress"
            v-model="emailAddress"
            type="email"
            name="emailAddress"
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
import { Vue3Lottie } from "vue3-lottie";
import { useMessage } from "naive-ui";
import isEmail from "validator/es/lib/isEmail";

const user = useSupabaseUser();
const { auth } = useSupabaseAuthClient();

const message = useMessage();

const emailAddress = ref("");
const password = ref("");
const errorMsg = ref("");

const loading = ref(false);

const invalidEmailAddress = computed(() => {
  return emailAddress.value === "" || !isEmail(emailAddress.value);
});

const userLogin = async () => {
  try {
    const { error } = await auth.signInWithPassword({
      email: emailAddress.value,
      password: password.value,
    });

    emailAddress.value = "";
    password.value = "";

    if (error) {
      message.error(error.message, {
        keepAliveOnHover: true,
      });

      throw error;
    }
  } catch (error) {
    console.error(error);
  }
};

watchEffect(() => {
  if (user.value) {
    return navigateTo("/projects");
  }
});
</script>
