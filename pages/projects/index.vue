<template>
  <main class="px-8 py-16">
    <div class="flex justify-between">
      <h1>Your Projects</h1>

      <nuxt-link to="/projects/new">
        <n-button
          strong
          secondary
          type="info"
          icon-placement="left"
          size="large"
        >
          <template #icon>
            <Icon name="fluent:form-new-20-filled" />
          </template>
          Create a new project
        </n-button>
      </nuxt-link>
    </div>

    <div class="my-8">
      <transition name="fade" mode="out-in">
        <div v-if="pending">
          <client-only>
            <Vue3Lottie
              animation-link="https://assets10.lottiefiles.com/packages/lf20_AQEOul.json"
              :height="200"
              :width="200"
            />
          </client-only>
        </div>
        <div v-else>
          <div
            v-if="projectsLength === 0"
            class="flex w-full flex-col rounded-md border border-dashed px-3 py-5"
          >
            <client-only>
              <Vue3Lottie
                animation-link="https://assets2.lottiefiles.com/datafiles/vhvOcuUkH41HdrL/data.json"
                :height="200"
                :width="200"
              />
            </client-only>
            <p class="my-4 text-center text-xl text-slate-700">
              You don't have any projects yet.
            </p>
          </div>
          <div v-else>
            <p>some text</p>
          </div>
        </div>
      </transition>
    </div>
  </main>
</template>

<script setup>
const user = useSupabaseUser();
const projects = ref([]);

const { pending, response } = await useLazyFetch("/api/projects", {
  headers: useRequestHeaders(["cookie"]),
});

if (response) {
  projects.value = response.data;
}

console.log(user.value);

const projectsLength = computed(() => projects.value.length);

definePageMeta({
  middleware: ["auth"],
});
</script>
