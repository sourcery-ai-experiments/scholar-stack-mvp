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
  </main>
</template>

<script setup lang="ts">
import { useMessage } from "naive-ui";

/**
 * TODO: add a custom toolbar to the editor
 */

const route = useRoute();
const message = useMessage();

// const { data: project, error } = await useAsyncData(
//   "projectLatestVersionRedirect",
//   () => $fetch(`/api/projects/${route.params.pidentifier}`)
// );

const { data: project, error } = await useFetch(
  `/api/projects/${route.params.pidentifier}`,
  {
    lazy: true,
    server: false,
  }
);

// const {
//   data: project,
//   error,
//   pending,
// } = useLazyFetch(`/api/projects/${route.params.pidentifier}`, {
//   headers: useRequestHeaders(["cookie"]),
//   method: "GET",
// });

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

    console.log(latestVersionIdentifier);

    navigateTo(
      `/projects/${projectData.identifier}/version/${latestVersionIdentifier}`
    );
  }
});

useSeoMeta({
  title: "Projects",
});
</script>
