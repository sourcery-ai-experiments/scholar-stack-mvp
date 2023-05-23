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
              @click="signIn"
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
  </main>
</template>

<script setup lang="ts">
import { Vue3Lottie } from "vue3-lottie";
import { useMessage } from "naive-ui";
import isEmail from "validator/es/lib/isEmail";

const user = useSupabaseUser();
const { auth } = useSupabaseAuthClient();

const message = useMessage();

const emailAddress = ref("");
const password = ref("");

const loading = ref(false);

const invalidEmailAddress = computed(() => {
  return emailAddress.value === "" || !isEmail(emailAddress.value);
});

const signIn = async () => {
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
