<script setup lang="ts">
import { isEmpty } from "lodash-es";

import { displayLongDate } from "@/utils/displayDates";
import { useLinkStore } from "@/stores/link";

/**
 * TODO: add a custom toolbar to the editor
 * TODO: Change the links section into an accordian
 */

const route = useRoute();

const linkStore = useLinkStore();

const projectIdentifier = route.params.pidentifier as string;
const versionIdentifier = route.params.videntifier as string;

const projectName = ref("");
const projectDescription = ref("");
const projectImage = ref("");
const projectCreated = ref("");
const projectUpdated = ref("");

const latestVersion = ref(false);

// const allLinks: Ref<LocalLinkType[]> = ref([]);
const allLinks = computed(() => linkStore.links);
const allVersions: Ref<AllVersionsItem[]> = ref([]);

linkStore.resetLinks();

if (versionIdentifier === "new") {
  const { data, error } = await useFetch(`/api/projects/${projectIdentifier}`, {
    headers: useRequestHeaders(["cookie"]),
    method: "GET",
  });

  if (error.value) {
    console.error(error.value);

    // navigateTo("/404");
  }

  if (data.value && "latestVersion" in data.value) {
    const projectData = data.value;

    projectName.value = projectData.name;
    projectDescription.value = projectData.description;
    projectImage.value = projectData.image;
    projectCreated.value = projectData.created;
    projectUpdated.value = projectData.updated;

    if (!isEmpty(projectData.latestVersion)) {
      navigateTo(
        `/projects/${projectIdentifier}/version/${projectData.latestVersion}`
      );
    } else {
      // show new UI
      latestVersion.value = true;
    }
  }
} else {
  const { data, error } = await useFetch(
    `/api/projects/${projectIdentifier}/version/${versionIdentifier}`,
    {
      headers: useRequestHeaders(["cookie"]),
      method: "GET",
    }
  );

  if (error.value) {
    console.error(error.value);

    navigateTo("/404");
  }

  if (data.value && "name" in data.value) {
    const projectData = data.value;

    projectName.value = projectData.name;
    projectDescription.value = projectData.description;
    projectImage.value = projectData.image;
    projectCreated.value = projectData.created;
    projectUpdated.value = projectData.updated;

    if (projectData.versionDetails) {
      if ("latest" in projectData.versionDetails) {
        latestVersion.value = projectData.versionDetails.latest;
      }

      if ("links" in projectData.versionDetails) {
        const data: LocalLinkType[] = [];

        for (const link of projectData.versionDetails.links) {
          data.push({
            ...link,
            original: {
              id: link.id,
              name: link.name,

              description: link.description || "",
              icon: link.icon || "fluent-mdl2:unknown",
              target: link.target,

              type: link.type as LinkTargetType,
            },
            type: link.type as LinkTargetType,
          });
        }

        linkStore.setLinks(data);
      }

      // linkStore.setLinks(allLinks.value); // no idea why this is here
    }

    if (projectData && "versions" in projectData) {
      allVersions.value = projectData.versions as AllVersionsType;
    }
  }
}

useSeoMeta({
  title: `${projectName.value} | Scholar Stack`,
  description: projectDescription.value,
});
</script>

<template>
  <main class="">
    <div class="flex flex-row justify-start space-x-3 bg-secondary px-12 py-12">
      <n-image
        width="250"
        :src="projectImage"
        fallback-src="https://api.dicebear.com/v2/avataaars/seed.svg"
        class="rounded-lg"
      />

      <div class="flex flex-col px-4">
        <h1>{{ projectName }}</h1>

        <p class="mt-3 text-lg">{{ projectDescription }}</p>

        <p class="mt-3 text-sm">
          Created on {{ displayLongDate(projectCreated) }}
        </p>

        <p
          v-if="latestVersion && versionIdentifier !== 'new'"
          class="mt-3 text-sm"
        >
          Updated on {{ displayLongDate(allVersions[0].updated) }}
        </p>
      </div>
    </div>

    <div class="flex flex-row justify-between space-x-8 px-12 py-8">
      <n-tabs type="line" animated>
        <n-tab-pane name="resources" tab="Linked Resources">
          <div class="flex space-x-8">
            <div class="links-section h-max flex-1 py-3">
              <h2 v-if="allLinks.length > 0" class="hidden px-4">
                Linked Resources
              </h2>

              <LinksList
                :latest-version="latestVersion"
                :project-identifier="projectIdentifier"
                :all-versions="allVersions"
              />
            </div>

            <div
              v-show="allVersions.length >= 0"
              class="versions-section mt-5 px-3 py-2"
            >
              <h3 class="text-right text-slate-700">Versions</h3>

              <n-divider />

              <VersionTimeline
                :all-versions="allVersions"
                :project-created="projectCreated"
              />
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="activity" tab="Activity"> Hey Jude </n-tab-pane>
      </n-tabs>
    </div>
  </main>
</template>
