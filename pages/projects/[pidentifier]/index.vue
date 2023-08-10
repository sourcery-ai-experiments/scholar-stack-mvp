<template>
  <main class="flex h-full w-full flex-col items-center px-12">
    <div>
      <client-only>
        <Vue3Lottie
          animation-link="https://assets10.lottiefiles.com/packages/lf20_AQEOul.json"
          :height="400"
          :width="400"
        />
      </client-only>
    </div>

    <transition name="fade" mode="out-in" appear>
      <div v-if="showRefreshPrompt" class="flex flex-col justify-center">
        <p class="text-slate-00 text-center text-lg font-medium">
          Your project is taking a little longer than expected to load...
        </p>

        <n-button
          type="info"
          size="large"
          class="mt-4"
          secondary
          strong
          @click="refreshPage"
        >
          <template #icon>
            <Icon
              name="ic:sharp-refresh"
              class="animate-spin"
              style="animation-iteration-count: 1"
            />
          </template>
          Refresh Page
        </n-button>
      </div>
    </transition>
  </main>
</template>

<script setup lang="ts">
import { useMessage } from "naive-ui";

const route = useRoute();
const message = useMessage();

const showRefreshPrompt = ref(false);

const refreshPage = () => {
  window.location.reload();
};

onMounted(() => {
  setTimeout(() => {
    showRefreshPrompt.value = true;
  }, 7000);
});

const { data: project, error } = await useFetch(
  `/api/projects/${route.params.pidentifier}`,
  {
    lazy: true,
    server: false,
  }
);

watch(error, (err) => {
  if (!err) return;
  console.log(err?.message);
  message.error("Something went wrong. Please try again later.");

  navigateTo("/404");
});

watch(project, (project) => {
  if (!project) return;

  const projectData = project as ResponseProject;

  if (
    "latestVersion" in projectData &&
    "identifier" in projectData.latestVersion
  ) {
    const latestVersionIdentifier = projectData.latestVersion.identifier;

    navigateTo(
      `/projects/${projectData.identifier}/version/${latestVersionIdentifier}`
    );
  } else {
    navigateTo(`/projects/${projectData.identifier}/version/new`);
  }
});

useSeoMeta({
  title: "Projects",
});
</script>
