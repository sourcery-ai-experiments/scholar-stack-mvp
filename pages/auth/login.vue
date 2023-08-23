<script setup lang="ts">
import { Vue3Lottie } from "vue3-lottie";
import { useMessage } from "naive-ui";
import isEmail from "validator/es/lib/isEmail";

definePageMeta({
  layout: "no-header",
});

const user = useSupabaseUser();
const supabase = useSupabaseClient();

const message = useMessage();

const emailAddress = ref("");
const password = ref("");

const loading = ref(false);

const invalidEmailAddress = computed(() => {
  return emailAddress.value === "" || !isEmail(emailAddress.value);
});

const signIn = async () => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
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

<template>
  <main class="flex h-full flex-row flex-wrap items-center justify-center">
    <div class="flex w-1/2 flex-col items-center">
      <div
        class="mt-4 w-full max-w-lg space-y-6 rounded-lg bg-white px-4 py-6 sm:px-8 sm:py-8"
      >
        <div class="pb-4">
          <h1 class="mb-3 text-left text-2xl font-bold sm:text-4xl">
            Welcome back!
          </h1>

          <p>Sign in to your account to continue using our services.</p>
        </div>

        <div class="flex w-full flex-col">
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
          <span class="mb-1 text-left text-sm text-slate-600"> Password </span>

          <n-input
            v-model:value="password"
            type="password"
            show-password-on="mousedown"
            size="large"
            placeholder=""
          />
        </div>

        <n-button
          strong
          secondary
          type="primary"
          size="large"
          :loading="loading"
          :disabled="invalidEmailAddress"
          @click="signIn"
          class="w-full"
        >
          <template #icon>
            <Icon name="ph:sign-in-bold" />
          </template>
          Sign In
        </n-button>

        <n-divider class="text-slate-400"> or </n-divider>

        <div class="flex justify-center text-sm">
          Don't have an account?
          <nuxt-link
            class="ml-1 w-fit text-blue-600 transition-all hover:text-blue-400"
            to="/auth/register"
          >
            Sign Up
          </nuxt-link>
        </div>

        <div class="flex flex-col space-y-4">
          <n-button
            strong
            size="large"
            class="w-full"
            :loading="loading"
            @click="signIn"
          >
            <template #icon>
              <Icon name="devicon:google" />
            </template>

            Sign In with Google
          </n-button>

          <n-button
            strong
            color="black"
            size="large"
            class="w-full"
            :loading="loading"
            @click="signIn"
          >
            <template #icon>
              <Icon name="ph:github-logo-fill" />
            </template>

            Sign In with GitHub
          </n-button>

          <n-button
            strong
            size="large"
            class="w-full"
            :loading="loading"
            @click="signIn"
          >
            <template #icon>
              <Icon name="ic:baseline-apple" />
            </template>

            Sign In with Apple ID
          </n-button>
        </div>

        <p class="mx-auto w-9/12 text-center text-sm">
          By signing in, you agree to our
          <nuxt-link
            class="text-blue-600 transition-all hover:text-blue-400"
            to="/terms"
          >
            Terms of Service
          </nuxt-link>
          and
          <nuxt-link
            class="text-blue-600 transition-all hover:text-blue-400"
            to="/privacy"
          >
            Privacy Policy</nuxt-link
          >.
        </p>
      </div>
    </div>

    <div class="h-full w-1/2 bg-slate-900"></div>
  </main>
</template>
